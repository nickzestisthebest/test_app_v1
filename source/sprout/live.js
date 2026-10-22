// ---------- Live mode: the installed app talks to your own Sprout server ----------
// Bank sync goes through Plaid (read-only) and AI goes through your server, so no secret keys ever live in the app.
// In the claude.ai preview (or with no server), everything below stays off and the app works as before.
const LIVE={on:typeof claude==='undefined'&&typeof window.claude==='undefined'&&/^https?:$/.test(location.protocol)&&!window.__noLive,st:null,code:'',ready:null,stat:{local:0,ai:0}};
const LCODE='sprout-server-code',LPEND='sprout-plaid-pending';
try{LIVE.code=localStorage.getItem(LCODE)||''}catch(e){}
async function liveFetch(path,body,opt){if(!LIVE.on)return{ok:false,error:'offline',status:0};const ctl=typeof AbortController!=='undefined'?new AbortController():null;const tm=setTimeout(()=>{try{ctl&&ctl.abort()}catch(e){}},(opt&&opt.timeout)||30000);
  try{const h={'Content-Type':'application/json'};if(LIVE.code)h['x-sprout-code']=LIVE.code;
    const r=await fetch(path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined,signal:ctl?ctl.signal:undefined,cache:'no-store'});
    const j=await r.json().catch(()=>({ok:false,error:'bad_response'}));j.status=r.status;return j}
  catch(e){return{ok:false,error:e&&e.name==='AbortError'?'timeout':'offline',status:0}}finally{clearTimeout(tm)}}
LIVE.check=async()=>{const j=await liveFetch('/api/status',null,{timeout:7000});LIVE.st=j&&j.ok&&j.app==='sprout'?j:null;return LIVE.st};
LIVE.ready=LIVE.on?LIVE.check():Promise.resolve(null);
const liveOK=()=>!!(LIVE.st&&LIVE.st.code==='ok');
const liveBank=()=>liveOK()&&!!LIVE.st.setup.plaid&&!!LIVE.st.setup.storage;
const LERR={need_code:'Add your access code in Settings, under Bank sync and AI.',bad_code:'That access code didn’t work. Check it in Settings, under Bank sync and AI.',too_many_tries:'Too many wrong codes. Wait 15 minutes and try again.',
  plus_required:'Ask Sprout’s AI answers come with Plus.',ai_paused:'Sprout’s AI is resting until next month. I can still answer everyday questions instantly, like “How much can I spend today?” or “What bills are due before payday?”',
  limit_reached:'You’ve reached the limit for AI answers for now. Instant answers still work, and the limit resets soon.',slow_down:'One moment. Try again in a minute.',
  offline:'I couldn’t reach Sprout’s server. Check your connection and try again.',timeout:'That took too long. Try again in a moment.',ai_unavailable:'The AI is busy right now. Try again in a minute.',
  ai_not_set_up:'AI isn’t set up on the server yet.',plaid_not_set_up:'Bank sync isn’t set up on the server yet.',storage_not_set_up:'Storage isn’t set up on the server yet.',
  free_bank_limit:'Free includes 2 bank connections. Plus links them all.'};
const lerr=j=>(j&&j.plaid&&j.plaid.message)||LERR[j&&j.error]||'That didn’t go through. Try again in a moment.';

