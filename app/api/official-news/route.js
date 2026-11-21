import { CHAIN, MINISTERS } from '@/lib/data';
import { newsQuery, parseNewsFeed } from '@/lib/official-news';

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id');
  const person = [...CHAIN, ...MINISTERS].find((p) => p.id && p.id === id);
  if (!person) return Response.json({ error: 'Unknown official' }, { status: 400 });
  const params = new URLSearchParams({ q: newsQuery(person.name), hl: 'en-NG', gl: 'NG', ceid: 'NG:en' });
  try {
    const response = await fetch(`https://news.google.com/rss/search?${params}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('News unavailable');
    const xml = await response.text();
    if (!xml.includes('<rss')) throw new Error('Invalid feed');
    return Response.json({ articles: parseNewsFeed(xml), checkedAt: new Date().toISOString() });
  } catch {
    return Response.json({ error: 'Recent news is temporarily unavailable. Use the news search link below.' }, { status: 502 });
  }
}
