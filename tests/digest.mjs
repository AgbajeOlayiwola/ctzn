import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CRAWL_SOURCES, NIGERIA_SCOPES } from '../lib/source-catalog.mjs';
import { classifyRating, extractClaimReview, extractPublisherVerdict, makeDigestItem, mergeItems, parseFeed, safePublicUrl, sharePost } from '../lib/digest.mjs';
import { crawl, parseRobots, robotsAllows } from '../scripts/crawl.mjs';

test('source coverage includes every state and the FCT without conflating Niger and Nigeria', () => {
  assert.equal(NIGERIA_SCOPES.length, 37);
  assert.equal(new Set(NIGERIA_SCOPES).size, 37);
  assert.equal(CRAWL_SOURCES.filter((source) => source.kind === 'search').length, 37);
  const item = makeDigestItem({ title: 'Nigeria reports education changes', url: 'https://example.com/a', date: '2026-11-17T00:00:00Z' }, CRAWL_SOURCES[0]);
  assert.equal(item.regions.includes('Niger'), false);
});

test('headline keywords never become verdicts, and unsupported ratings remain unverified', () => {
  const entry = { title: 'False claim circulates online', url: 'https://example.com/a', date: '2026-11-17T00:00:00Z' };
  assert.equal(makeDigestItem(entry, { kind: 'news', name: 'Reporter' }, { verdict: 'false' }).verdict, 'unverified');
  assert.equal(classifyRating('Unproven'), 'unproven');
  assert.equal(classifyRating('Mostly true'), 'misleading');
  assert.equal(classifyRating('6 out of 10'), 'unverified');
});

test('structured checks require a single matched ClaimReview and preserve the publisher rating', () => {
  const node = { '@type': 'ClaimReview', claimReviewed: 'A hospital has opened', reviewRating: { alternateName: 'False' } };
  const script = (data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  const result = extractClaimReview(script({ '@graph': [node] }));
  assert.equal(result.verdict, 'false');
  assert.equal(result.publisherRating, 'False');
  assert.equal(extractClaimReview(script([node, node])), null);
  assert.equal(extractClaimReview('<h1>This is false</h1>'), null);
});

test('feed parsing rejects unsafe, future and stale links; merging preserves checked verdicts', () => {
  const now = Date.parse('2026-11-17T12:00:00Z');
  const item = (url, date) => `<item><title>School &amp; roads</title><link>${url}</link><pubDate>${date}</pubDate></item>`;
  const entries = parseFeed(`<rss>${item('https://example.com/a', '2026-11-16')}${item('javascript:alert(1)', '2026-11-16')}${item('https://example.com/old', '2026-01-01')}</rss>`, now);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, 'School & roads');
  assert.equal(safePublicUrl('https://127.0.0.1/a'), null);
  const merged = mergeItems([{ ...entries[0], verdict: 'false', scope: 'National' }], [{ ...entries[0], verdict: 'unverified', scope: 'Lagos' }], now);
  assert.equal(merged[0].verdict, 'false');
  assert.ok(merged[0].scopes.includes('Lagos'));
});

test('robots rules respect more-specific allow paths and agent groups', () => {
  const policy = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/public\nCrawl-delay: 2');
  assert.equal(robotsAllows(policy, 'https://example.com/private/a'), false);
  assert.equal(robotsAllows(policy, 'https://example.com/private/public/a'), true);
  assert.equal(policy.delay, 2);
});

test('RSS wrappers reveal only safe original links, and explicit verdict parsing is publisher-specific', () => {
  const xml = '<rss><item><title>Abia update</title><link>http://www.bing.com/news/apiclick.aspx?url=https%3A%2F%2Fexample.com%2Fstory</link><pubDate>2026-11-16</pubDate></item></rss>';
  assert.equal(parseFeed(xml, Date.parse('2026-11-17'))[0].url, 'https://example.com/story');
  const html = '<h3><strong>VERDICT</strong></h3><p>The claim that a clip shows Party A is FALSE. It shows Party B.</p>';
  assert.equal(extractPublisherVerdict(html, 'factcheckhub').verdict, 'false');
  assert.equal(extractPublisherVerdict(html, 'news'), null);
  assert.equal(extractPublisherVerdict('<h1>False story</h1>', 'factcheckhub'), null);
});

test('share text retains uncertainty, source date and link', () => {
  const item = { title: 'A headline '.repeat(40), verdict: 'unverified', date: '2026-11-17T00:00:00Z', url: 'https://example.com/article' };
  const post = sharePost(item);
  assert.match(post, /Not yet verified/);
  assert.match(post, /2026-11-17/);
  assert.match(post, /https:\/\/example.com\/article/);
  assert.ok(post.replace(item.url, 'x'.repeat(23)).length <= 280);
});

test('a failed source retains prior items and failed runs do not claim a successful refresh', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ctzn-crawler-test-'));
  const now = Date.parse('2026-11-17T12:00:00Z');
  const source = { id: 'test', name: 'Test feed', kind: 'news', scope: 'National', url: 'https://example.com/feed' };
  try {
    await crawl({ directory, now, sources: [source], reader: async () => ({ text: '<rss><item><title>Education update</title><link>https://example.com/news</link><pubDate>2026-11-16</pubDate></item></rss>' }) });
    const previous = JSON.parse(await readFile(join(directory, 'latest.json'), 'utf8'));
    const next = await crawl({ directory, now, sources: [source], reader: async () => { throw Error('offline'); } });
    assert.equal(next.items.length, 1);
    assert.equal(next.updatedAt, previous.updatedAt);
    assert.equal(next.lastRun.successes, 0);
    assert.equal(next.sources[0].state, 'failed');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