// ---- the AI and file-saving hooks the app already uses, pointed at your server ----
if(LIVE.on){
  const toB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=rej;r.readAsDataURL(b)});
  const kindOf=p=>p.startsWith(CMD_PROMPT.slice(0,60))?'ask':p.startsWith(AI_PROMPT.slice(0,60))?'setup':p.startsWith(IM_PROMPT.slice(0,60))?'import':p.startsWith(SCAN_PROMPT.slice(0,60))?'scan':typeof CREDIT_PROMPT!=='undefined'&&p.startsWith(CREDIT_PROMPT.slice(0,60))?'credit':/^Translate these user-interface strings/.test(p)?'translate':'';
  const SAMPLE={limits:async()=>({images:true}),json:async(prompt,opts)=>{prompt=String(prompt||'');const kind=kindOf(prompt),imgs=opts&&opts.images&&opts.images.length;
    // (answering on the phone first, and the compact summary, happen in BRwrap before this is called)
    if(!kind)throw Object.assign(new Error('unsupported'),{code:'unsupported'});
    const images=imgs?await Promise.all(opts.images.slice(0,8).map(toB64)):[];
    const j=await liveFetch('/api/ai',{kind,prompt,images,batch:opts&&opts.batch||undefined,part:opts&&opts.part!=null?opts.part:undefined},{timeout:60000});
    if(j.ok){LIVE.stat.ai++;return j.result}
    if(kind==='ask')return{reply:lerr(j),actions:[]};
    throw Object.assign(new Error(lerr(j)),{code:j.error})}};
  const DL={save:async o=>{const data=o.data instanceof Blob?o.data:new Blob([o.data||''],{type:'text/plain'}),name=o.filename||'Sprout-file';
    try{const f=new File([data],name,{type:data.type||'application/octet-stream'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}}catch(e){if(e&&e.name==='AbortError')return}
    const u=URL.createObjectURL(data),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},3000)}};
  window.claude={use:async n=>{if(n==='downloads')return DL;await LIVE.ready;if(n==='sample'){if(!LIVE.st||!LIVE.st.setup.ai)throw new Error('no_ai');return SAMPLE}throw new Error('not_available')}};
  // the plan comes from your access code (Plus sign-up opens at launch)
  {const _pi=plusIs;plusIs=()=>liveOK()?!!LIVE.st.plus:_pi()}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=pstart],[data-x=pstop]');if(!b||!liveOK())return;e.stopImmediatePropagation();e.preventDefault();
    toast(LIVE.st.plus?'Plus is on through your access code.':'Plus sign-up opens at launch. For now, Plus comes with a Plus access code.')},true);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})});
  // a Home Screen app on iPhone can stay open for days: when it comes back to the screen, check for a newer version and load it
  {const B=window.SPROUT_BUILD||'';let busy=false;
   const upd=async auto=>{if(busy||!B||document.hidden)return;busy=true;try{const r=await fetch('/sw.js?v='+Date.now(),{cache:'no-store'}),t=await r.text(),m=t.match(/sprout-([a-f0-9]{6,})/);
       if(m&&m[1]!==B){try{const g=await navigator.serviceWorker.getRegistration();if(g)await g.update()}catch(e){}
         const k='sprout-upd-'+m[1];let tried=false;try{tried=!!sessionStorage.getItem(k);sessionStorage.setItem(k,'1')}catch(e){}
         const go=()=>{try{saveLocal()}catch(e){}location.reload()};
         if(auto&&!tried&&!document.querySelector('.sheet.on')&&!syncing)go();else toastAct('A new version of Sprout is ready','Update',go)}}catch(e){}busy=false};
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>upd(true),600)});setTimeout(()=>upd(false),5000)}
}

// (bank categories are handled by the ledger rules in ledger.js)
let PSINK=null;
{const _ic=importCommit;importCommit=function(list){try{if(PSINK)(list||[]).forEach(r=>{if(r&&r.pid)PSINK[r.pid]=r.attach&&r.attach.tid?r.attach.tid:r.k})}catch(e){}return _ic.apply(this,arguments)}}

// ---- turning Plaid's data into the app's shape ----
const LKIND=a=>a.type==='credit'?'card':a.type==='loan'?'loan':a.type==='depository'?'checking':a.type==='investment'||a.type==='brokerage'?'invest':'other';
const LLABEL=a=>String(a.name||'Account').slice(0,40)+(a.mask?' ••'+a.mask:'');
function liveD(results){const accts=[],txns=[],liab=[],debtAcct={},liabMap={};let bal=0,chk=false,dep=null;
  results.forEach(it=>{const A={};(it.accounts||[]).forEach(a=>{const kind=LKIND(a),label=LLABEL(a);A[a.id]={kind,label};if(kind==='other'){accts.push({id:a.id,name:String(a.name||'Account').slice(0,40),mask:a.mask||'',kind:'other',inst:it.institution,item:it.item_id,cur:a.cur,avail:a.avail,sub:a.subtype});return}
      accts.push({id:a.id,name:String(a.name||'Account').slice(0,40),mask:a.mask||'',kind,inst:it.institution,item:it.item_id,cur:a.cur,avail:a.avail,limit:a.limit,sub:a.subtype});
      if(kind==='checking'){const v=+(a.avail!=null?a.avail:a.cur)||0;if(a.subtype==='checking'){bal+=v;chk=true}else if(!dep)dep=v}
      if((kind==='card'||kind==='loan')&&+a.cur>0){const L=(it.liabilities||[]).find(l=>l.acct===a.id)||{};const name=String(a.name||'Card').slice(0,40)+(a.mask?' ••'+a.mask:'');
        liab.push({name,bal:Math.round(+a.cur*100)/100,apr:L.apr!=null?Math.round(+L.apr*100)/100:0,min:L.min!=null&&+L.min>0?Math.round(+L.min*100)/100:Math.max(25,Math.round(+a.cur*0.02)),day:L.due?+String(L.due).slice(8,10):1,canWait:kind==='loan'&&/student/i.test(a.subtype||'')});debtAcct[a.id]=name}});
    (it.liabilities||[]).forEach(l=>{if(l&&l.acct)liabMap[l.acct]={apr:l.apr,min:l.min,due:l.due,stmt:l.stmt,kind:l.kind}});
    const gone=new Set(it.removed||[]);
    (it.added||[]).concat(it.modified||[]).forEach(t=>{if(gone.has(t.id))return;const ac=A[t.acct];if(!ac||ac.kind==='other'||ac.kind==='loan'||ac.kind==='invest')return;
      txns.push({d:t.date,a:-Math.round(+t.amount*100)/100,m:t.merchant||t.name||'Transaction',acct:ac.label,kind:ac.kind==='card'?'card':'checking',p:!!t.pending,pid:t.id,pfc:t.pfc,pfd:t.pfd})})});
  if(!chk&&dep!==null)bal=dep;
  const pending=txns.filter(t=>t.p).map(t=>({d:t.d,a:t.a,m:t.m,t:Date.now()}));
  return{txns,pending,liab,bal:Math.round(bal*100)/100,accts,debtAcct,liabMap}}

