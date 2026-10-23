// Logos for merchants and banks. The phone asks this server, never a third party, and only a website name is sent.
// The server fetches the merchant's own icon (apple-touch-icon, then favicon) from the merchant's site, keeps it 30 days,
// and serves it from here. Nothing about the person is sent anywhere.
import { send, fail, handle, kv, kvReady } from './_lib.js';
const OK_HOST = h => /^(?=.{4,80}$)([a-z0-9-]+\.)+[a-z]{2,24}$/.test(h) && !/(^|\.)(localhost|local|internal|lan|home|corp|arpa)$/.test(h) && !/^\d+(\.\d+){3}$/.test(h);
const MAX = 200 * 1024;
async function grab(url) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4000);
  try { const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'SproutLogo/1.0' } });
    const ct = String(r.headers.get('content-type') || ''); if (!r.ok || !/^image\//.test(ct) || /svg/.test(ct)) return null;
    const buf = Buffer.from(await r.arrayBuffer()); if (!buf.length || buf.length > MAX) return null; const fin = new URL(r.url); if (!OK_HOST(fin.hostname)) return null; return { ct, b64: buf.toString('base64') } }
  catch { return null } finally { clearTimeout(t) }
}
export default handle(async (req, res) => {
  const u = new URL(req.url, 'http://x'); let d = String(u.searchParams.get('d') || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!OK_HOST(d)) return fail(res, 400, 'bad_domain');
  const key = 'logo:' + d; let hit = null;
  if (kvReady()) { try { const v = await kv('GET', key); if (v === 'none') hit = 'none'; else if (v) hit = JSON.parse(v) } catch { } }
  if (!hit) { hit = (await grab('https://' + d + '/apple-touch-icon.png')) || (await grab('https://www.' + d + '/apple-touch-icon.png')) || (await grab('https://' + d + '/favicon.ico')) || 'none';
    if (kvReady()) { try { await kv('SET', key, hit === 'none' ? 'none' : JSON.stringify(hit), 'EX', hit === 'none' ? 7 * 86400 : 30 * 86400) } catch { } } }
  if (hit === 'none') { res.statusCode = 404; res.setHeader('Cache-Control', 'public, max-age=86400'); return res.end() }
  res.statusCode = 200; res.setHeader('Content-Type', hit.ct); res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(Buffer.from(hit.b64, 'base64'));
});
