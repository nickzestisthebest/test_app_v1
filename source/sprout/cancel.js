// ---------- Cancel for me, started from Ask ----------
// "Cancel my Spotify" finds the subscription in their own charges and opens the Cancel for me flow.
// Nothing is sent until they confirm on that screen and tick the authorization box. Sprout never asks for passwords.
// Subscriptions billed through Apple or Google can only be cancelled by the account holder, so Sprout shows the official steps.
const CXV='2026-10-20.1';
const CXSTORE={apple:{name:'Apple',url:'https://apps.apple.com/account/subscriptions',steps:['Open Settings on your iPhone and tap your name','Tap Subscriptions','Choose the subscription, then tap Cancel Subscription']},
  google:{name:'Google Play',url:'https://play.google.com/store/account/subscriptions',steps:['Open your Google Play subscriptions page','Choose the subscription','Tap Cancel subscription and follow the steps']}};
const cxStore=s=>{const r=String(s&&s.raw||'').trim();return /apple\.com\/bill|itunes|app\s*store|^apple(\s+(services|inc\.?|com))?$/i.test(r)?'apple':/google\s*\*|google\s*play/i.test(r)?'google':''};
const cxNorm=s=>String(s||'').toLowerCase().replace(/[’']/g,'').replace(/\+/g,' plus ').replace(/[^a-z0-9 ]/g,' ').replace(/\b(my|the|a|an|subscriptions?|memberships?|plans?|accounts?|service|services|premium|monthly|yearly|annual|auto ?renew(al)?|for|me|please|can|you|could|would|i|want|to|cancel|unsubscribe|stop|paying|get|rid|of|end|quit|turn|off|from|that|this|it|now|thing|app)\b/g,' ').replace(/\s+/g,' ').trim();
const CXCAT=[[/streaming|tv|movies|shows/,'Streaming'],[/music/,'Music'],[/gym|fitness|workout/,'Fitness'],[/storage|cloud/,'Storage'],[/news|paper/,'News'],[/gaming|games?/,'Gaming'],[/books?|audio ?books?/,'Books'],[/delivery/,'Delivery'],[/software/,'Software']];
// things Sprout won't cancel: they affect housing, credit, coverage or service you rely on
const CXNOT=[[/\brent\b|lease|landlord|apartment|mortgage/,'rent or a mortgage'],[/\bloan\b|student loan|car payment|auto loan|financ/,'a loan'],[/credit card|\bcard\b/,'a credit card'],[/insurance/,'insurance'],[/electric|power|\bgas bill\b|water|utilit|sewer|trash/,'a utility'],[/phone|mobile|wireless|cell|internet|wifi|cable|broadband/,'phone or internet service'],[/klarna|affirm|afterpay|pay later/,'a pay-later plan']];
const CXLOW=/phone|mobile|wireless|cell|internet|wifi|cable|broadband|insurance|electric|power/;
function cxFind(q){const L=subsList().filter(s=>s.st!=='cancelled'),n=cxNorm(q);
  if(!n||/^(all|everything|every one|all of them)$/.test(n))return{all:L,n};
  const w=n.split(' ');
  let hits=L.filter(s=>{const nm=cxNorm(s.name);if(!nm)return false;const f=nm.split(' ')[0];return n.includes(nm)||nm.includes(n)||w.includes(f)||(f.length>=4&&n.includes(f))});
  if(!hits.length){const c=CXCAT.find(z=>z[0].test(n));if(c)hits=L.filter(s=>s.cat===c[1])}
  return{hits,n,all:L}}
const cxSave=s=>Math.round(s.amt*12);
const cxBtn=(label,v,w,alt)=>({label,x:'askgo',v,w:w||'',alt:!!alt});
BR.cancelAsk=function(q){const F=cxFind(q),x=X();
  const pick=L=>L.slice(0,6).map(s=>cxBtn(s.name+' · '+money(s.amt)+'/mo','cancel',s.id,true));
  if(F.all&&!F.hits){if(!F.all.length)return {reply:'I haven’t found any subscriptions to cancel yet. They show up once a charge repeats on a schedule.',actions:[],local:true};
    return {reply:'Which one should I cancel?',actions:[],local:true,buttons:pick(F.all)}}
  if(!F.hits.length){const done=subsList().filter(s=>s.st==='cancelled').find(s=>{const nm=cxNorm(s.name),f=nm.split(' ')[0];return nm&&(F.n.includes(nm)||F.n.split(' ').includes(f))});
    if(done)return {reply:'**'+done.name+'** is already cancelled. If it charges you again, Sprout will let you know.',actions:[],local:true,buttons:[cxBtn('See details','cancel',done.id,true)]};
    const nt=CXNOT.find(z=>z[0].test(F.n));
    if(nt)return {reply:'I can’t cancel '+nt[1]+' for you. Those usually need you directly, and stopping one can affect your credit, coverage or service.'+(CXLOW.test(F.n)?'\n\nIf it’s the price that bothers you, Lower my bills can ask for a better rate.':'\n\nCall them, or check their website or app, to see your options.'),actions:[],local:true,buttons:CXLOW.test(F.n)?[cxBtn('Lower my bills','nego','')]:[]};
    const nm=F.n.split(' ').slice(0,3).join(' ').replace(/\b\w/g,c=>c.toUpperCase());
    const viaApple=(HIST||[]).some(h=>/apple\.com\/bill|itunes/i.test(h.m||''));
    return {reply:'I don’t see '+(nm||'that subscription')+' among your subscriptions'+(viaApple?'. It may be billed through your Apple account, which shows up as Apple.com/bill. You can check and cancel it there.':'. If you pay for it another way, you can cancel it in that account’s settings.'),actions:[],local:true,
      buttons:(viaApple?[{label:'Open Apple subscriptions',href:CXSTORE.apple.url}]:[]).concat([cxBtn('See my subscriptions','subs','',viaApple)])}}
  if(F.hits.length>1)return {reply:'I found '+F.hits.length+' that match. Which one should I cancel?',actions:[],local:true,buttons:pick(F.hits)};
  const s=F.hits[0],r=x.subs[s.id]||{},st=cxStore(s);
  if(r.req&&/requested|working|needs_you/.test(r.req.status))return {reply:'I’m already on it. Your '+s.name+' cancellation is '+({requested:'requested',working:'in progress',needs_you:'waiting on you'})[r.req.status]+'.',actions:[],local:true,buttons:[cxBtn('See status','cancel',s.id)]};
  if(st){const S=CXSTORE[st];return {reply:'**'+s.name+'** is billed through '+S.name+', so only you can cancel it there. It takes about a minute:\n\n'+S.steps.map((t,i)=>(i+1)+'. '+t).join('\n')+'\n\nThat saves about **'+money0(cxSave(s))+' a year**.',actions:[],local:true,buttons:[{label:'Open '+S.name+' subscriptions',href:S.url},cxBtn('I cancelled it','cxdone',s.id,true)]}}
  return {reply:'I can cancel **'+s.name+'** for you. It’s '+money(s.amt)+' a month, so you’d save about **'+money0(cxSave(s))+' a year**.\n\nYou’ll check the details and confirm on the next screen before Sprout contacts '+s.name+'.',actions:[],local:true,buttons:[cxBtn('Review and cancel','cancel',s.id),{label:'Keep it',x:'cxkeep',v:s.id,alt:true}]}};
BR.lowerAsk=function(q){const n=cxNorm(q);
  if(LIVE.on&&liveOK())return {reply:'Lower my bills is coming soon. Until then, what often works: call the provider, ask for the retention or loyalty team, and mention a lower price you’ve seen elsewhere. Ask them to confirm any new rate in writing.',actions:[],local:true};
  return {reply:'Lower my bills can ask your provider for a better rate'+(n?' on your '+n+' bill':'')+'. You’ll see the details and approve it first.',actions:[],local:true,buttons:[cxBtn('Open Lower my bills','nego','')]}};
// Ask: understand cancel and lower-bill requests on the phone (instant, free)
{const CXRX=/\b(cancel|unsubscribe|stop paying for|stop my|get rid of|end my|quit my|turn off (?:the )?auto ?renew(?:al)?)\b/,LOWRX=/\b(lower|reduce|negotiate|cut|cheaper|better (?:rate|deal|price)|bring down)\b.*\b(bills?|rates?|phone|internet|insurance|cable|power|electric|wireless)\b/;
  const _ans=BR.answer;BR.answer=raw=>{const s=String(raw||'').toLowerCase().replace(/[’]/g,"'").trim();
    if(/^(cancel|never ?mind)( that| it| this)?[.!]*$/.test(s))return {reply:'Okay. Nothing changed.',actions:[],local:true,intent:'nevermind'};
    if(CXRX.test(s)&&!/^(should|would|is it|how|why|what if)\b/.test(s)&&!/how (?:do|can|would) i cancel/.test(s)){const r=BR.cancelAsk(s);r.intent='cancel';return r}
    if(/how (?:do|can|would) i cancel/.test(s)){const r=BR.cancelAsk(s);r.intent='cancel';return r}
    if(LOWRX.test(s)&&!/^(should|why)\b/.test(s)){const r=BR.lowerAsk(s.replace(/.*\b(?:my|the|our)\s+/,'').replace(/\s*bills?\b.*$/,''));r.intent='lower';return r}
    return _ans(raw)}}
// the AI can route here too: its cancel or lower-bill actions become the same checked answer
BR.post=res=>{if(!res||!Array.isArray(res.actions))return res;const c=res.actions.find(a=>a&&a.type==='cancel_subscription'),l=res.actions.find(a=>a&&a.type==='lower_bill');
  if(c){const r=BR.cancelAsk('cancel '+String(c.name||''));r.intent='cancel';return r}
  if(l){const r=BR.lowerAsk(String(l.name||''));r.intent='lower';return r}return res};
// Ask goes to the phone first, then the AI; both paths understand cancel requests
function BRwrap(fn){if(!fn)return fn;return {limits:(...a)=>fn.limits(...a),json:async(prompt,opts)=>{prompt=String(prompt||'');
  if(!prompt.startsWith(CMD_PROMPT.slice(0,60)))return fn.json(prompt,opts);
  const ni=prompt.lastIndexOf('\n\nTheir note:\n'),note=ni>=0?prompt.slice(ni+14):'',imgs=opts&&opts.images&&opts.images.length;
  if(!imgs){const loc=BR.answer(note);if(loc){LIVE.stat.local++;return loc}}
  if(ni>=0)prompt=prompt.slice(0,ni)+'\n\nSpending summary (worked out on the phone):\n'+JSON.stringify(BR.summary())+prompt.slice(ni);
  return BR.post(await fn.json(prompt,opts))}}}
// buttons under an Ask answer
function askBtns(L){if(!Array.isArray(L)||!L.length)return '';return '<div class="askbtns">'+L.slice(0,6).map(b=>b.href?'<a class="sbtn'+(b.alt?' alt':'')+'" href="'+esc(b.href)+'" target="_blank" rel="noopener noreferrer">'+esc(b.label)+' ↗</a>':'<button type="button" class="sbtn'+(b.alt?' alt':'')+'" data-x="'+esc(b.x||'askgo')+'" data-v="'+esc(b.v||'')+'" data-w="'+esc(b.w||'')+'">'+esc(b.label)+'</button>').join('')+'</div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cmd-out [data-x=askgo],#cmd-out [data-x=cxkeep],#cmd-out [data-x=cxdone]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.x,v=b.dataset.v,w=b.dataset.w;
  if(a==='cxkeep'){const s=subsList().find(z=>z.id===v);toast('Okay, keeping '+(s?s.name:'it')+'.');return}
  if(a==='cxdone'){cxMarkSelf(v);return}
  closeSheets();setTimeout(()=>{if(v==='cancel')xGo('cancel',w);else xGo(v)},closeSheetsDelay()+30)},true);
function cxMarkSelf(id){const x=X(),s=subsList().find(z=>z.id===id);x.subs[id]=Object.assign({},x.subs[id],{s:'cancelled',at:Date.now(),self:1});sv();SUBCACHE=null;afterChange();
  toast((s?s.name:'It')+' marked as cancelled. Sprout will tell you if it charges again.');try{xRender()}catch(_){}}

// ---- the Cancel for me screen: what happens, who to contact, and a clear yes from the person ----
const cxLive=()=>LIVE.on&&liveOK()&&LIVE.st.cancel!==false;
let CXTICK=null;
document.addEventListener('change',e=>{const t=e.target;if(!t||!/^cx-(ok|name|email)$/.test(t.id))return;const id=(XP&&XP.arg)||'';CXTICK=Object.assign({},CXTICK&&CXTICK.id===id?CXTICK:{id},{at:Date.now(),on:!!(document.getElementById('cx-ok')||{}).checked,name:String(($('#cx-name').value)||''),email:String(($('#cx-email').value)||'')})},true);
{const _cp=PAGES.cancel;PAGES.cancel=id=>{const s=subsList().find(z=>z.id===id),x=X(),r=x.subs[id]||{};if(!s)return _cp(id);
  const st=cxStore(s);
  if(r.s==='cancelled'&&r.self)return '<div class="xhero"><span class="k">Cancelled</span><b>'+esc(s.name)+'</b><span class="d">You marked this as cancelled. If '+esc(s.name)+' charges you again, Sprout will tell you.</span></div><button class="btn alt" data-x="back">Done</button>';
  if(r.s==='cancelled')return _cp(id);
  if(r.req&&/requested|working|needs_you|failed/.test(r.req.status))return cxStatus(s,r.req);
  if(st){const S=CXSTORE[st];return '<div class="xhero"><span class="k">Billed through '+S.name+'</span><b>'+esc(s.name)+'</b><span class="d">Only you can cancel subscriptions billed through '+S.name+'. It takes about a minute, and saves about '+money0(cxSave(s))+' a year.</span></div>'+
    '<div class="xcard"><ol class="cxsteps">'+S.steps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol><a class="btn" href="'+S.url+'" target="_blank" rel="noopener noreferrer">Open '+S.name+' subscriptions ↗</a></div>'+
    '<button class="btn alt" data-x="cxdone2" data-v="'+id+'">I cancelled it</button><p class="xhint">Sprout isn’t affiliated with '+esc(s.name)+' or '+S.name+'.</p>'}
  if(r.selfView)return cxSelf(s);
  let h=_cp(id);const me=(typeof acctMe==='function'&&acctMe())||{},nm=esc(s.name),tk=CXTICK&&CXTICK.id===id&&Date.now()-CXTICK.at<15*60e3?CXTICK:null;
  const auth='<div class="xcard cxauth"><h3>How Cancel for me works</h3><ul class="cxlist">'+
    '<li>Sprout contacts '+nm+' for you and asks them to cancel this subscription.</li>'+
    '<li>We use the name and email below to find your account. <b>We never ask for your '+nm+' password.</b></li>'+
    '<li>If '+nm+' needs you to finish it yourself, we’ll tell you and send the steps.</li>'+
    '<li>Charges already made usually aren’t refunded, and you may keep access until the period ends. '+nm+' decides that.</li>'+
    '<li>You stay responsible for charges until '+nm+' confirms. Keep an eye on your statements.</li></ul>'+
    '<label class="f">Name on your '+nm+' account<input id="cx-name" autocomplete="name" value="'+esc(tk&&tk.name?tk.name:((me.first||'')+' '+(me.last||'')).trim())+'"></label>'+
    '<label class="f">Email on your '+nm+' account<input id="cx-email" type="email" autocomplete="email" value="'+esc(tk&&tk.email?tk.email:(me.email||''))+'"></label>'+
    '<label class="cxok"><input type="checkbox" id="cx-ok"'+(tk&&tk.on?' checked':'')+'><span>I authorize Sprout to contact '+nm+' on my behalf to cancel this subscription.</span></label>'+
    '<p class="xhint" style="margin:0">Sprout isn’t affiliated with '+nm+'. You can withdraw the request until we start on it.</p></div>';
  h=h.replace('<button class="btn" data-x="runcancel"',auth+'<button class="btn" data-x="runcancel"');
  h=h.replace('<button class="lnk" data-x="remind"','<button class="lnk" data-x="cxselfv" data-v="'+id+'" style="align-self:center">I’d rather cancel it myself</button><button class="lnk" data-x="remind"');
  if(cxLive())h=h.replace(/<p class="xhint">Demo mode\. Nothing here contacts a real company or moves real money\.<\/p>$/,'');
  return h}}
function cxSelf(s){return '<div class="xhero"><span class="k">Cancel it yourself</span><b>'+esc(s.name)+'</b><span class="d">Most companies let you cancel in your account settings in a few minutes.</span></div>'+
  '<div class="xcard"><ol class="cxsteps"><li>Sign in to your '+esc(s.name)+' account on their website or app.</li><li>Open Account, Membership, Subscription or Billing.</li><li>Choose Cancel, and keep the confirmation email.</li></ol><p class="xhint" style="margin:0">Can’t find it? Search “cancel '+esc(s.name)+"”"+' on '+esc(s.name)+'’s own help pages.</p></div>'+
  '<button class="btn" data-x="cxdone2" data-v="'+s.id+'">I cancelled it</button><button class="btn alt" data-x="cxback" data-v="'+s.id+'">Back to Cancel for me</button>'}
const CXST={requested:['Request sent','We have your authorization and will contact them soon.'],working:['Working on it','Sprout has contacted them. This can take a few days.'],needs_you:['Needs you','They need you to finish a step.'],failed:['Couldn’t cancel','They wouldn’t let Sprout cancel it. You can still cancel it yourself.']};
function cxStatus(s,q){const steps=['Request sent','Sprout contacts '+s.name,'Cancellation confirmed'],n=q.status==='requested'?1:2,T=CXST[q.status]||CXST.requested;
  return '<div class="xhero"><span class="k">'+esc(T[0])+'</span><b>'+esc(s.name)+'</b><span class="d">'+esc(T[1])+'</span></div>'+stepsHTML(steps,n)+
   (q.note?'<div class="lkdemo"><b>Note from Sprout:</b> '+esc(q.note)+'</div>':'')+
   '<p class="xhint">Requested '+new Date(q.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})+'. We’ll update this screen as it moves. Keep paying any charges until '+esc(s.name)+' confirms.</p>'+
   (q.status==='requested'?'<button class="btn alt" data-x="cxwithdraw" data-v="'+s.id+'">Withdraw request</button>':'')+
   (/needs_you|failed/.test(q.status)?'<button class="btn" data-x="cxselfv" data-v="'+s.id+'">Cancel it myself</button>':'')}