// ---- connect flow (Plaid Hosted Link: the bank sign-in happens on Plaid's page, then comes back here) ----
const LV={items:[],busy:'',msg:'',step:'connect'};
LV.render=()=>{const B=$('#lk-body');if(!B||B===DUMMY)return;
  if(LV.step==='reading'){B.innerHTML='<div class="lvread"><span class="lvspin" aria-hidden="true"></span><b>Reading your accounts</b><p class="note" style="margin:0">'+esc(LV.msg||'This can take up to a minute the first time.')+'</p></div>';return}
  const st=LIVE.st||{},n=LV.items.length,cap=!plusIs()&&n>=(st.freeBanks||2),first=!(state.link&&state.link.live);
  let x='<p class="note" style="margin:0">Connect your bank and Sprout keeps your numbers up to date on its own. It’s read-only: Sprout can see balances and transactions but can never move money.</p>';
  if(st.setup&&st.setup.plaidEnv!=='production')x+='<div class="lkdemo"><b>Test mode.</b> This server uses Plaid’s sandbox with pretend banks. Pick any bank and sign in with <b>user_good</b> and <b>pass_good</b>.</div>';
  x+=LV.items.map(it=>'<div class="lkrow"><div class="lki">▣</div><div class="lkt"><b>'+esc(it.institution)+'</b><small>Connected · read-only</small></div><span class="lkok">✓</span></div>').join('');
  if(LV.busy==='load')x+='<p class="note" style="margin:0">Checking your connections…</p>';
  else if(cap)x+='<div class="tierwall slim"><b>Free includes '+(st.freeBanks||2)+' bank connections</b><span>Add other accounts by hand any time, or link every bank with Plus.</span><div class="twbtns"><button type="button" class="sbtn" data-x="plusgo" data-v="accts">Link all with Plus</button></div></div>';
  else x+='<div class="row"><button type="button" class="btn'+(n?' alt':'')+'" data-lv="add"'+(LV.busy?' disabled':'')+'>'+(LV.busy==='add'?'Opening Plaid…':n?'Connect another bank':'Connect a bank')+'</button></div>';
  if(LV.msg)x+='<p class="note lverr" style="margin:0">'+esc(LV.msg)+'</p>';
  if(n&&first)x+='<div class="row"><button type="button" class="btn" data-lv="next"'+(LV.busy?' disabled':'')+'>Continue</button></div>';
  if(!cap&&LV.busy!=='load')x+='<button type="button" class="lnk" data-lv="page" style="align-self:center">Trouble connecting? Use Plaid’s page instead</button>';
  x+='<p class="note" style="margin:0">Sprout uses Plaid to connect to your bank. Plaid’s secure sign-in opens right here in Sprout. Some banks show their own sign-in page for a moment, then bring you back. Your bank login is never shared with Sprout.</p>';
  if(first)x+='<button type="button" class="lnk" data-lk="manual" style="align-self:center">I’d rather type it in myself</button>';
  B.innerHTML=x};
LV.open=async()=>{LK=Object.assign({},LK,{live:true,step:'connect'});LV.step='connect';LV.msg='';LV.busy='load';LV.render();openSheet('sh-link');
  const j=await liveFetch('/api/plaid',{op:'items'});LV.busy='';LV.items=j.ok?j.items:[];if(!j.ok)LV.msg=lerr(j);LV.render()};
LV.add=async(itemId,page)=>{LV.busy='add';LV.msg='';LV.render();
  if(!page){try{if(await LV.overlay(itemId))return}catch(e){}}
  const j=await liveFetch('/api/plaid',{op:'link_token',hosted:true,item_id:itemId||undefined,return_to:location.origin+location.pathname});
  if(!j.ok||!j.hosted_link_url){LV.busy='';LV.msg=lerr(j);LV.render();if(itemId)toast(lerr(j));return}
  try{localStorage.setItem(LPEND,JSON.stringify({lt:j.link_token,at:Date.now(),first:!(state.link&&state.link.live),update:!!itemId}))}catch(e){}
  location.assign(j.hosted_link_url)};
