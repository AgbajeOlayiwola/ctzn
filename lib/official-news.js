export function newsQuery(name) {
  const alias = { 'Bola Ahmed Tinubu': 'Bola Tinubu', 'Adetokunbo Abiru': 'Tokunbo Abiru' }[name];
  return `${alias ? `("${name}" OR "${alias}")` : `"${name}"`} when:30d`;
}

export function newsSearchUrl(name) {
  return `https://news.google.com/search?${new URLSearchParams({ q: newsQuery(name), hl: 'en-NG', gl: 'NG', ceid: 'NG:en' })}`;
}

function xmlText(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
    const code = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
  }).replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity]));
}

// Read only the text fields of Google's RSS; never render feed HTML.
export function parseNewsFeed(xml, now = Date.now()) {
  const cutoff = now - 30 * 24 * 60 * 60 * 1000;
  const seen = new Set();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]) => {
    const field = (tag) => xmlText(item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`))?.[1]).trim();
    const title = field('title');
    const link = field('link');
    const time = Date.parse(field('pubDate'));
    try {
      const url = new URL(link);
      if (url.protocol !== 'https:' || url.hostname !== 'news.google.com') return [];
    } catch { return []; }
    if (!title || !Number.isFinite(time) || time < cutoff || time > now || seen.has(link)) return [];
    seen.add(link);
    return [{ title, url: link, publisher: field('source'), date: new Date(time).toISOString() }];
  }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
}
