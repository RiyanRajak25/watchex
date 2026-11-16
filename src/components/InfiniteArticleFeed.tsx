'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useInView } from 'framer-motion';

interface ArticleData {
  title: string;
  content: string;
  article_slug: string;
  created_at: string;
}

interface InfiniteArticleFeedProps {
  movieId: string | number;
  mediaType: string;
  initialSlug: string;
  movieTitle: string;
}

export function InfiniteArticleFeed({ movieId, mediaType, initialSlug, movieTitle }: InfiniteArticleFeedProps) {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentSlugs, setCurrentSlugs] = useState<Set<string>>(new Set([initialSlug]));

  const observerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(observerRef, { once: false, amount: 0.1 });

  // Load next article when scrolling hits the bottom observer
  useEffect(() => {
    if (isInView && !loading && hasMore) {
      loadNextArticle();
    }
  }, [isInView]);

  const loadNextArticle = async () => {
    setLoading(true);
    try {
      // Build an exclusion list of slugs already in the DOM
      const excludeParam = Array.from(currentSlugs).join(',');
      
      // But our simple API currently only drops a single excludeSlug.
      // To strictly avoid duplicates over infinite scrolls, we really should pass all of them,
      // but for V1 we'll just check client-side loop dropping or modify the API.
      // Let's pass the first slug for now, and filter out repeats below.
      
      const res = await fetch(`/api/articles/next?movieId=${movieId}&mediaType=${mediaType}&excludeSlug=${encodeURIComponent(initialSlug)}`);
      const data = await res.json();

      if (data.article) {
        // Prevent dupes if API somehow returned one we already have
        if (currentSlugs.has(data.article.article_slug)) {
          setHasMore(false); // We exhausted uniqueness
        } else {
          setArticles(prev => [...prev, data.article]);
          const newSlugs = new Set(currentSlugs);
          newSlugs.add(data.article.article_slug);
          setCurrentSlugs(newSlugs);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load next article:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup intersection observers for individual articles to update the URL (History State hijack)
  useEffect(() => {
    if (articles.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slug = entry.target.getAttribute('data-slug');
          if (slug && slug !== window.location.pathname.split('/').pop()) {
            const newUrl = `/${mediaType === 'movie' ? 'movie' : 'tv'}/${movieId}/${slug}`;
            window.history.pushState(null, '', newUrl);
            // Optionally dispatch a custom event if Google Analytics needs a manual pageview ping
          }
        }
      });
    }, { threshold: 0.6 }); // Triggers when 60% of the article is in view

    // Query all article wrappers and observe them
    document.querySelectorAll('.infinite-article-wrapper').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [articles, movieId, mediaType]);

  if (articles.length === 0 && !loading) {
    return <div ref={observerRef} className="h-24 w-full" />; // Trigger zone
  }

  return (
    <>
      <div className="w-full h-px bg-white/10 my-16" />
      
      {articles.map((article, idx) => (
        <div 
          key={article.article_slug} 
          className="infinite-article-wrapper mb-20 relative"
          data-slug={article.article_slug}
        >
          <header className="mb-12">
            <div className="inline-block px-3 py-1 bg-accent/20 border border-accent/20 rounded-full text-accent text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
              Up Next: {article.article_slug.replace(/-/g, ' ')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              {article.title}
            </h2>
          </header>

          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:text-white prose-a:text-accent prose-strong:text-white/90">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>
          
          <div className="w-48 h-px bg-white/10 mx-auto mt-24" />
        </div>
      ))}

      {/* The trigger element at the bottom of the feed */}
      {hasMore && (
        <div ref={observerRef} className="h-32 flex items-center justify-center">
          {loading && (
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