LV.read=async()=>{LK=Object.assign({},LK,{live:true,step:'reading'});LV.step='reading';LV.msg='';LV.render();if($('#sh-link').hidden)openSheet('sh-link');
  const cursors={},acc={};let tries=0;
  for(;;){const j=await liveFetch('/api/plaid',{op:'sync',cursors,liabilities:true},{timeout:60000});
    if(!j.ok){LV.step='connect';LV.msg=lerr(j);LV.render();return}
    let wait=false;j.items.forEach(it=>{const a=acc[it.item_id]=acc[it.item_id]||{item_id:it.item_id,institution:it.institution,accounts:[],added:[],modified:[],removed:[],liabilities:null};
      if(it.accounts&&it.accounts.length)a.accounts=it.accounts;a.added.push(...(it.added||[]));a.modified.push(...(it.modified||[]));a.removed.push(...(it.removed||[]));if(it.liabilities)a.liabilities=it.liabilities;a.status=it.status;
      if(it.cursor)cursors[it.item_id]=it.cursor;if(it.more||it.status==='not_ready'||(it.update==='NOT_READY'&&!a.added.length))wait=true});
    if(!wait||++tries>=12)break;LV.msg=tries<4?'Your bank is sending your history…':'Still working. Some banks take a little longer.';LV.render();await new Promise(r=>setTimeout(r,tries<4?3000:5000))}
  const results=Object.values(acc),D=liveD(results);
  if(!D.accts.length){LV.step='connect';LV.msg='No accounts came through yet. Try again in a minute.';LV.render();return}
  LK=Object.assign({},LK,{live:true,data:D,cursors,items:results.map(r=>({item_id:r.item_id,inst:r.institution})),found:detectPlan(D),step:'found'});LV.step='found';lkRender()};
// Plaid's sign-in as an overlay on top of Sprout (Plaid Link). Plaid's own page stays as the fallback.
LV.js=()=>window.Plaid?Promise.resolve(true):new Promise(ok=>{const sc=document.createElement('script');sc.src='https://cdn.plaid.com/link/v2/stable/link-initialize.js';sc.async=true;sc.onload=()=>ok(!!window.Plaid);sc.onerror=()=>ok(false);document.head.appendChild(sc);setTimeout(()=>ok(!!window.Plaid),12000)});
LV.overlay=async(itemId,resume)=>{const first=!(state.link&&state.link.live);let lt=resume&&resume.lt;
  if(!(await LV.js()))return false;
  if(!lt){const j=await liveFetch('/api/plaid',{op:'link_token',item_id:itemId||undefined});if(!j.ok||!j.link_token){LV.busy='';LV.msg=lerr(j);LV.render();if(itemId)toast(lerr(j));return true}lt=j.link_token;
    // a bank that signs you in on its own site sends you back here: remember where we were
    try{localStorage.setItem(LPEND,JSON.stringify({lt,at:Date.now(),first,update:!!itemId,overlay:1}))}catch(e){}}
  const done=()=>{try{localStorage.removeItem(LPEND)}catch(e){}};
  const h=window.Plaid.create({token:lt,receivedRedirectUri:resume&&/[?&]oauth_state_id=/.test(location.href)?location.href:undefined,
    onSuccess:async(pt,meta)=>{done();try{if(/[?&]oauth_state_id=/.test(location.search))history.replaceState(null,'',location.pathname)}catch(e){}
      if(itemId||(resume&&resume.update)){toast('Reconnected. Syncing…');LV.busy='';lkSync();return}
      LV.busy='';LV.msg='Saving your connection…';LV.render();
      const j=await liveFetch('/api/plaid',{op:'exchange',public_token:pt,institution:meta&&meta.institution});if(!j.ok){LV.msg=lerr(j);LV.render();toast(lerr(j));return}
      toast('Connected to '+j.institution);if(first||(resume&&resume.first)){if($('#sh-link').hidden)openSheet('sh-link');LV.read()}else lkSync()},
    onExit:(err)=>{done();LV.busy='';LV.msg=err?(err.display_message||'The bank connection didn’t finish. Try again.'):'';LV.render()}});
  h.open();return true};
