import { parseNewsFeed } from '@/lib/official-news';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const street = params.get('street')?.trim();
  const area = params.get('area')?.trim();
  if (!street || !area || street.length > 100 || area.length > 100 || /[\r\n]/.test(street + area)) return Response.json({ error: 'Supply a street and area, each under 100 characters.' }, { status: 400 });
  // Search only Google News; submitted evidence URLs are never fetched by this server.
  const phrase = (value) => value.replace(/["<>]/g, '').trim();
  const search = new URLSearchParams({ q: `"${phrase(street)}" "${phrase(area)}" when:30d`, hl: 'en-NG', gl: 'NG', ceid: 'NG:en' });
  try {
    const response = await fetch(`https://news.google.com/rss/search?${search}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Unavailable');
    const xml = await response.text();
    if (!xml.includes('<rss')) throw new Error('Invalid response');
    return Response.json({ articles: parseNewsFeed(xml) });
  } catch { return Response.json({ error: 'Recent reporting could not load. Use the search links or attach a source you have found.' }, { status: 502 }); }
}