// the yes: checked box, details recorded, then demo or the real request
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x=runcancel]');if(!b)return;const ok=document.getElementById('cx-ok');if(!ok)return;
  const id=b.dataset.v||(XP&&XP.arg)||'',s=subsList().find(z=>z.id===id);if(!s)return;
  const name=String(($('#cx-name').value)||'').trim(),email=String(($('#cx-email').value)||'').trim();
  if(!ok.checked){e.stopImmediatePropagation();e.preventDefault();toast('Tick the box to authorize Sprout first');ok.closest('.cxok').classList.add('need');return}
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){e.stopImmediatePropagation();e.preventDefault();toast('Add the name and email on that account');return}
  const x=X(),auth={at:Date.now(),v:CXV,text:'I authorize Sprout to contact '+s.name+' on my behalf to cancel this subscription.',name,email};
  x.subs[id]=Object.assign({},x.subs[id],{auth});sv();
  if(!cxLive())return;// demo: the original flow runs
  e.stopImmediatePropagation();e.preventDefault();b.disabled=true;b.textContent='Sending…';
  const j=await liveFetch('/api/requests',{op:'create',kind:'cancel',sub_id:id,service:s.name,amount:s.amt,cadence:s.cad||'monthly',account_name:name,account_email:email,consent:{text:auth.text,at:auth.at,v:CXV}});
  if(!j.ok){b.disabled=false;b.textContent='Cancel it for me';toast(j.error==='cancel_off'?'Cancel for me isn’t turned on for this server yet. You can cancel it yourself for now.':lerr(j));return}
  x.subs[id]=Object.assign({},x.subs[id],{req:{id:j.id,status:'requested',at:Date.now()}});sv();afterChange();xRender();toast('Request sent. We’ll update you here.')},true);
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x=cxselfv],[data-x=cxback],[data-x=cxdone2],[data-x=cxwithdraw]');if(!b)return;e.preventDefault();const a=b.dataset.x,id=b.dataset.v,x=X();
  if(a==='cxselfv'){x.subs[id]=Object.assign({},x.subs[id],{selfView:1});if(x.subs[id].req&&/needs_you|failed/.test(x.subs[id].req.status))delete x.subs[id].req;sv();xRender();return}
  if(a==='cxback'){const r=Object.assign({},x.subs[id]);delete r.selfView;x.subs[id]=r;sv();xRender();return}
  if(a==='cxdone2'){cxMarkSelf(id);return}
  if(a==='cxwithdraw'){const r=x.subs[id]||{};if(r.req&&cxLive()){const j=await liveFetch('/api/requests',{op:'withdraw',id:r.req.id});if(!j.ok){toast(lerr(j));return}}const n=Object.assign({},r);delete n.req;x.subs[id]=n;sv();xRender();toast('Request withdrawn')}});