// after Plaid sends them back to the app
LV.resume=async()=>{let p=null;try{p=JSON.parse(localStorage.getItem(LPEND)||'null')}catch(e){}
  if(p&&p.overlay&&p.lt&&Date.now()-p.at<30*60e3){if(/[?&]oauth_state_id=/.test(location.search)){if(p.first)openSheet('sh-link');LV.busy='add';LV.render();if(await LV.overlay(null,p))return}try{localStorage.removeItem(LPEND)}catch(e){}return}
  try{if(/[?&]plaid=done/.test(location.search))history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  if(!p||!p.lt||Date.now()-p.at>6*3600e3){try{localStorage.removeItem(LPEND)}catch(e){}return}
  let j=null;for(let k=0;k<4;k++){j=await liveFetch('/api/plaid',{op:'hosted_done',link_token:p.lt});if(!j.ok||j.finished||k===3)break;await new Promise(r=>setTimeout(r,2000))}
  try{localStorage.removeItem(LPEND)}catch(e){}
  if(!j||!j.ok){toast(lerr(j));return}
  if(p.update){if(j.finished&&!j.exited){toast('Reconnected. Syncing…');lkSync()}return}
  if(!j.linked||!j.linked.length){toast(j.exited?'Bank connection cancelled':'No bank was connected');if(p.first)LV.open();return}
  toast('Connected to '+j.linked.map(x=>x.institution).join(' and '));
  if(p.first)LV.read();else{lkSync()}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lv]');if(!b)return;e.preventDefault();const a=b.dataset.lv;
  if(a==='add')LV.add();else if(a==='page')LV.add(undefined,true);else if(a==='next')LV.read();else if(a==='fix'){const r=((state.link&&state.link.relink)||[]).find(x=>x.item_id===b.dataset.v);if(r&&r.gone){state.link.items=(state.link.items||[]).filter(i=>i.item_id!==r.item_id);state.link.accts=(state.link.accts||[]).filter(x=>x.item!==r.item_id);state.link.relink=state.link.relink.filter(x=>x!==r);queueSave();LV.add()}else LV.add(b.dataset.v)}
  else if(a==='rm'){if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to remove';return}LV.remove(b.dataset.v)}});
LV.remove=async id=>{const j=await liveFetch('/api/plaid',{op:'remove',item_id:id});if(!j.ok){toast(lerr(j));return}
  const L=state.link;if(L){L.items=(L.items||[]).filter(i=>i.item_id!==id);L.accts=(L.accts||[]).filter(a=>a.item!==id);if(L.cursors)delete L.cursors[id];if(!L.items.length)state.link=null}
  queueSave();plan();acctsRender();toast('Bank removed. Your history is kept.')};

// in live mode the connect sheet is the Plaid flow (the "found" step reuses the app's own review screen)
// on your own server, Connect never quietly falls back to the demo: it checks again and says what's missing
{const _lo=lkOpen;lkOpen=function(){if(!LIVE.on)return _lo.apply(this,arguments);const args=arguments,self=this;
  (async()=>{if(!liveBank())await LIVE.check();if(liveBank())return LV.open();
    if(LIVE.st){closeSheets();setTimeout(()=>{xGo('server');toast(!LIVE.st.ready?'Your server isn’t fully set up yet. See what’s missing below.':LIVE.st.code!=='ok'?'Enter your access code to connect your bank':'Bank sync isn’t set up on your server yet')},closeSheetsDelay()+20);return}
    _lo.apply(self,args)})()}}
{const _r=lkRender;lkRender=function(){if(LK&&LK.live&&LK.step!=='found')return LV.render();return _r.apply(this,arguments)}}
{const _f=lkFinish;lkFinish=function(){if(!(LK&&LK.live&&LK.data))return _f.apply(this,arguments);const D=LK.data;PSINK={};
  try{_f.apply(this,arguments)}finally{const pm=PSINK;PSINK=null;
    state.link=Object.assign({},state.link||{},{on:1,live:1,at:Date.now(),items:LK.items,cursors:LK.cursors,accts:D.accts,pmap:pm,debtAcct:D.debtAcct,liab:D.liabMap||{},relink:[]});delete state.link.mock;if(typeof LG!=='undefined')LG.after(true);queueSave();plan()}}}

// ---- keeping it up to date ----
LV.sync=async()=>{const L=state.link;let added=0,repl=0,loops=0,relink=[],wait=false;
  for(;;){const j=await liveFetch('/api/plaid',{op:'sync',cursors:L.cursors||{}},{timeout:60000});if(!j.ok)throw j;
    L.pmap=L.pmap||{};PSINK=L.pmap;let more=false;
    try{j.items.forEach(it=>{if(it.status==='relink'){relink.push({item_id:it.item_id,inst:it.institution});return}if(it.status==='not_ready'||it.update==='NOT_READY'||it.update==='INITIAL_UPDATE_COMPLETE')wait=true;if(it.status!=='ok')return;
      // changed or removed transactions (like a pending charge that posted) come out first
      (it.removed||[]).concat((it.modified||[]).map(t=>t.id)).forEach(pid=>{const k=L.pmap[pid];if(!k)return;const i=state.spend.findIndex(s=>s.tid===k);if(i>=0)state.spend.splice(i,1);const h=HIST.findIndex(x=>x.k===k);if(h>=0)HIST.splice(h,1);delete L.pmap[pid]});
      const A={};(it.accounts||[]).forEach(a=>{A[a.id]=a;const o=(L.accts||[]).find(x=>x.id===a.id);if(o){o.cur=a.cur;o.avail=a.avail;if(a.limit!=null)o.limit=a.limit}else (L.accts=L.accts||[]).push({id:a.id,name:String(a.name||'Account').slice(0,40),mask:a.mask||'',kind:LKIND(a),inst:it.institution,item:it.item_id,cur:a.cur,avail:a.avail,limit:a.limit,sub:a.subtype})});
      (it.liabilities||[]).forEach(l=>{if(l&&l.acct)(L.liab=L.liab||{})[l.acct]={apr:l.apr,min:l.min,due:l.due,stmt:l.stmt,kind:l.kind}});
      const G={};(it.added||[]).concat(it.modified||[]).forEach(t=>{const a=A[t.acct]||(L.accts||[]).find(x=>x.id===t.acct);if(!a)return;const kind=a.type?LKIND(a):a.kind;if(kind==='other'||kind==='loan'||kind==='invest')return;const label=LLABEL(a);
        (G[label]=G[label]||{kind,rows:[]}).rows.push({d:t.date,a:-Math.round(+t.amount*100)/100,m:t.merchant||t.name||'Transaction',p:!!t.pending,pid:t.id,pfc:t.pfc,pfd:t.pfd})});
      Object.keys(G).forEach(label=>{const g=G[label],r=importCommit(buildReview(g.rows,label,g.kind==='card'?'card':'checking',false));added+=r.added;repl+=r.repl});
      if(!L.items.some(i=>i.item_id===it.item_id))L.items.push({item_id:it.item_id,inst:it.institution});
      if(it.cursor)L.cursors[it.item_id]=it.cursor;if(it.more)more=true})}finally{PSINK=null}
    // a bank this access code doesn't know about (for example, linked with a different code): ask to connect it again
    const got=new Set(j.items.map(i=>i.item_id));(L.items||[]).filter(i=>!got.has(i.item_id)).forEach(i=>{if(!relink.some(r=>r.item_id===i.item_id))relink.push({item_id:i.item_id,inst:i.inst,gone:1})});
    if(!more||++loops>=4)break}
  // balances: checking from the bank, debts follow their card or loan
  const chk=(L.accts||[]).filter(a=>a.kind==='checking'&&a.sub==='checking');if(chk.length){state.cash=Math.round(chk.reduce((s,a)=>s+(+(a.avail!=null?a.avail:a.cur)||0),0)*100)/100;state.cashAt=Date.now()}
  Object.keys(L.debtAcct||{}).forEach(id=>{const a=(L.accts||[]).find(x=>x.id===id),d=(state.debts||[]).find(x=>x.name===L.debtAcct[id]);if(a&&d&&a.cur!=null)d.bal=Math.max(0,Math.round(+a.cur*100)/100)});
  // keep the id map small: only recent transactions can still change
  const cut=fd(realDay()-60*MS);Object.keys(L.pmap||{}).forEach(k=>{if(String(L.pmap[k]).slice(0,10)<cut)delete L.pmap[k]});
  L.at=Date.now();L.relink=relink;state.asOf=todayStr;if(typeof LG!=='undefined')LG.after(false);plan();queueSave();histSave();return{added,repl,relink,wait}};
{const _s=lkSync;lkSync=async function(){if(!(state.link&&state.link.live))return _s.apply(this,arguments);if(syncing)return;syncing=true;const chip=document.querySelector('[data-sync]');if(chip)chip.classList.add('busy');
  try{const r=await LV.sync();if(r.wait&&(LV.retry=(LV.retry||0)+1)<=10){clearTimeout(LV.rt);LV.rt=setTimeout(()=>lkSync(),[4,4,6,8,10,15,20,30,45,60][LV.retry-1]*1000)}else if(!r.wait)LV.retry=0;toast(r.wait&&!r.added?'Your bank is still sending your history. Sprout will check again in a moment.':r.relink.length?'Reconnect '+r.relink.map(x=>x.inst).join(' and ')+' to keep syncing':r.added||r.repl?'Synced: '+r.added+' new'+(r.repl?', '+r.repl+' pending now posted':''):'Already up to date')}catch(j){toast(lerr(j))}
  syncing=false;if(chip)chip.classList.remove('busy');if(document.getElementById('sh-accts')&&!document.getElementById('sh-accts').hidden)acctsRender()}}
{const _ar=acctsRender;acctsRender=function(){const L=state.link;if(!(L&&L.live))return _ar.apply(this,arguments);const B=$('#ac-body');if(!B||B===DUMMY)return;
  const by={};(L.accts||[]).forEach(a=>{(by[a.item]=by[a.item]||[]).push(a)});const rl=new Set((L.relink||[]).map(r=>r.item_id));
  B.innerHTML=(L.items||[]).map(it=>'<div class="lvbank"><div class="lvbh"><b>'+esc(it.inst)+'</b>'+(rl.has(it.item_id)?'<button type="button" class="sbtn" data-lv="fix" data-v="'+esc(it.item_id)+'">Reconnect</button>':'<small>Read-only · synced '+agoTxt(L.at)+'</small>')+'</div>'+
      (by[it.item_id]||[]).map(a=>'<div class="lkrow"><div class="lki">'+(({checking:'▣',card:'▭',loan:'▤',invest:'◆'})[a.kind]||'▣')+'</div><div class="lkt"><b>'+esc(a.name)+(a.mask?' ••'+esc(a.mask):'')+'</b><small>'+(({checking:/savings|money market|cd|hsa/i.test(a.sub||'')?'Savings':'Checking',card:'Credit card',loan:'Loan',invest:'Investments'})[a.kind]||'Account')+'</small></div><span class="lvbal">'+(a.cur!=null?money(a.kind==='checking'&&a.avail!=null?+a.avail:+a.cur):'')+'</span></div>').join('')+
      '<button type="button" class="lnk" data-lv="rm" data-v="'+esc(it.item_id)+'" style="align-self:flex-start;color:var(--bad)">Remove this bank</button></div>').join('')+
    '<div class="row"><button type="button" class="btn" data-sync>'+(syncing?'Syncing…':'Sync now')+'</button><button type="button" class="btn alt" data-lkopen>Add a bank</button></div>'+
    '<p class="note" style="margin:0">Sprout syncs when you open it and when you pull down on Home. Pending charges count right away and are swapped for the final charge when they post.</p>'}}
// "Disconnect all" also removes the banks from your server
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-lkoff]');if(!t||!(state.link&&state.link.live)||!t.dataset.arm)return;e.stopImmediatePropagation();e.preventDefault();
  for(const it of (state.link.items||[]))await liveFetch('/api/plaid',{op:'remove',item_id:it.item_id});state.link=null;queueSave();plan();acctsRender();toast('Disconnected. Your history is kept.')},true);

