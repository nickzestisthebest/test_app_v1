// The app's name and look come from one file: sprout_live/brand.json (see sprout/brand.py for the app build).
import fs from 'node:fs';
const BASE = { name: 'Sprout', domain: 'sprout.app', legalEntity: 'Sprout Money LLC', tagline: 'Grow a little every day', description: 'A calm daily budget that knows your bills and paychecks.', supportEmail: '[your support email]', themeColor: '#5f8f5a', backgroundColor: '#eef2e8', accent: '#5f8f5a', accentDark: '#8fbf7f' };
export function loadBrand() {
  let b = {}; try { b = JSON.parse(fs.readFileSync(new URL('../brand.json', import.meta.url), 'utf8')) } catch (e) {}
  const o = Object.assign({}, BASE); for (const [k, v] of Object.entries(b)) if (!k.startsWith('_')) o[k] = v;
  o.name = String(o.name || '').trim() || 'Sprout'; return o;
}
export function brandify(s, b = loadBrand()) {
  if (b.name === 'Sprout' && b.domain === 'sprout.app' && b.legalEntity === 'Sprout Money LLC') return s;
  return String(s).replace(/Sprout Money LLC/g, b.legalEntity).replace(/(?<![\w-])sprout\.app\b/g, b.domain).replace(/\bSprout\b/g, b.name);
}
