// Builds the public pages: the Sprout website, Privacy Policy and Terms.
//   node tools/build_pages.mjs            -> public/about/, public/privacy/, public/terms/ (served by Vercel)
//   node tools/build_pages.mjs artifact   -> ../site/pub/ (the claude.ai website, with privacy.html and terms.html)
// To change the contact email, edit CONTACT below and rebuild (or replace it in the built pages on GitHub).
import fs from 'node:fs';
import path from 'node:path';

const CONTACT = '[your support email]';
const EFFECTIVE = 'October 21, 2026';
const root = new URL('..', import.meta.url).pathname;
const mode = process.argv[2] === 'artifact' ? 'artifact' : 'vercel';
const SITE = fs.readFileSync(path.join(root, '..', 'site', 'bonsai_site.html'), 'utf8');
const ACCT = fs.readFileSync(path.join(root, '..', 'sprout', 'acct.js'), 'utf8');
const i = ACCT.indexOf('const TERMS_SECS='), j = ACCT.indexOf('];', i);
const TERMS = eval(ACCT.slice(i + 17, j + 1));
const L = mode === 'vercel'
  ? { home: '/about/', privacy: '/privacy/', terms: '/terms/', app: '/', appLabel: 'Open the app' }
  : { home: 'index.html', privacy: 'privacy.html', terms: 'terms.html', app: 'https://claude.ai/artifact/8NawYc4NPrRAU9CuFmFuoh', appLabel: 'Try the demo' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fix = s => s.replace(/Sprout Money LLC \(“Sprout,” “we”\)/g, 'Sprout (“Sprout,” “we”)').replace(/support@ your Sprout domain/g, CONTACT);
const LOGO = '<svg viewBox="0 0 1024 1024" aria-hidden="true"><rect width="1024" height="1024" rx="230" fill="#2a9f52"/><g transform="translate(512 512) scale(.86) translate(-529 -536)"><path d="M512 810 C512 700 512 600 512 520" stroke="#ffffff" stroke-width="44" stroke-linecap="round" fill="none"/><path d="M512 560 C512 380 640 268 812 262 C820 440 700 560 512 560 Z" fill="#e6f6ec"/><path d="M512 610 C512 470 412 380 246 372 C236 520 340 616 512 610 Z" fill="#a6e2bb"/></g></svg>';

function page(title, desc, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(LOGO.replace(' aria-hidden="true"', ' xmlns="http://www.w3.org/2000/svg"'))}">
<style>
:root{--bg:#f6fbf7;--panel:#ffffff;--ink:#16271c;--muted:#566b5e;--line:#dbe9df;--accent:#2a9f52;--good:#17863a;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1a14;--panel:#16241b;--ink:#e6f2ea;--muted:#9fb6a7;--line:#25382c;--accent:#4cc277;--good:#6fd894;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0f1a14;--panel:#16241b;--ink:#e6f2ea;--muted:#9fb6a7;--line:#25382c;--accent:#4cc277;--good:#6fd894;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header,main,footer{max-width:760px;margin:0 auto;padding:0 16px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:20px;padding-bottom:12px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;font-weight:700;font-size:19px}.brand svg{width:32px;height:32px}
nav{display:flex;gap:16px;flex-wrap:wrap;font-size:15px}nav a{color:var(--good);text-decoration:none;font-weight:600}nav a:hover{text-decoration:underline}
main{padding-bottom:40px}
h1{font-size:32px;line-height:1.2;margin:18px 0 4px;letter-spacing:-.01em}
.eff{color:var(--muted);margin:0 0 24px;font-size:14px}
.short{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 20px;margin:0 0 24px}
.short h2{margin-top:0}
h2{font-size:19px;margin:28px 0 6px}
p,li{max-width:68ch}ul{padding-left:20px}li{margin:4px 0}
a{color:var(--good)}
footer{border-top:1px solid var(--line);padding-top:16px;padding-bottom:32px;color:var(--muted);font-size:14px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
</style></head><body>
<header><a class="brand" href="${L.home}">${LOGO}Sprout</a><nav aria-label="Site"><a href="${L.home}">Home</a><a href="${L.privacy}">Privacy</a><a href="${L.terms}">Terms</a><a href="${L.app}">${L.appLabel}</a></nav></header>
<main>${body}</main>
<footer><span>Sprout is a planning tool, not financial advice.</span><span>© 2026 Sprout · ${esc(CONTACT)}</span></footer>
</body></html>`;
}

const PRIVACY = `<h1>Privacy Policy</h1><p class="eff">Effective ${EFFECTIVE}</p>
<section class="short"><h2>The short version</h2><ul>
<li>We never sell your personal information or share it for advertising.</li>
<li>Your budget and plan are stored on your phone. If you use bank sync, an encrypted backup is kept on our server so a new phone gets your plan back. You can turn it off.</li>
<li>Bank connections are read-only and go through Plaid. Sprout never sees your bank password and can never move money.</li>
<li>Most questions you ask are answered on your phone. Only some go to our AI provider, with a short summary instead of your full history.</li></ul></section>
<h2>What we collect</h2><ul>
<li><b>Account details you enter:</b> name, email, phone, date of birth and ZIP code.</li>
<li><b>Money details you enter or connect:</b> income, bills, debts, goals and transactions.</li>
<li><b>Bank data through Plaid, if you connect a bank:</b> account names, the last four digits, balances and transactions, and for cards and loans, interest rates and minimum payments.</li>
<li><b>Questions you ask Ask Sprout</b>, and screenshots or screen recordings you choose to scan. From a recording, Sprout picks a few still images on your phone and sends only those.</li>
<li><b>Cancel for me requests:</b> the service, the name and email on that account, and the authorization you gave, with its date and time.</li>
<li><b>Credit reports you choose to add.</b> Before anything leaves your phone, Sprout removes your Social Security number, birth date, address, phone number and full account numbers. The rest is read once by our AI provider to pull out accounts, balances, payment history and inquiries. The results are stored on your phone (and in your encrypted backup, if it's on). We don't keep the report file.</li>
<li><b>Phone notifications, if you turn them on:</b> your phone's notification address and a short, encrypted list of upcoming reminders, so our server can send them at the right time. Apple or Google deliver them. Turning notifications off deletes both.</li>
<li><b>Usage counts</b>, such as how many AI answers or scans you used, to apply plan limits. We don't use advertising trackers.</li></ul>
<h2>Where it's stored</h2><p>Your budget, plan, history and profile are stored on your device. Our servers, hosted by Vercel with storage by Upstash, keep only what the app can't do on the phone: encrypted bank connection tokens, usage counts, Cancel for me requests, and, if backup is on, an encrypted backup of your plan. The name and email in Cancel for me requests are encrypted.</p><h2>Backup</h2><p>When you use bank sync, Sprout keeps an encrypted copy of your plan, transaction history and streak on our server, so signing in on a new phone or after your phone's storage is cleared brings it back. Only your access code together with your Sprout account can restore it. Turn it off in Settings, under Bank sync and AI, and the copy is deleted right away. Deleting your account deletes it too.</p>
<h2>Bank connections and Plaid</h2><p>Sprout uses Plaid Inc. to connect to your bank. You sign in on Plaid's page, and your bank login is never shared with Sprout. Plaid's handling of your information is described in the <a href="https://plaid.com/legal/#end-user-privacy-policy">Plaid End User Privacy Policy</a>. Connections are read-only. You can remove a bank any time in Settings, under Connected accounts, and its connection is deleted from our server.</p>
<h2>AI answers and scans</h2><p>When Ask Sprout needs AI to answer, your question and a short summary of your spending are sent to Anthropic, which writes the answer. When you scan screenshots or a screen recording, the images are sent to Anthropic to read the transactions and are not kept by Sprout. Under Anthropic's <a href="https://www.anthropic.com/legal/commercial-terms">Commercial Terms</a>, it may not train its models on this content. Questions answered on your phone never leave it.</p>
<h2>How we use your information</h2><p>To run Sprout and show your plan, keep your account secure, apply plan limits, carry out Cancel for me requests you approve, and answer you when you contact us.</p>
<h2>Who we share it with</h2><ul>
<li>Service providers that help run Sprout, under contract and only for that purpose: Plaid (bank connections), Anthropic (AI answers), Vercel (hosting) and Upstash (storage). When paid plans launch, a payment processor will be added here.</li>
<li>A company you ask us to contact through Cancel for me, which receives only what's needed: your name, the email on that account and your request.</li>
<li>Authorities, when the law requires it.</li></ul>
<p>We don't sell your personal information or share it with other companies for their marketing.</p>
<h2>Your choices</h2><ul>
<li>See, export, correct or delete your data in Settings.</li>
<li>Disconnect a bank, or withdraw a Cancel for me request before we start on it.</li>
<li>Ask us to delete what our servers hold by emailing ${esc(CONTACT)}.</li></ul>
<p>California and other state residents have additional privacy rights, and we honor them for everyone.</p>
<h2>Face ID and voice</h2><p>Face ID is handled by your phone. Sprout keeps only an ID for the passkey on your phone, and your face data never leaves your device. When you talk to log a purchase, your phone's own speech recognition turns it into text; Apple or Google handle that speech under their own privacy policies.</p>
<h2>Security</h2><p>Everything travels over encrypted connections. Bank connection tokens and Cancel for me contact details are encrypted at rest. Sprout never asks for your passwords to other services.</p>
<h2>How long we keep it</h2><p>We keep server data while your account is active. A bank connection is deleted when you disconnect it, and your backup is deleted when you turn backup off or delete your account. We keep a record of each Cancel for me authorization as proof of your permission.</p>
<h2>Children</h2><p>Sprout is for adults 18 and older in the United States.</p>
<h2>Accuracy</h2><p>Balances and transactions come from your bank through Plaid and can be delayed or incomplete. Sprout's categories, totals and estimates are calculated from that data and can be wrong. Check your bank's records before relying on them. See section 4 of the Terms.</p><h2>Changes</h2><p>If we change this policy, we'll update it here and tell you in the app.</p>
<h2>Contact</h2><p>Questions about privacy: ${esc(CONTACT)}.</p>`;

const TERMS_BODY = `<h1>Terms of Service</h1><p class="eff">Effective ${EFFECTIVE}</p>` + TERMS.map(s => '<h2>' + esc(s[0]) + '</h2><p>' + fix(s[1]) + '</p>').join('');

// the website, as a whole page, with links to the legal pages and the app
let site = SITE.replace('<title>Sprout Site</title>', '<title>Sprout</title><meta name="description" content="Sprout is a calm daily budget that knows your bills and paychecks.">');
const FOOT = `<div class="wrap" style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;padding:10px 0 4px;font-size:14px"><a href="${L.privacy}" style="color:inherit">Privacy</a><a href="${L.terms}" style="color:inherit">Terms</a><a href="${L.app}" style="color:inherit">${L.appLabel}</a><span>${esc(CONTACT)}</span></div></footer>`;
if (site.split('</footer>').length !== 2) throw new Error('footer layout changed');
site = site.replace('</footer>', FOOT);
if (mode === 'vercel') site = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + site;

const out = mode === 'vercel' ? path.join(root, 'public') : path.join(root, '..', 'site', 'pub');
const write = (rel, html) => { const f = path.join(out, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html) };
if (mode === 'vercel') {
  write('about/index.html', site);
  // the website's screenshots and animation frames
  const SD = path.join(root, '..', 'site');
  for (const dir of ['anim', 'img']) { const src = path.join(SD, dir); if (!fs.existsSync(src)) continue; fs.mkdirSync(path.join(out, 'about', dir), { recursive: true });
    for (const f of fs.readdirSync(src)) if (/\.(jpe?g|png|webp|mp4)$/i.test(f) && (dir === 'anim' || /^(accts|finances|left)\.jpg$/.test(f))) fs.copyFileSync(path.join(src, f), path.join(out, 'about', dir, f)) }
  write('privacy/index.html', page('Privacy Policy · Sprout', 'How Sprout handles your information.', PRIVACY));
  write('terms/index.html', page('Terms of Service · Sprout', 'The terms for using Sprout.', TERMS_BODY));
} else {
  write('index.html', site);
  write('privacy.html', page('Privacy Policy · Sprout', 'How Sprout handles your information.', PRIVACY));
  write('terms.html', page('Terms of Service · Sprout', 'The terms for using Sprout.', TERMS_BODY));
}
console.log('built', mode, 'pages in', out);