// ---- Settings: Bank sync and AI ----
Object.assign(IC,{cloud:'M7 18a4 4 0 0 1-.6-8 6 6 0 0 1 11.5 1.5A3.5 3.5 0 0 1 17.5 18z'});
TITLES.server='Bank sync and AI';
PAGES.server=()=>{const st=LIVE.st;
  if(!st)return '<div class="xcard"><b>Can’t reach your Sprout server</b><small class="xhint">The app works on this phone on its own. Bank sync and AI need the server. Check your connection, or that the server is deployed.</small><div style="display:flex;gap:8px"><button class="sbtn" data-x="lvcheck">Try again</button></div></div>';
  const S=st.setup||{},ok=b=>'<span class="lvck'+(b?' on':'')+'">'+(b?'✓':'–')+'</span>';
  const plan=st.code==='ok'?({owner:'Plus (owner)',plus:'Plus',free:'Free'})[st.tier]||'Free':'';
  return '<div class="xcard"><h3>Your server</h3>'+
    '<div class="lvrow">'+ok(S.plaid)+'<span>Bank sync (Plaid)'+(S.plaid?' · '+(S.plaidEnv==='production'?'real banks':'test mode'):'')+'</span></div>'+
    '<div class="lvrow">'+ok(S.ai)+'<span>AI for Ask Sprout</span></div>'+
    '<div class="lvrow">'+ok(S.storage&&S.encryption)+'<span>Secure storage</span></div>'+
    '<div class="lvrow">'+ok(st.code==='ok')+'<span>Access code'+(plan?' · '+plan:'')+'</span></div></div>'+
    (st.ai?'<div class="xcard"><h3>AI cost this month</h3><b class="lvbig">$'+(+st.ai.spentThisMonth).toFixed(2)+' <small>of $'+(+st.ai.budget).toFixed(2)+' budget</small></b><small class="xhint">Model: '+esc(st.ai.model)+'. When the budget is used up, the AI pauses until next month and Sprout keeps answering what it can on the phone.'+(LIVE.stat.local+LIVE.stat.ai?' This session: '+LIVE.stat.local+' answered on the phone, '+LIVE.stat.ai+' by the AI.':'')+'</small></div>':'')+
    '<div class="xcard"><h3>'+(st.code==='ok'?'Change access code':'Enter your access code')+'</h3><small class="xhint">It’s the code you set on your server. It works like a password, so keep it private.</small>'+
    '<label class="f"><input id="lv-code" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Access code" value=""></label>'+
    '<div style="display:flex;gap:8px"><button class="sbtn" data-x="lvsave">Save</button>'+(st.code==='ok'?'<button class="sbtn alt" data-x="lvforget">Remove from this phone</button>':'')+'</div>'+(st.code&&st.code!=='ok'&&LIVE.code?'<small class="xhint lverr">'+esc(lerr({error:st.code}))+'</small>':'')+'</div>'};
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x=lvsave],[data-x=lvcheck],[data-x=lvforget]');if(!b)return;e.preventDefault();const a=b.dataset.x;
  if(a==='lvcheck'){await LIVE.check();xRender();return}
  if(a==='lvforget'){LIVE.code='';try{localStorage.removeItem(LCODE)}catch(_){}await LIVE.check();toast('Code removed from this phone');setTimeout(()=>location.reload(),700);return}
  const v=String(($('#lv-code').value)||'').trim();if(v.length<8){toast('Codes are at least 8 characters');return}
  LIVE.code=v;try{localStorage.setItem(LCODE,v)}catch(_){}b.disabled=true;await LIVE.check();b.disabled=false;
  if(liveOK()){toast('Connected. Restarting Sprout…');setTimeout(()=>location.reload(),800)}else{xRender();toast(lerr({error:(LIVE.st&&LIVE.st.code)||'offline'}))}});

