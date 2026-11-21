import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
async function load(path) { const code = await readFile(new URL(path, import.meta.url)); return import(`data:text/javascript;base64,${code.toString('base64')}`); }
const { OFFICIAL_RECORDS, RECORD_SOURCE_TYPES, validateOfficialSuggestion } = await load('../lib/official-records.js');
const { CHAIN, OFFICES, TASKS } = await load('../lib/data.js');

test('chairman correction reaches role listing, responsibility and learning tasks', () => {
  assert.equal(CHAIN.find((person) => person.id === 'chair').name, 'Lateef Ashimi');
  assert.match(OFFICES.lg.who, /Lateef Ashimi/);
  assert.ok(!TASKS.some((task) => /Is Abdulhammed Salawu the current/.test(task.title)));
});

test('every elected profile has a coverage record and every published item has a source and date', () => {
  for (const person of CHAIN.filter((entry) => entry.id)) assert.ok(OFFICIAL_RECORDS[person.id], person.id);
  for (const profile of Object.values(OFFICIAL_RECORDS)) {
    for (const item of [...profile.background, ...profile.items]) {
      assert.ok(RECORD_SOURCE_TYPES[item.kind]);
      assert.equal(new URL(item.source.url).protocol, 'https:');
      assert.ok(item.source.publisher);
    }
    for (const item of profile.items) {
      assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(item.dateLabel);
    }
  }
});

test('claims remain self-reported and first reading is not presented as enactment', () => {
  assert.equal(OFFICIAL_RECORDS.sen.items.find((item) => item.id === 'abiru-bills').kind, 'self');
  assert.equal(OFFICIAL_RECORDS.chair.items[0].kind, 'self');
  assert.equal(OFFICIAL_RECORDS.rep.items[0].stage, 'First reading only');
  assert.match(OFFICIAL_RECORDS.rep.items[0].context, /not enactment/);
  assert.equal(OFFICIAL_RECORDS.cllr.items.length, 0);
  assert.equal(OFFICIAL_RECORDS.vp.items.length, 0);
});

test('official suggestions require a safe source, valid date and listed official', () => {
  const entry = { officialId: 'chair', title: 'Source correction', summary: 'The dated source reports a public action.', claimedKind: 'news', url: 'https://example.org/report', date: '2026-11-17' };
  assert.equal(validateOfficialSuggestion(entry, '2026-11-17'), '');
  for (const change of [{ officialId: 'unknown' }, { url: 'javascript:alert(1)' }, { date: '2026-02-30' }, { date: '2026-11-18' }, { claimedKind: 'verified' }, { summary: '' }]) assert.notEqual(validateOfficialSuggestion({ ...entry, ...change }, '2026-11-17'), '');
});
