// ---------- Community safety: guidelines, a filter that stops risky posts and messages, report and block ----------
const CRULES=[
 ['Be kind','No harassment, hate, threats, bullying or shaming anyone about money.'],
 ['Keep personal info private','Never share account, card or Social Security numbers, passwords, PINs, addresses or phone numbers, yours or anyone else’s.'],
 ['No money requests or sending money','Don’t ask for or offer money, loans, gifts, Cash App, Venmo, Zelle or PayPal. Sprout staff will never ask you for money.'],
 ['No selling, pitches or investment tips','No ads, links, referral codes, crypto or stock tips, “guaranteed returns,” or get-rich offers.'],
 ['Share experiences, not professional advice','Members aren’t financial, legal or tax advisors. Treat replies as personal opinions and check important decisions with a professional.'],
 ['Nothing illegal or harmful','No fraud, scams, fake documents, ways to dodge taxes or debts illegally, or content about self-harm. If you’re struggling, call or text 988.'],
 ['Report what feels wrong','Use Report on any post, comment or message. We review reports and remove content or accounts that break these rules.']];
const CGUIDE_HTML='<ol class="cgl">'+CRULES.map(r=>'<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>').join('')+'</ol>';
// what the filter blocks, with a friendly reason
const CFX=[
 [/\b(?:\d[ -]?){13,19}\b/,'That looks like a card or account number. For your safety, numbers like that can’t be shared.'],
 [/\b\d{3}-\d{2}-\d{4}\b|\bssn\b|social security number/i,'Social Security numbers can’t be shared here.'],
 [/\b(routing|account)\s*(number|#|no\.?)\b|\bmy (password|pin|passcode)\b|\bpassword is\b/i,'Account details, passwords and PINs can’t be shared here.'],
 [/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/,'Phone numbers can’t be shared in Community.'],
 [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i,'Email addresses can’t be shared in Community.'],
 [/https?:\/\/|www\.|\b[\w-]+\.(com|net|io|co|ly|xyz|app|me)\b/i,'Links aren’t allowed in Community, to keep out spam and scams.'],
 [/\$[a-z][\w]{2,}|cash\s*app\s*me|venmo\s*me|zelle\s*me|paypal\s*me|send (me )?(money|cash|\$)|wire (me|transfer)|gift cards?|can (you|someone) (lend|loan|spot) me|i can (lend|loan)|need money asap/i,'Asking for or offering money isn’t allowed. Sprout staff will never ask you for money.'],
 [/guarantee(d)? (return|profit|income)|double your money|risk[- ]free (return|profit)|crypto (signal|tip)s?|forex|binary option|invest with me|dm me (for|to)|passive income opportunity|get rich quick|referral code|promo code|use my code/i,'Investment pitches, promotions and referral codes aren’t allowed.'],
 [/\b(kys|kill yourself|go die)\b/i,'That message breaks our rule on kindness and can’t be sent.']];
function cfxCheck(t){t=String(t||'');for(const r of CFX){if(r[0].test(t))return r[1]}return ''}
const CS=()=>{const x=X();x.soc=x.soc||{};x.soc.block=x.soc.block||{};x.soc.mute=x.soc.mute||{};return x.soc};
PAGES.cguide=()=>'<div class="xcard cgcard"><h3>Community guidelines</h3><p class="xhint" style="margin:0">Sprout’s community is for encouragement and sharing what’s worked for you. To keep it safe:</p>'+CGUIDE_HTML+'</div>'+
  (CS().gAgree?'<p class="xhint" style="text-align:center">You agreed to these on '+new Date(CS().gAgree).toLocaleDateString()+'.</p>':'<button class="btn" data-x="cgagree">I agree</button>')+
  '<p class="xhint">Breaking these rules can get posts removed or your account suspended. See also the Terms of Service, section 11.</p>';
Object.assign(TITLES,{cguide:'Community guidelines'});
LEGAL.cguide=['Community guidelines',CGUIDE_HTML];
let CGPEND=null;
// before the first post, comment or message: agree to the guidelines. Every time: check the text.
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=cpost],[data-x=cmsend],[data-x=dmsend]');if(!b)return;const a=b.dataset.x;
  const box=a==='cpost'?$('#cp-txt'):a==='cmsend'?$('#cm-in'):$('#dm-in'),t=(box&&box.value||'').trim();if(!t)return;
  if(!CS().gAgree){e.stopImmediatePropagation();e.preventDefault();CGPEND={a,v:b.dataset.v||'',t};xGo('cguide');return}
  if(a==='dmsend'&&CS().block[b.dataset.v]){e.stopImmediatePropagation();toast('You blocked this member. Unblock them to send messages.');return}
  const why=cfxCheck(t);if(why){e.stopImmediatePropagation();e.preventDefault();cfxWarn(box,why)}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target||e.target.id!=='dm-in')return;const t=(e.target.value||'').trim(),why=t&&cfxCheck(t);
  if(!CS().gAgree&&t){e.stopImmediatePropagation();e.preventDefault();xGo('cguide');return}if(why){e.stopImmediatePropagation();e.preventDefault();cfxWarn(e.target,why)}},true);