// ---- alerts: real checks only (demo alerts stay in demo mode) ----
{const _al=alerts;alerts=function(){let A=_al.apply(this,arguments);const x=X(),nt=x.notif||{};
  const L=state.link,rl=L&&L.live?(L.relink||[]).map(r=>({id:'relink-'+r.item_id,t:'Reconnect '+r.inst,s:'Your bank needs you to sign in again so Sprout can keep syncing.',go:['lvbanks']})):[];
  let I=[];try{I=BR.insights().filter(i=>!(nt.dupe===false&&(i.k==='dup'||i.k==='odd'))&&!(nt.low===false&&i.k==='low')&&!(nt.bud===false&&i.k==='pace'))}catch(e){}
  const have=new Set(A.map(a=>a.id));return rl.filter(a=>!x.dis[a.id]).concat(A,I.filter(i=>!have.has(i.id)).slice(0,4))}}
TITLES.lvbanks='Connected accounts';
PAGES.lvbanks=()=>'<div class="xcard"><b>Reconnect your bank</b><small class="xhint">Open Connected accounts to sign in to your bank again.</small><div style="display:flex;gap:8px"><button class="sbtn" data-x="alertgo" data-v="lvbanks">Open Connected accounts</button></div></div>';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=alertgo][data-v=lvbanks]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();closeSheets();setTimeout(acctsOpen,closeSheetsDelay()+40)},true);

