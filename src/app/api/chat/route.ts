import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { history, message } = await req.json();

    // Build the Gemini-compatible content array
    // History entries from WatchBot use roles 'user' / 'model'
    const contents: { role: string; parts: { text: string }[] }[] = [];

    // Inject prior conversation history
    for (const msg of (history || [])) {
      const role = msg.role === 'model' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: msg.text }] });
    }

    // Append current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const body = {
      systemInstruction: {
        parts: [{
          text: "You are WatchBot, the AI assistant of WatchEX — a cinematic streaming platform. Help users discover movies and TV shows with enthusiasm, suggest genres, give ratings context, and answer anything related to cinema and television. Be concise and friendly. Format lists in markdown. Do not answer questions unrelated to movies, TV, or streaming."
        }]
      },
      contents,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
      }
    };

    // Use gemini-flash-latest via the v1beta API to support systemInstruction without quota locks
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API HTTP Error:', res.status, errText);
      throw new Error(`Gemini API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) throw new Error('Empty response from Gemini');

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('WatchBot API Error:', error.message);
    return NextResponse.json({ error: error.message || 'WatchBot failed' }, { status: 500 });
  }
}