function cfxWarn(box,why){toast('Not sent: '+why.split('.')[0]);const host=box&&box.parentElement;if(!host)return;let w=host.querySelector('.cfxw');if(!w){w=document.createElement('p');w.className='cfxw';box.insertAdjacentElement('afterend',w)}w.textContent=why+' Edit your message and try again.'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x,v=b.dataset.v,s=CS();
  if(a==='cgagree'){s.gAgree=Date.now();sv();const p=CGPEND;CGPEND=null;xBack();if(p)setTimeout(()=>{const box=p.a==='cpost'?$('#cp-txt'):p.a==='cmsend'?$('#cm-in'):$('#dm-in');if(box&&!box.value)box.value=p.t;toast('Thanks. You can post now.')},250);else toast('Thanks for helping keep Sprout kind.')}
  if(a==='cguideopen')xGo('cguide');
  if(a==='ublock'){if(b.dataset.arm){s.block[v]=Date.now();s.mute[v]=1;sv();afterChange();toast(v+' is blocked. They can’t message you, and you won’t see their posts.')}else{b.dataset.arm='1';b.textContent='Tap again to block'}}
  if(a==='uunblock'){delete s.block[v];delete s.mute[v];sv();afterChange();toast(v+' is unblocked')}
  if(a==='ureport'){s.rep=s.rep||{};s.rep[v]=Date.now();sv();toast('Thanks. We’ll review this conversation. You can also block '+v+'.')}});
// chat: safety note, report and block, and a blocked state
{const _chat=PAGES.chat;PAGES.chat=n=>{const s=CS();
  const tools='<div class="cstools"><span>Never send money or account details. Sprout will never DM you asking for money.</span><div><button class="lnk" data-x="ureport" data-v="'+esc(n)+'">Report</button>'+(s.block[n]?'<button class="lnk" data-x="uunblock" data-v="'+esc(n)+'">Unblock</button>':'<button class="lnk cbad" data-x="ublock" data-v="'+esc(n)+'">Block</button>')+'<button class="lnk" data-x="cguideopen">Rules</button></div></div>';
  if(s.block[n])return tools+'<div class="xcard"><h3>You blocked '+esc(n)+'</h3><p class="xhint" style="margin:0">They can’t message you and you won’t see their posts. Unblock them any time.</p></div>';
  return tools+_chat(n)}}
// member profiles get a Block button
{const _mem=PAGES.member;if(_mem)PAGES.member=n=>{const h=_mem(n),s=CS();return h+'<div class="memsafe">'+(s.block[n]?'<button class="lnk" data-x="uunblock" data-v="'+esc(n)+'">Unblock '+esc(n)+'</button>':'<button class="lnk cbad" data-x="ublock" data-v="'+esc(n)+'">Block '+esc(n)+'</button>')+'<button class="lnk" data-x="ureport" data-v="'+esc(n)+'">Report</button></div>'}}
// compose: show the rules right where people write
{const _cmp=PAGES.compose;PAGES.compose=a=>{const h=_cmp(a);return '<div class="cgmini"><b>Keep it kind and private.</b> No account numbers, links, money requests or investment tips. <button class="lnk" data-x="cguideopen">Read the guidelines</button></div>'+h}}