// ---- keep request status in step with the server ----
async function cxPull(){if(!cxLive())return;const j=await liveFetch('/api/requests',{op:'mine'});if(!j.ok||!Array.isArray(j.requests))return;const x=X();let ch=false;
  j.requests.forEach(q=>{const id=q.sub_id,r=x.subs[id];if(!r||!r.req||r.req.id!==q.id||r.req.status===q.status&&r.req.note===q.note)return;
    if(q.status==='done'){x.subs[id]=Object.assign({},r,{s:'cancelled',at:q.done||Date.now(),req:Object.assign({},r.req,{status:'done'})});toast(q.service+' is cancelled. You’ll save about '+money0((+q.amount||0)*12)+' a year.')}
    else if(q.status==='withdrawn'){const n=Object.assign({},r);delete n.req;x.subs[id]=n}
    else x.subs[id]=Object.assign({},r,{req:Object.assign({},r.req,{status:q.status,note:q.note||''})});ch=true});
  if(ch){sv();SUBCACHE=null;afterChange()}}
{const _s=lkSync;lkSync=async function(){const r=await _s.apply(this,arguments);try{await cxPull()}catch(_){}return r}}
if(LIVE.on){let n=0;const t=async()=>{if(!(typeof acctMe==='function'&&acctMe())||!LIVE.st){if(++n<60)setTimeout(t,1000);return}try{await cxPull()}catch(_){}};setTimeout(t,3000)}

