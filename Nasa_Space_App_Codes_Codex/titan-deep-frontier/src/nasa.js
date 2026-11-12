// Public, keyless NASA services. No remote data enters the simulation model.
const IMAGE_ENDPOINT = 'https://images-api.nasa.gov/search?q=Titan%20Cassini&media_type=image&page_size=6';
const TITAN_ID = 'urn:nasa:pds:context:target:satellite.saturn.titan';
const PDS_ENDPOINT = `https://pds.nasa.gov/api/search/1/products?limit=6&q=${encodeURIComponent(`ref_lid_target eq "${TITAN_ID}"`)}`;
const DAY = 24 * 60 * 60 * 1000;
const first = value => Array.isArray(value) ? value[0] : value;
const plain = (value, limit = 240) => typeof first(value) === 'string'
  ? first(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, limit) : '';

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

function safeUrl(value, hosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.includes(url.hostname) ? url.href : '';
  } catch { return ''; }
}

function imageKind(data) {
  const title = plain(data.title, 1000);
  const description = plain(data.description_508 || data.description, 4000);
  const explicit = `${title} ${description}`;
  if (/\bartist(?:['’]s)? (?:concept|impression|illustration)|\bartist conception\b/i.test(explicit)) return 'Artist concept (NASA metadata)';
  if (/\bradar\b|\bfalse[ -]color\b|\bvisualization\b|\bcomputer[ -]generated\b|\bsimulated view\b/i.test(title)
    || /\bthis (?:image|view|illustration) (?:is|shows) (?:a )?(?:false[ -]color|computer[ -]generated|simulated)\b/i.test(description)) return 'Visualization / processed image (NASA metadata)';
  if (/\bphotograph\b/i.test(title) || /^this photograph\b/i.test(description)) return 'Photograph (NASA metadata)';
  return 'NASA image (see source for type)';
}

function parseImages(payload) {
  if (!Array.isArray(payload?.collection?.items)) throw new Error('invalid');
  return payload.collection.items.slice(0, 30).flatMap(item => {
    const data = item?.data?.[0];
    if (!data || data.media_type !== 'image' || !plain(data.nasa_id) || !plain(data.title)) return [];
    const links = Array.isArray(item.links) ? item.links : [];
    const candidates = [...links.filter(link => link?.rel === 'preview'), ...links];
    const url = candidates.map(link => safeUrl(link?.href, ['images-assets.nasa.gov'])).find(Boolean);
    if (!url) return [];
    return [{ title: plain(data.title, 120), description: plain(data.description_508 || data.description),
      credit: plain(data.secondary_creator || data.photographer || data.center, 160) || 'Credit not supplied by NASA API',
      kind: imageKind(data), url, source: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}` }];
  }).slice(0, 6);
}

function parseDatasets(payload) {
  if (!Array.isArray(payload?.data)) throw new Error('invalid');
  return payload.data.slice(0, 30).flatMap(item => {
    const id = plain(item?.id, 500);
    const props = item?.properties || {};
    const targetIds = [ ...(Array.isArray(item?.targets) ? item.targets.map(t => t?.id) : []),
      ...(Array.isArray(props.ref_lid_target) ? props.ref_lid_target : []) ];
    // Validate relevance too: some unsupported query parameters are silently ignored.
    if (!id.startsWith('urn:nasa:pds:') || !targetIds.includes(TITAN_ID)) return [];
    const title = plain(item.title || props.title, 160);
    if (!title) return [];
    return [{ title, id, source: `https://pds.nasa.gov/api/search/1/products/${encodeURIComponent(id)}`,
      description: plain(props['pds:Citation_Information.pds:description'] || props.description) || 'No description supplied by the PDS catalog.' }];
  }).slice(0, 6);
}

const CURATED_DATASETS = [{
  title: 'Curated source · Cassini RADAR Data Archive',
  id: 'urn:nasa:pds:cassini-coradar::1.0',
  source: 'https://pds.nasa.gov/ds-view/pds/viewBundle.jsp?identifier=urn%3Anasa%3Apds%3Acassini-coradar&version=1.0',
  description: 'Verified archive reference, not a live search result. Explore the Cassini RADAR archive at NASA PDS.'
}];

function readCache(storage, key, parse) {
  try {
    const cached = JSON.parse(storage?.getItem(key) || 'null');
    if (!Number.isFinite(cached?.at) || cached.at > Date.now() || Date.now() - cached.at > 7 * DAY) return null;
    const items = parse(cached.payload);
    return items.length ? { items, at: cached.at } : null;
  } catch { return null; }
}

async function requestJson(fetcher, url, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const request = async () => {
    const response = await fetcher(url, { signal: controller.signal, headers: { Accept: 'application/json' }, credentials: 'omit' });
    if (!response.ok) throw new Error(response.status === 429 ? 'rate-limit' : `HTTP ${response.status}`);
    try { return await response.json(); } catch { throw new Error('invalid'); }
  };
  try {
    return await Promise.race([request(), new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('timeout')); }, Math.max(1, timeoutMs));
    })]);
  } finally { clearTimeout(timer); }
}

async function load(kind, options = {}) {
  const { fetcher = globalThis.fetch, storage = browserStorage(), timeoutMs = 8000, endpoint = PDS_ENDPOINT, forceRefresh = false } = options;
  const parse = kind === 'images' ? parseImages : parseDatasets;
  const key = `titan.nasa.${kind}.v1`;
  const cache = readCache(storage, key, parse);
  if (!forceRefresh && cache && Date.now() - cache.at < DAY) {
    return { items: cache.items, status: 'cached', message: 'Saved NASA response · cached within the last 24 hours.' };
  }
  let reason;
  try {
    // Only the fixed same-origin relay is an alternative to the official endpoint.
    if (kind === 'datasets' && ![PDS_ENDPOINT, '/api/pds'].includes(endpoint)) throw new Error('invalid endpoint');
    const payload = await requestJson(fetcher, kind === 'images' ? IMAGE_ENDPOINT : endpoint, timeoutMs);
    const items = parse(payload);
    if (!items.length) throw new Error('empty');
    try { storage?.setItem(key, JSON.stringify({ at: Date.now(), payload })); } catch { /* Private browsing and full storage do not block science. */ }
    return { items, status: 'live', message: kind === 'images' ? 'Live NASA Image and Video Library results.' : 'Live NASA PDS Titan catalog records.' };
  } catch (error) {
    reason = error?.message === 'rate-limit' ? 'NASA rate limit reached.'
      : error?.message === 'timeout' || error?.name === 'AbortError' ? 'NASA request timed out.'
      : error?.message === 'empty' ? 'NASA returned no usable Titan results.'
      : error?.message === 'invalid' ? 'NASA returned an unreadable response.'
      : 'NASA connection unavailable (network or browser access restriction).';
  }
  if (cache) return { items: cache.items, status: 'stale', message: `${reason} Showing a previously saved response from ${new Date(cache.at).toISOString().slice(0, 10)}.` };
  return { items: kind === 'datasets' ? CURATED_DATASETS.map(item => ({ ...item })) : [], status: kind === 'datasets' ? 'curated' : 'unavailable',
    message: `${reason} ${kind === 'datasets' ? 'Showing a curated archive link, not live results.' : 'No substitute imagery is shown. Retry when connected.'}` };
}

export const loadImages = (options = {}) => load('images', options);
export const loadDatasets = (options = {}) => load('datasets', options);