// connecting a bank or using the AI during setup needs the access code first
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-wact=connect],[data-wact=ai],[data-lkopen]');if(!b||!LIVE.on||!LIVE.st||liveOK())return;
  e.stopImmediatePropagation();e.preventDefault();closeSheets();setTimeout(()=>{xGo('server');toast('Enter your access code first')},closeSheetsDelay()+20)},true);
// ---- first launch with a server: ask for the code once, and finish any bank connection in progress ----
if(LIVE.on){const ready=()=>{try{return !!acctMe()&&!document.getElementById('auth')&&!document.body.classList.contains('booting')}catch(e){return false}};
  let n=0;const tick=async()=>{if(!ready()){if(++n<120)setTimeout(tick,500);return}await LIVE.ready;
    if(LIVE.st&&liveOK()){try{if(localStorage.getItem(LPEND))return LV.resume()}catch(e){}}
    if(LIVE.st&&LIVE.st.ready&&!liveOK()){let asked=null;try{asked=localStorage.getItem('sprout-code-asked')}catch(e){}if(!asked)setTimeout(()=>{if(document.querySelector('.sheet.on'))return;try{localStorage.setItem('sprout-code-asked','1')}catch(e){}xGo('server')},900)}
    // install tip for Safari on iPhone
    try{const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),sa=window.navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;if(ios&&!sa&&!localStorage.getItem('sprout-a2hs')){localStorage.setItem('sprout-a2hs','1');setTimeout(()=>toastAct('Install Sprout: tap Share, then Add to Home Screen','Got it',()=>{}),2500)}}catch(e){}};
  setTimeout(tick,800)}

// test hook (only when a developer turns it on in this browser)
try{if(window.localStorage.getItem('sprout-debug')==='1')window.__S={BR,LV,LIVE,st:()=>state,lkOpen:()=>lkOpen(),closeSheets,xGo,plan:()=>plan(),alerts:()=>alerts()}}catch(e){}

if(LIVE.on)document.addEventListener('visibilitychange',()=>{if(!document.hidden)LIVE.check()});