// ---- alerts: requests that need them, and charges after a cancellation ----
{const _al=alerts;alerts=function(){const A=_al.apply(this,arguments),x=X(),out=[];
  try{const D=detectSubs();Object.keys(x.subs||{}).forEach(id=>{const r=x.subs[id];
    if(r&&r.req&&r.req.status==='needs_you'){const s=D.find(z=>z.id===id);out.push({id:'cxneed-'+id+(r.req.note||'').length,t:(s?s.name:'A cancellation')+' needs you',s:r.req.note||'They need you to finish a step to cancel.',go:['cancel']})}
    if(r&&r.s==='cancelled'&&r.at){const s=D.find(z=>z.id===id);if(s&&s.last&&s.last>r.at+2*MS)out.push({id:'cxagain-'+id+'-'+s.last,t:s.name+' charged you after you cancelled',s:money(s.price)+' on '+sdate(s.last)+'. Ask '+s.name+' for a refund, or dispute it with your bank.',go:[]})}})}catch(e){}
  return out.filter(a=>!x.dis[a.id]).concat(A)}}
// "Review" on a needs-you alert opens that subscription
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=alertgo][data-v=cancel]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const x=X(),id=Object.keys(x.subs||{}).find(k=>x.subs[k].req&&x.subs[k].req.status==='needs_you');if(id)xGo('cancel',id)},true);

