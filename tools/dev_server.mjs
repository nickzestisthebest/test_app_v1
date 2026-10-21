// Runs the app and its server on your computer, like Vercel does: node tools/dev_server.mjs
// Put your keys in the environment first (see .env.example). Open http://localhost:3000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const PORT = +process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain' };
const fns = {};

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname.startsWith('/api/')) {
    const name = u.pathname.slice(5).replace(/[^a-z]/g, '');
    try { fns[name] = fns[name] || (await import(path.join(root, 'api', name + '.js'))).default } catch { res.statusCode = 404; return res.end('{"ok":false,"error":"not_found"}') }
    return fns[name](req, res);
  }
  let f = path.join(root, 'public', decodeURIComponent(u.pathname));
  if (!f.startsWith(path.join(root, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'public', 'index.html');
  res.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream');
  if (/sw\.js$|index\.html$/.test(f)) res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('Sprout is running at http://localhost:' + PORT));
