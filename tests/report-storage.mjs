import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../lib/supabase.js', import.meta.url), 'utf8');
let version = 0;
async function adapter(client, configured = true) {
  globalThis.ctznStorageTestClient = client;
  const code = source.replace("import { createClient } from '@supabase/supabase-js';", 'const createClient = () => globalThis.ctznStorageTestClient;')
    .replace('process.env.NEXT_PUBLIC_SUPABASE_URL', configured ? "'https://example.supabase.co'" : "''")
    .replace('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY', "'test-public-key'");
  return import(`data:text/javascript;base64,${Buffer.from(`${code}\n// run ${version++}`).toString('base64')}`);
}
const report = { id: 'report-1', cat: 'dump', street: 'Test street', area: 'Shomolu', state: 'Lagos', lga: 'Shomolu', description: 'Waste observed', lat: 6.5, lng: 3.3, status: 'open', office: 'lawma' };

test('no configured database never claims public publication', async () => {
  const { saveReport } = await adapter(null, false);
  const result = await saveReport(report);
  assert.equal(result.published, false);
  assert.equal(result.report.publication, 'local');
  assert.match(result.error, /device only/);
});

test('a rejected database write preserves a local copy instead of reporting success', async () => {
  const { saveReport } = await adapter({ from: () => ({ insert: async () => ({ error: { message: 'permission denied' } }) }) });
  const result = await saveReport(report);
  assert.equal(result.published, false);
  assert.equal(result.report.id, report.id);
  assert.equal(result.report.publication, 'local');
});

test('a successful database write includes the location and description', async () => {
  let stored;
  let tableName;
  const { saveReport } = await adapter({ from: (name) => { tableName = name; return { insert: async (row) => { stored = row; return { error: null }; } }; } });
  const result = await saveReport(report);
  assert.equal(result.published, true);
  assert.equal(stored.report_state, 'Lagos');
  assert.equal(stored.lga, 'Shomolu');
  assert.equal(stored.description, 'Waste observed');
  assert.equal(tableName, 'ctzn_reports');
});

test('evidence for an unpublished report is never sent to the public database', async () => {
  const { saveEvidence } = await adapter({ from: () => { throw new Error('Must not be called'); } });
  const result = await saveEvidence({ id: 'e1', reportId: 'r1', localOnly: true });
  assert.equal(result.publication, 'local');
});

test('evidence always enters the isolated table as pending, even if a caller asks for verification', async () => {
  let stored;
  let tableName;
  const { saveEvidence } = await adapter({ from: (name) => { tableName = name; return { insert: async (row) => { stored = row; return { error: null }; } }; } });
  const result = await saveEvidence({ id: 'e1', reportId: 'r1', reviewStatus: 'verified' });
  assert.equal(stored.review_status, 'pending');
  assert.equal(result.reviewStatus, 'pending');
  assert.equal(tableName, 'ctzn_report_evidence');
  assert.equal(result.publication, 'published');
});
