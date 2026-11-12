import test from 'node:test';
import assert from 'node:assert/strict';
import { loadImages, loadDatasets } from '../src/nasa.js';

const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
};
const imagePayload = (url = 'https://images-assets.nasa.gov/image/PIA08110/PIA08110~thumb.jpg') => ({ collection: { items: [{
  data: [{ title: 'Titan Viewed by Cassini Radar', nasa_id: 'PIA08110', media_type: 'image', description: 'Radar observation', secondary_creator: 'NASA/JPL-Caltech/ASI' }],
  links: [{ rel: 'preview', href: url }]
}] } });
const response = payload => async () => ({ ok: true, json: async () => payload });
const datasetPayload = { data: [{ id: 'urn:nasa:pds:cassini-uvis_titan-library:context::1.0', title: 'Cassini UVIS Titan Library Context collection file',
  targets: [{ id: 'urn:nasa:pds:context:target:satellite.saturn.titan' }], properties: { description: ['Context collection for the Cassini UVIS Titan Library bundle.'] } }] };

test('images preserve NASA metadata and cache a successful response', async () => {
  const storage = memory();
  const result = await loadImages({ fetcher: response(imagePayload()), storage });
  assert.equal(result.status, 'live');
  assert.equal(result.items[0].credit, 'NASA/JPL-Caltech/ASI');
  const cached = await loadImages({ storage, fetcher: () => { throw Error('must not fetch'); } });
  assert.equal(cached.status, 'cached');
  assert.deepEqual(cached.items, result.items);
});

test('force refresh bypasses a fresh cache but keeps it as an outage fallback', async () => {
  const storage = memory();
  await loadImages({ fetcher: response(imagePayload()), storage });
  let calls = 0;
  const refreshed = await loadImages({ forceRefresh: true, storage, fetcher: async () => {
    calls += 1;
    return response(imagePayload('https://images-assets.nasa.gov/image/NEW/NEW~thumb.jpg'))();
  } });
  assert.equal(calls, 1);
  assert.equal(refreshed.status, 'live');
  assert.match(refreshed.items[0].url, /NEW/);
  const fallback = await loadImages({ forceRefresh: true, storage, fetcher: async () => { throw Error('offline'); } });
  assert.equal(fallback.status, 'stale');
  assert.match(fallback.items[0].url, /NEW/);
});

test('PDS parses real response structure and rejects records unrelated to Titan', async () => {
  const result = await loadDatasets({ fetcher: response(datasetPayload), storage: null });
  assert.equal(result.status, 'live');
  assert.match(result.items[0].id, /cassini-uvis/);
  const unrelated = await loadDatasets({ fetcher: response({ data: [{ ...datasetPayload.data[0], targets: [] }] }), storage: null });
  assert.equal(unrelated.status, 'curated');
  assert.match(unrelated.message, /not live results/);
});

test('same-origin PDS relay retains NASA parsing and target validation', async () => {
  let requested;
  const result = await loadDatasets({ endpoint: '/api/pds', storage: null, fetcher: async url => {
    requested = url;
    return { ok: true, json: async () => datasetPayload };
  } });
  assert.equal(requested, '/api/pds');
  assert.equal(result.status, 'live');
  assert.deepEqual(result.items, (await loadDatasets({ fetcher: response(datasetPayload), storage: null })).items);
  const invalid = await loadDatasets({ endpoint: '/api/pds', storage: null, fetcher: response({ data: [{ ...datasetPayload.data[0], targets: [] }] }) });
  assert.equal(invalid.status, 'curated');
});

test('image type labels require explicit metadata and preserve an unspecified default', async () => {
  for (const [title, description, expected] of [
    ['Titan Viewed by Cassini Radar', '', 'Visualization / processed image (NASA metadata)'],
    ['Titan', "This artist’s concept depicts a future lander.", 'Artist concept (NASA metadata)'],
    ['Photograph of Titan', '', 'Photograph (NASA metadata)'],
    ['Titan', 'A view of Titan.', 'NASA image (see source for type)'],
  ]) {
    const payload = imagePayload();
    Object.assign(payload.collection.items[0].data[0], { title, description });
    const result = await loadImages({ storage: null, fetcher: response(payload) });
    assert.equal(result.items[0].kind, expected);
  }
});

test('unsafe image protocols and host lookalikes are rejected', async () => {
  for (const url of ['javascript:alert(1)', 'https://images-assets.nasa.gov.evil.test/a.jpg', 'https://user:pass@images-assets.nasa.gov/a.jpg', 'http://images-assets.nasa.gov/a.jpg']) {
    const result = await loadImages({ fetcher: response(imagePayload(url)), storage: null });
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.items, []);
  }
});

test('429, invalid JSON, malformed payload and empty results degrade honestly', async () => {
  for (const fetcher of [async () => ({ ok: false, status: 429 }), async () => ({ ok: true, json: async () => { throw Error('bad JSON'); } }), response({}), response({ collection: { items: [] } })]) {
    const result = await loadImages({ fetcher, storage: null });
    assert.equal(result.status, 'unavailable');
    assert.equal(result.items.length, 0);
  }
  const limited = await loadImages({ fetcher: async () => ({ ok: false, status: 429 }), storage: null });
  assert.match(limited.message, /rate limit/);
});

test('deadline settles even when a fetcher ignores AbortSignal', async () => {
  const result = await loadImages({ fetcher: () => new Promise(() => {}), storage: null, timeoutMs: 5 });
  assert.equal(result.status, 'unavailable');
  assert.match(result.message, /timed out/);
});

test('stale cache is identified and expired or corrupt caches are discarded', async () => {
  const storage = memory();
  const key = 'titan.nasa.images.v1';
  const fetcher = async () => { throw Error('offline'); };
  storage.setItem(key, JSON.stringify({ at: Date.now() - 2 * 86400000, payload: imagePayload() }));
  assert.equal((await loadImages({ fetcher, storage })).status, 'stale');
  storage.setItem(key, JSON.stringify({ at: Date.now() - 8 * 86400000, payload: imagePayload() }));
  assert.equal((await loadImages({ fetcher, storage })).status, 'unavailable');
  storage.setItem(key, 'broken-json');
  assert.equal((await loadImages({ fetcher, storage })).status, 'unavailable');
});

test('blocked browser storage does not prevent a live result', async () => {
  const storage = { getItem() { throw Error('denied'); }, setItem() { throw Error('full'); } };
  assert.equal((await loadImages({ storage, fetcher: response(imagePayload()) })).status, 'live');
});
