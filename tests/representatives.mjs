import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
// Load the dependency-free ES modules without changing the Next.js package type.
async function loadModule(path) {
  const source = await readFile(new URL(path, import.meta.url));
  return import(`data:text/javascript;base64,${source.toString('base64')}`);
}
const { representativeMatches, areaCoverage } = await loadModule('../lib/areas.js');
const { parseNewsFeed, newsQuery } = await loadModule('../lib/official-news.js');

test('area matching keeps Shomolu representatives out of other LGAs and states', () => {
  assert.equal(representativeMatches({ id: 'sen' }, { state: 'Lagos', lga: 'Ikeja' }), false);
  assert.equal(representativeMatches({ id: 'gov' }, { state: 'Oyo', lga: 'Ibadan North' }), false);
  assert.equal(representativeMatches({ id: 'pres' }, { state: 'Oyo', lga: 'Ibadan North' }), true);
  assert.equal(representativeMatches({ id: 'gov' }, { state: 'Lagos', lga: 'Ikeja' }), true);
  assert.equal(representativeMatches({ id: 'sen' }, { state: 'Lagos', lga: ' somolu ' }), true);
  assert.equal(areaCoverage(null).somolu, false);
});

test('ward-specific profiles require the mapped electoral ward', () => {
  const area = { state: 'Lagos', lga: 'Shomolu' };
  for (const id of ['cllr', 'lsha']) {
    assert.equal(representativeMatches({ id }, area), false);
    assert.equal(representativeMatches({ id }, { ...area, ward: 'F' }), true);
    assert.equal(representativeMatches({ id }, { ...area, ward: 'A' }), false);
    assert.equal(representativeMatches({ id }, { ...area, lga: 'Ikeja', ward: 'F' }), false);
  }
});

test('news excludes stale, future, malformed and unsafe entries and removes duplicates', () => {
  const now = Date.parse('2026-11-16T12:00:00Z');
  const item = (title, link, date) => `<item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate><source>Publisher</source></item>`;
  const valid = item('Roads &amp; schools', 'https://news.google.com/rss/articles/1', '2026-11-15');
  const feed = `<rss>${valid}${valid}${item('Old', 'https://news.google.com/rss/articles/2', '2026-09-01')}${item('Future', 'https://news.google.com/rss/articles/3', '2026-11-17')}${item('Unsafe', 'javascript:alert(1)', '2026-11-15')}${item('Invalid', 'https://news.google.com/rss/articles/4', 'invalid')}</rss>`;
  const articles = parseNewsFeed(feed, now);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].title, 'Roads & schools');
  assert.equal(articles[0].publisher, 'Publisher');
  assert.deepEqual(parseNewsFeed('<rss></rss>', now), []);
  assert.match(newsQuery('Adetokunbo Abiru'), /Tokunbo Abiru/);
});
