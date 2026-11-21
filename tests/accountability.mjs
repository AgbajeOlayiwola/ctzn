import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
async function load(path) { const source = await readFile(new URL(path, import.meta.url)); return import(`data:text/javascript;base64,${source.toString('base64')}`); }
const { responsibilityFor, complaintEmail } = await load('../lib/accountability.js');
const { validateEvidence } = await load('../lib/evidence.js');

test('waste complaints use the published LAWMA inbox only for confirmed Lagos reports', () => {
  const lagos = responsibilityFor('dump', null, 'Lagos', 'Shomolu');
  assert.equal(lagos.email, 'info@lawma.gov.ng');
  assert.match(lagos.summary, /public authority/);
  assert.match(lagos.chain.join(' '), /Tokunbo Wahab/);
  assert.equal(responsibilityFor('dump', null, 'Oyo').email, undefined);
  assert.equal(responsibilityFor('dump', null, '').email, undefined);
  assert.equal(complaintEmail({}, responsibilityFor('dump', null, 'Oyo')), null);
});

test('road routing exposes uncertainty instead of inventing a contractor or email', () => {
  const road = responsibilityFor('road', 'federal', 'Lagos', 'Shomolu');
  assert.match(road.agency, /Federal/);
  assert.match(road.summary, /do not prove ownership/);
  assert.equal(road.email, undefined);
});

test('email drafts retain the report and map reference without claiming delivery', () => {
  const draft = complaintEmail({ id: 'r1', street: 'A & B Road', area: 'Shomolu', state: 'Lagos', lat: 6.5, lng: 3.3, description: 'Waste blocks the street' }, responsibilityFor('dump', null, 'Lagos'));
  assert.equal(draft.recipient, 'info@lawma.gov.ng');
  assert.match(draft.body, /Reference: r1/);
  assert.match(draft.body, /query=6.5,3.3/);
  assert.match(decodeURIComponent(draft.href), /A & B Road/);
});

test('source validation rejects unsafe URLs, impossible dates and unsupported claims', () => {
  const entry = { reportId: 'r1', sourceType: 'news', claimedStatus: 'stalled', url: 'https://www.wearegst.com/story', sourceDate: '2026-11-17', note: 'Video at 01:20 shows the site; contractor is not identified.' };
  assert.equal(validateEvidence(entry, '2026-11-17'), '');
  for (const change of [{ url: 'javascript:alert(1)' }, { url: 'http://example.com' }, { sourceDate: '2026-02-30' }, { sourceDate: '2026-11-18' }, { claimedStatus: 'proven-abandoned' }, { note: '' }]) {
    assert.notEqual(validateEvidence({ ...entry, ...change }, '2026-11-17'), '');
  }
});
