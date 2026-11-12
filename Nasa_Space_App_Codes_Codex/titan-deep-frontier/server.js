import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end('Method not allowed'); return; }
    if (new URL(req.url, 'http://localhost').pathname === '/api/pds') {
      const query = encodeURIComponent('ref_lid_target eq \"urn:nasa:pds:context:target:satellite.saturn.titan\"');
      try {
        const remote = await fetch('https://pds.nasa.gov/api/search/1/products?limit=6&q=' + query, { signal: AbortSignal.timeout(7000), headers: { Accept: 'application/json' } });
        const body = await remote.text();
        if (body.length > 2000000) throw new Error('Response too large');
        res.writeHead(remote.status, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' });
        res.end(body);
      } catch { res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'NASA PDS unavailable' })); }
      return;
    }
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Invalid path');
    const file = path === root ? resolve(root, 'index.html') : path;
    if (!['.html', '.js', '.css', '.svg', '.json'].includes(extname(file)) || file.includes('/.')) throw new Error('Not public');
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