// ---- owner: the request queue ----
let CQ=null;TITLES.cq='Cancellation requests';
PAGES.cq=()=>{if(!(LIVE.st&&LIVE.st.ai))return '<div class="xcard"><p class="xhint" style="margin:0">Only the owner of this Sprout server can see requests.</p></div>';
  if(!CQ){liveFetch('/api/requests',{op:'queue'}).then(j=>{CQ=j.ok?j.requests:[];CQ.err=j.ok?'':lerr(j);xRender()});return '<div class="xcard"><p class="xhint" style="margin:0">Loading requests…</p></div>'}
  const L=CQ,open=L.filter(q=>/requested|working|needs_you/.test(q.status));
  return '<div class="xcard mqhead"><b>'+open.length+' open</b><span>Each person authorized Sprout to contact the company for them. Use the name and email they gave. Never ask for a password. Mark each one as it moves.</span></div>'+(CQ.err?'<p class="xhint lverr">'+esc(CQ.err)+'</p>':'')+
   (L.length?L.map(q=>'<div class="xcard mq"><div class="mqtop"><span class="mqtag">'+esc(({requested:'New',working:'Working',needs_you:'Needs them',done:'Done',failed:'Failed',withdrawn:'Withdrawn'})[q.status]||q.status)+'</span><small>'+new Date(q.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</small></div>'+
     '<p class="mqwho"><b>Cancel '+esc(q.service)+'</b> · '+money(+q.amount||0)+' '+esc(q.cadence||'monthly')+'</p><p class="mqwho">'+esc(q.account_name||'')+' · '+esc(q.account_email||'')+'</p>'+
     '<blockquote>'+esc((q.consent&&q.consent.text)||'')+' Agreed '+(q.consent&&q.consent.at?new Date(q.consent.at).toLocaleString():'')+'</blockquote>'+
     (/requested|working|needs_you/.test(q.status)?'<label class="f"><input id="cqn-'+esc(q.id)+'" placeholder="Note for them (optional)" value="'+esc(q.note||'')+'"></label><div class="mqact">'+(q.status==='requested'?'<button class="sbtn alt" data-x="cqset" data-v="'+esc(q.id)+'" data-w="working">Started</button>':'')+'<button class="sbtn" data-x="cqset" data-v="'+esc(q.id)+'" data-w="done">Cancelled</button><button class="sbtn alt" data-x="cqset" data-v="'+esc(q.id)+'" data-w="needs_you">Needs them</button><button class="sbtn bad" data-x="cqset" data-v="'+esc(q.id)+'" data-w="failed">Couldn’t</button></div>':'')+'</div>').join(''):'<div class="xcard"><p class="xhint" style="margin:0">No requests yet.</p></div>')};
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x=cqset]');if(!b)return;e.preventDefault();const id=b.dataset.v,status=b.dataset.w,note=String(($('#cqn-'+id).value)||'').trim();
  b.disabled=true;const j=await liveFetch('/api/requests',{op:'update',id,status,note});b.disabled=false;if(!j.ok){toast(lerr(j));return}CQ=null;xRender();toast('Updated')});
// owner sees open requests on Home and in Settings
{const _al2=alerts;alerts=function(){const A=_al2.apply(this,arguments);if(LIVE.st&&LIVE.st.ai&&LIVE.st.cancelOpen>0)return [{id:'cqopen-'+LIVE.st.cancelOpen+'-'+realDay(),t:LIVE.st.cancelOpen+' cancellation request'+(LIVE.st.cancelOpen>1?'s':'')+' waiting',s:'People asked Sprout to cancel something for them.',go:['cq']}].concat(A);return A}}
{const _sv=PAGES.server;PAGES.server=a=>{let h=_sv(a);if(LIVE.st&&LIVE.st.ai)h+='<div class="xcard"><h3>Cancel for me</h3><small class="xhint">'+(LIVE.st.cancel===false?'Turned off on this server. People see how to cancel it themselves.':(LIVE.st.cancelOpen||0)+' open request'+((LIVE.st.cancelOpen||0)===1?'':'s')+'.')+'</small><div style="display:flex;gap:8px"><button class="sbtn" data-x="open" data-v="cq">Open requests</button></div></div>';return h}}
