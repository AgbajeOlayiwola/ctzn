import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../lib/google-maps.js', import.meta.url));
const { googleLocationLinks, loadGoogleMaps } = await import(`data:text/javascript;base64,${source.toString('base64')}`);

test('map and panorama links preserve the exact report pin', () => {
  const pin = { lat: 6.5392, lng: 3.3842 };
  const links = googleLocationLinks(pin);
  const map = new URL(links.map);
  const panorama = new URL(links.streetView);
  assert.equal(map.hostname, 'www.google.com');
  assert.equal(map.searchParams.get('api'), '1');
  assert.equal(map.searchParams.get('query'), '6.5392,3.3842');
  assert.equal(panorama.searchParams.get('map_action'), 'pano');
  assert.equal(panorama.searchParams.get('viewpoint'), '6.5392,3.3842');
  assert.ok(googleLocationLinks({ lat: 0, lng: 0 }));
});

test('missing and invalid pins never create misleading Google links', () => {
  for (const pin of [null, {}, { lat: NaN, lng: 0 }, { lat: 91, lng: 0 }, { lat: 0, lng: -181 }, { lat: '6', lng: 3 }]) {
    assert.equal(googleLocationLinks(pin), null);
  }
});

test('concurrent map loads share a single script and resolve through the Google callback', async () => {
  let appended = 0;
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.document = {
    createElement: () => ({ remove() {} }),
    head: { appendChild(script) {
      appended += 1;
      const url = new URL(script.src);
      assert.equal(url.hostname, 'maps.googleapis.com');
      assert.equal(url.searchParams.get('loading'), 'async');
      queueMicrotask(() => { window.google = { maps: { Map: function Map() {} } }; window.ctznGoogleMapsReady(); });
    } },
  };
  try {
    const [first, second] = await Promise.all([loadGoogleMaps('test-key'), loadGoogleMaps('test-key')]);
    assert.equal(appended, 1);
    assert.equal(first, second);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
