import { NIGERIA_SCOPES } from './source-catalog.mjs';
import { DIGEST_NOTES } from './digest-notes.mjs';

export const VERDICTS = {
  false: { label: 'Publisher rates false', simple: 'The fact-checker says the claim is wrong. Read its evidence before sharing the claim as fact.' },
  misleading: { label: 'Publisher rates misleading', simple: 'Some details may be real, but the way they are presented can give the wrong idea. Context matters.' },
  true: { label: 'Publisher rates true', simple: 'The fact-checker says the specific claim matches its evidence. That does not make every related claim true.' },
  unproven: { label: 'Publisher says not proven', simple: 'There is not enough evidence to settle the claim. Not proven does not mean false.' },
  unverified: { label: 'Not fact-checked by ctzn', simple: 'This is a report to read, not a claim we have proved. Check the original source and date before passing it on.' },
};

export function cleanText(text = '') {
  return String(text).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const v = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n); return v > 0 && v <= 0x10ffff ? String.fromCodePoint(v) : ''; })
    .replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, n) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[n])).replace(/\s+/g, ' ').trim();
}

export function safePublicUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)) return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
    return url.toString();
  } catch { return null; }
}

export function classifyRating(rating) {
  const value = cleanText(rating).toLowerCase().replace(/[.!]$/, '');
  if (['false', 'incorrect', 'fake'].includes(value)) return 'false';
  if (['misleading', 'mostly false', 'partly false', 'partly true', 'half true', 'mostly true'].includes(value)) return 'misleading';
  if (['true', 'correct'].includes(value)) return 'true';
  if (['unproven', 'unsubstantiated', 'insufficient evidence', 'no evidence', 'unverified'].includes(value)) return 'unproven';
  return 'unverified';
}

export function parseFeed(xml, now = Date.now()) {
  return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].flatMap(([, , block]) => {
    const field = (tag) => cleanText(block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]);
    const rawLink = field('link') || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1];
    let url = safePublicUrl(rawLink);
    // Bing RSS uses an HTTP click wrapper. Read its original HTTPS URL without
    // following or fetching the wrapper or allowing arbitrary HTTP links.
    try { const wrapper = new URL(rawLink); if (['www.bing.com', 'bing.com'].includes(wrapper.hostname) && wrapper.pathname === '/news/apiclick.aspx') url = safePublicUrl(wrapper.searchParams.get('url')); } catch { /* invalid links are omitted */ }
    const date = Date.parse(field('pubDate') || field('published') || field('updated') || field('dc:date'));
    const title = field('title').slice(0, 350);
    if (!url || !title || !Number.isFinite(date) || date > now || date < now - 30 * 86400000) return [];
    return [{ url, title, date: new Date(date).toISOString(), publisher: field('source') || field('News:Source') }];
  }).slice(0, 8);
}

export function extractClaimReview(html) {
  const nodes = [];
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if ([].concat(value['@type'] || []).includes('ClaimReview')) nodes.push(value);
    if (value['@graph']) visit(value['@graph']);
  }
  for (const [, json] of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(json)); } catch { /* malformed structured data stays unverified */ }
  }
  // A page containing multiple different reviewed claims needs editorial matching.
  if (nodes.length !== 1) return null;
  const node = nodes[0];
  const claim = cleanText(node.claimReviewed).slice(0, 350);
  const rating = cleanText(node.reviewRating?.alternateName || node.reviewRating?.name).slice(0, 100);
  if (!claim || !rating) return null;
  return { claim, publisherRating: rating, verdict: classifyRating(rating), basis: 'Publisher ClaimReview structured data' };
}

export function extractPublisherVerdict(html, sourceId) {
  if (sourceId !== 'factcheckhub') return null;
  const sections = [...html.matchAll(/<h[1-6][^>]*>\s*(?:<strong[^>]*>)?\s*VERDICT\s*(?:<\/strong>)?\s*<\/h[1-6]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
  if (sections.length !== 1) return null;
  const text = cleanText(sections[0][1]);
  // An explicit publisher assertion in a labelled verdict section is required.
  const match = text.match(/^(?:The|This) claim (?:that )?(.{1,400}?) (?:is|was) (FALSE|MISLEADING|TRUE|UNPROVEN|UNSUBSTANTIATED)\./i);
  if (!match) return null;
  return { claim: match[1], publisherRating: match[2], verdict: classifyRating(match[2]), basis: 'Publisher’s explicitly labelled verdict paragraph' };
}

export function makeDigestItem(entry, source, review = null) {
  // Only designated fact-checking sources can supply a structured verdict.
  const accepted = source.kind === 'factcheck' ? review : null;
  const note = accepted && DIGEST_NOTES[entry.url]?.verdict === accepted.verdict ? DIGEST_NOTES[entry.url] : null;
  return {
    ...entry, id: entry.url, sourceId: source.id, sourceName: source.name, sourceKind: source.kind,
    scope: source.scope, scopeBasis: source.kind === 'search' ? 'Search coverage, not a verified event location' : 'National publisher',
    claim: accepted?.claim || null, publisherRating: accepted?.publisherRating || null,
    verdict: accepted?.verdict || 'unverified', explanation: note?.explanation || VERDICTS[accepted?.verdict || 'unverified'].simple,
    simpleReviewed: !!note, simpleReviewedAt: note?.reviewedAt || null,
    verificationBasis: accepted ? `${accepted.basis || 'Publisher rating'}; not an independent ctzn investigation` : 'No matched explicit publisher verdict; no truth judgement inferred from the headline',
    regions: NIGERIA_SCOPES.filter((state) => new RegExp(`\\b${state === 'Federal Capital Territory' ? '(Abuja|FCT|Federal Capital Territory)' : state}\\b`, 'i').test(entry.title)),
  };
}

export function mergeItems(previous, incoming, now = Date.now()) {
  const result = new Map();
  for (const item of [...previous, ...incoming]) {
    if (!safePublicUrl(item.url) || Date.parse(item.date) < now - 30 * 86400000 || Date.parse(item.date) > now || !Number.isFinite(Date.parse(item.date))) continue;
    const old = result.get(item.url);
    if (!old || item.verdict !== 'unverified' || old.verdict === 'unverified') result.set(item.url, { ...item, scopes: [...new Set([...(old?.scopes || []), ...(item.scopes || []), item.scope].filter(Boolean))] });
    else old.scopes = [...new Set([...(old.scopes || []), item.scope].filter(Boolean))];
  }
  return [...result.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 600);
}

export function sharePost(item) {
  const verdict = VERDICTS[item.verdict] || VERDICTS.unverified;
  const label = item.publisherRating ? `${item.sourceName.slice(0, 30)}: ${item.publisherRating.slice(0, 24)}` : 'Not yet verified';
  const context = item.simpleReviewed ? item.explanation : item.claim ? `Claim: ${item.claim}` : item.title;
  const prefix = item.simpleReviewed ? `${label}.\n` : `${label}. ${verdict.simple}\n`;
  // X normally reserves 23 characters per URL. Retain the verdict and source date.
  const suffix = `\nSource (${item.date.slice(0, 10)}): ${item.url}`;
  const budget = Math.max(0, 280 - prefix.length - ('\nSource (YYYY-MM-DD): '.length + 23) - 1);
  const short = context.length > budget ? context.slice(0, Math.max(0, budget - 1)) + '…' : context;
  return prefix + short + suffix;
}
