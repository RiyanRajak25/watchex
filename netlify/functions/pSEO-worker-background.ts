import type { Config, Context } from "@netlify/functions"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// ─── Self-contained TMDB Fetch (no Next.js dependency) ───────────────────────
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!TMDB_ACCESS_TOKEN) {
    console.warn(`[pSEO] TMDB_ACCESS_TOKEN is missing. Skipping fetch for ${endpoint}`);
    return { results: [] };
  }
  const queryParams = new URLSearchParams(params).toString();
  const url = `${TMDB_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
    });

    if (!response.ok) {
      console.error(`[pSEO] TMDB fetch error: ${response.status} ${response.statusText} on ${url}`);
      return { results: [] };
    }
    return response.json();
  } catch (error) {
    console.error(`[pSEO] TMDB fetch failed for ${url}`, error);
    return { results: [] };
  }
}

async function getTrending(type: 'movie' | 'tv' | 'all', timeWindow: 'day' | 'week') {
  return fetchTMDB(`/trending/${type}/${timeWindow}`);
}

async function getDetails(type: 'movie' | 'tv', id: string) {
  return fetchTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos,recommendations' });
}

// ─── Supabase & Gemini Clients ───────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.PSEO_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '');
// Google API completely removed/deprecated 1.5-flash for new keys, and 2.0-flash sometimes locks at limit: 0 natively. gemini-flash-latest dynamically binds to the active quota-enabled model.
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: "application/json" } });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Google Indexing API ─────────────────────────────────────────────────────
const INDEXING_DAILY_LIMIT = 190;
const BASE_URL = 'https://watchex.com';

async function getIndexingAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Handle escaped newlines from environment variables
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  try {
    const jwtClient = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );
    await jwtClient.authorize();
    return jwtClient;
  } catch (error: any) {
    console.error('[pSEO] Failed to authenticate Google Indexing API:', error.message);
    return null;
  }
}

async function checkAndIncrementQuota(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // Upsert today's record
    const { data, error } = await supabase
      .from('indexing_tracking')
      .upsert({ date: today }, { onConflict: 'date' })
      .select('push_count')
      .single();

    if (error) throw error;

    if (data && data.push_count >= INDEXING_DAILY_LIMIT) {
      console.warn(`[pSEO] Indexing API daily quota (${INDEXING_DAILY_LIMIT}) reached. Skipping push.`);
      return false;
    }

    // Increment
    await supabase.rpc('increment_indexing_count', { row_date: today });
    // Workaround if RPC is missing, fall back to update (potential race condition, but fine for SEO limits)
    await supabase
      .from('indexing_tracking')
      .update({ push_count: (data?.push_count || 0) + 1 })
      .eq('date', today);

    return true;
  } catch (err: any) {
    console.error('[pSEO] Failed to check indexing quota:', err.message);
    return false; // Fail safe, don't index
  }
}

async function pushToIndex(url: string, jwtClient: any) {
  if (!jwtClient) return;

  const canPush = await checkAndIncrementQuota();
  if (!canPush) return;

  const indexing = google.indexing('v3');
  
  try {
    const res = await indexing.urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    console.log(`[pSEO] 🕷️ Successfully pushed to Indexing API: ${url} (Status: ${res.status})`);
  } catch (error: any) {
    console.error(`[pSEO] ❌ Indexing API push failed for ${url}:`, error.message);
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req: Request, context: Context) {
  console.log("[pSEO] Starting Background execution...");
  
  try {
    const jwtClient = await getIndexingAuth();
    if (!jwtClient) console.log("[pSEO] ⚠️ Google Indexing API not configured or auth failed.");

    const [trendingMovies, trendingTV] = await Promise.all([
      getTrending('movie', 'day'),
      getTrending('tv', 'day')
    ]);

    // Batch Size: 2 Movies and 2 TV Shows (4 total * 3 articles = 12 requests per run)
    // Running every 15 mins (96 runs/day) = 1152 requests per day (safely under 1500 RPD limit)
    const movies = (trendingMovies.results || []).slice(0, 2).map((m: any) => ({ ...m, type: 'movie' }));
    const tvShows = (trendingTV.results || []).slice(0, 2).map((t: any) => ({ ...t, type: 'tv' }));
    const combinedMedia = [...movies, ...tvShows];

    if (combinedMedia.length === 0) {
      console.log('[pSEO] No trending media found.');
      return new Response('No trending media found', { status: 200 });
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const rawMedia of combinedMedia) {
      try {
        const mediaId = rawMedia.id;
        const mediaType = rawMedia.type;

        const media = await getDetails(mediaType, mediaId.toString());
        if (!media || (!media.title && !media.name)) {
          console.log(`[pSEO] Skipping ${mediaId} - no title/name found`);
          continue;
        }

        const title = mediaType === 'movie' ? media.title : media.name;
        const releaseYear = (mediaType === 'movie' ? media.release_date : media.first_air_date || '').split('-')[0];
        const overview = media.overview || 'No overview available.';
        const cast = media.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(', ') || 'Unknown cast';
        const genres = media.genres?.map((g: any) => g.name).join(', ') || 'Unknown genres';

        // Extract Trailer Key for Phase 4 Sticky PiP Player
        const trailer_key = media.videos?.results?.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        )?.key || null;

        console.log(`[pSEO] Processing: ${title} (${mediaType}, ID: ${mediaId})`);

        // Upsert into movie_cache
        const { error: cacheError } = await supabase.from('movie_cache').upsert({
          id: mediaId,
          media_type: mediaType,
          title,
          overview,
          release_year: releaseYear,
          poster_path: media.poster_path,
          trailer_key: trailer_key, // Save the trailer!
          processed: true
        }, { onConflict: 'id, media_type' });

        if (cacheError) {
          console.error(`[pSEO] Cache upsert failed for ${title}:`, cacheError.message);
        } else {
          // Trigger Indexing for the Parent Route organically
          // By indexing this, Google crawls the sub-articles dynamically linked on this page.
          await pushToIndex(`${BASE_URL}/${mediaType}/${mediaId}`, jwtClient);

          // If Movie, also index the Movies Like page to push the recommendation clusters
          if (mediaType === 'movie') {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            await pushToIndex(`${BASE_URL}/movies-like/${slug}-${mediaId}`, jwtClient);
          }
        }

        // Article targets
        const targetArticles = [
          { slug: 'ending-explained', context: 'Explain the deeper meaning of the ending and resolve any ambiguous plot threads.' },
          { slug: 'fan-theories', context: 'Provide the top 3 most popular and plausible fan theories surrounding the movie.' },
          { slug: 'parents-guide', context: 'Provide a detailed breakdown of age rating, violence, profanity, and themes for parents.' }
        ];

        for (const target of targetArticles) {
          // Check for existing article
          const { data: existing } = await supabase
            .from('generated_articles')
            .select('id')
            .eq('movie_id', mediaId)
            .eq('media_type', mediaType)
            .eq('article_slug', target.slug)
            .maybeSingle();

          if (existing) {
            skippedCount++;
            continue; // Already generated
          }

          console.log(`[pSEO] Generating ${target.slug} for ${title}...`);

          const prompt = `
          You are an expert film critic and SEO content writer. Write a comprehensive, highly-engaging article for the ${mediaType === 'tv' ? 'TV show' : 'movie'}:
          Title: ${title} (${releaseYear})
          Genres: ${genres}
          Cast: ${cast}
          Plot: ${overview}

          TASK:
          ${target.context}

          OUTPUT EXPECTATION:
          Provide ONLY a valid JSON object. Do not include Markdown blocks like \`\`\`json.
          The JSON schema MUST exactly be:
          {
             "title": "A catchy, SEO optimized title for this specific focus",
             "content": "The full article formatted in Markdown. Start with an introduction, use headers (##), bullet points, and strong paragraphs."
          }
          `;

          let retries = 0;
          const maxRetries = 3;
          let success = false;

          while (retries < maxRetries && !success) {
            try {
              const result = await model.generateContent(prompt);
              let responseText = result.response.text();

              // Strip markdown wrappers if Gemini adds them
              if (responseText.startsWith('```json')) {
                responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
              } else if (responseText.startsWith('```')) {
                responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
              }

              const parsed = JSON.parse(responseText);

              if (parsed.title && parsed.content) {
                const { error: insertError } = await supabase.from('generated_articles').insert({
                  movie_id: mediaId,
                  media_type: mediaType,
                  article_slug: target.slug,
                  title: parsed.title,
                  content: parsed.content,
                });

                if (insertError) {
                  console.error(`[pSEO] DB insert failed for ${title} - ${target.slug}:`, insertError.message);
                } else {
                  processedCount++;
                  console.log(`[pSEO] ✅ Inserted ${target.slug} for ${title}`);
                }
              } else {
                console.warn(`[pSEO] LLM returned empty title/content for ${title} - ${target.slug}`);
              }

              success = true;
              // Throttle to 6s between successful calls to stay safely under 15 RPM limits
              await delay(6000);
            } catch (err: any) {
              const errorMessage = err.message || err.toString();
              console.error(`[pSEO] ❌ LLM failed for ${title} - ${target.slug} (Attempt ${retries + 1}): ${errorMessage}`);
              
              retries++;
              if (retries >= maxRetries) {
                console.error(`[pSEO] 🚨 Max retries reached for ${target.slug}. Skipping.`);
                await delay(5000);
                break;
              }

              // Parse "Please retry in X.XXs"
              const match = errorMessage.match(/Please retry in (\d+(?:\.\d+)?)s/);
              if (match) {
                const waitTimeMs = Math.ceil(parseFloat(match[1])) * 1000 + 2000; // Add 2 seconds padding
                console.log(`[pSEO] ⏳ Rate limited. Waiting for ${waitTimeMs}ms before retrying...`);
                await delay(waitTimeMs);
              } else if (errorMessage.includes('429') || errorMessage.includes('Quota')) {
                console.log(`[pSEO] ⏳ Rate limited (no parsed time). Waiting for 35000ms...`);
                await delay(35000);
              } else {
                // For other errors, wait a generic amount
                await delay(10000);
              }
            }
          }
        }
      } catch (itemError: any) {
        console.error(`[pSEO] ❌ CRITICAL: Item ${rawMedia.id} failed: ${itemError.message || itemError}`);
        continue;
      }
    }

    console.log(`[pSEO] ✅ Complete! Processed: ${processedCount} new articles, Skipped: ${skippedCount} existing.`);
    return new Response(JSON.stringify({ processed: processedCount, skipped: skippedCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[pSEO] ❌ Fatal error:', error.message || error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "*/15 * * * *",
};
