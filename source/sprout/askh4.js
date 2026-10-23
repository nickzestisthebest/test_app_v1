// ===================== Ask history: every chat is kept, easy to find, reopen and keep going =====================
// Chats live with the account (X().askh), so they follow the person across devices with their backup. The rich cards
// under an answer (plans, sliders) are cached on this device only. A chat idle for 3 hours starts fresh next time.
const ASKH={IDLE:3*3600e3,MAX:40,MSG:60};
{
window.ASKN=ASKH.MSG;
const S=()=>{const x=X();if(!x.askh||typeof x.askh!=='object')x.askh={cur:null,list:[]};if(!Array.isArray(x.askh.list))x.askh.list=[];return x.askh};
const HK=id=>'sprout-askh-h-'+id;
const uid=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clip=(s,n)=>{s=String(s||'').replace(/(^|\n)\s*(?:[-•*]|\d+[.)])\s+/g,'$1').replace(/([^.!?:])\n+/g,'$1. ').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s};
ASKH.titleOf=m=>{const q=(m.find(x=>x.me!=null&&x.me!=='(screenshot)')||{}).me;if(!q)return 'Screenshot scan';const t=clip(q,44);return t.charAt(0).toUpperCase()+t.slice(1)};
ASKH.find=id=>S().list.find(r=>r.id===id)||null;
ASKH.ser=()=>chat.filter(c=>!(c.ai===null&&c.me==null)).slice(-ASKH.MSG).map(c=>{if(c.me!=null)return{me:String(c.me).slice(0,1200),n:c.imgs&&c.imgs.length||0};
  const o={ai:String(c.ai==null?'':c.ai).slice(0,4000)};['err','cached','local'].forEach(k=>{if(c[k])o[k]=1});
  if(c.items&&c.items.length)o.items=c.items.slice(0,60);if(c.changes&&c.changes.length){o.changes=c.changes.slice(0,12);o.state=c.state==='pending'?'dropped':c.state}
  if(c.errors&&c.errors.length)o.errors=c.errors.slice(0,6);if(c.btns&&c.btns.length)o.btns=c.btns.slice(0,6);if(c.wifs&&c.wifs.length)o.wifs=c.wifs.slice(0,3);return o});
// keep the open chat saved as it changes
ASKH.save=()=>{try{const m=ASKH.ser();if(!m.length)return;const s=S();let r=s.cur&&ASKH.find(s.cur);
    if(!r){r={id:uid(),c:Date.now(),t:'',m:[]};s.list.unshift(r);s.cur=r.id}
    const changed=JSON.stringify(m)!==JSON.stringify(r.m);r.m=m;if(!r.tt)r.t=ASKH.titleOf(m);try{r.ctx=JSON.parse(JSON.stringify(ASK4.ctx||{}))}catch(e){}
    if(changed)r.u=Date.now();else if(!r.u)r.u=r.c;
    // the rich parts of answers, on this device
    const h={};m.forEach(x=>{if(x.ai&&typeof FZ!=='undefined'&&FZ.H&&FZ.H[x.ai])h[x.ai]=FZ.H[x.ai]});try{if(Object.keys(h).length)localStorage.setItem(HK(r.id),JSON.stringify(h))}catch(e){}
    s.list.sort((a,b)=>(b.u||b.c)-(a.u||a.c));
    while(s.list.length>ASKH.MAX){const old=s.list.pop();try{localStorage.removeItem(HK(old.id))}catch(e){}}
    if(changed)queueSave()}catch(e){if(window.__brainDebug)console.error(e)}};
let _t=null;ASKH.soon=()=>{clearTimeout(_t);_t=setTimeout(ASKH.save,350)};
// open a past chat: it comes back exactly as it was, and you can keep asking
ASKH.load=id=>{ASKH.save();const r=ASKH.find(id);if(!r)return;chat.length=0;
  let h={};try{h=JSON.parse(localStorage.getItem(HK(id))||'{}')||{}}catch(e){}
  r.m.forEach(x=>{if(x.me!=null){chat.push({me:x.me,imgs:[]});return}const c=Object.assign({},x);if(c.state==='pending')c.state='dropped';chat.push(c);if(h[x.ai]&&typeof FZ!=='undefined'&&FZ.H)FZ.H[x.ai]=h[x.ai]});
  try{pending=null;undoState=null}catch(e){}
  try{ASK4.ctx=Object.assign({},r.ctx||{});if(r.ctx&&r.ctx.at)ASK4.ctx.at=Date.now()}catch(e){}
  try{if(typeof FZ!=='undefined')FZ.ctx=null}catch(e){}
  S().cur=id;ASKH.close();drawChat();setTimeout(()=>{try{const th=document.querySelector('#cmd-out .thread');if(th&&th.lastElementChild)th.lastElementChild.scrollIntoView({block:'end'})}catch(e){}},60);ASKH.head()};
ASKH.fresh=()=>{ASKH.save();chat.length=0;try{pending=null;undoState=null}catch(e){}try{ASK4.ctx={}}catch(e){}try{if(typeof FZ!=='undefined')FZ.ctx=null}catch(e){}S().cur=null;drawChat();ASKH.close();ASKH.head();
  try{if(typeof askPreview==='function')askPreview()}catch(e){}try{ASK4.chips()}catch(e){}setTimeout(()=>{const i=$('#cmd-in');if(i&&i.focus)i.focus()},120)};
ASKH.del=id=>{const s=S(),i=s.list.findIndex(r=>r.id===id);if(i<0)return;const r=s.list[i];let h=null;try{h=localStorage.getItem(HK(id));localStorage.removeItem(HK(id))}catch(e){}
  s.list.splice(i,1);const wasCur=s.cur===id;if(wasCur){s.cur=null;chat.length=0;drawChat();ASKH.head()}queueSave();ASKH.draw();
  D4.undo('Chat deleted',()=>{const s2=S();s2.list.splice(Math.min(i,s2.list.length),0,r);try{if(h)localStorage.setItem(HK(id),h)}catch(e){}queueSave();if(wasCur)ASKH.load(id);else ASKH.draw()})};
ASKH.rename=(id,t)=>{const r=ASKH.find(id);if(!r)return;t=clip(t,60);if(!t){r.tt=0;r.t=ASKH.titleOf(r.m)}else{r.t=t;r.tt=1}queueSave()};
// ---------- when ----------
ASKH.group=t=>{const d=new Date(t),n=new Date(),day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(),dd=Math.round((day(n)-day(d))/864e5);
  if(dd<=0)return 'Today';if(dd===1)return 'Yesterday';if(dd<7)return 'Previous 7 days';if(dd<30)return 'Previous 30 days';
  return d.toLocaleDateString('en-US',d.getFullYear()===n.getFullYear()?{month:'long'}:{month:'long',year:'numeric'})};
ASKH.when=t=>{const d=new Date(t),g=ASKH.group(t);if(g==='Today')return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});if(g==='Yesterday')return 'Yesterday';if(g==='Previous 7 days')return d.toLocaleDateString('en-US',{weekday:'short'});return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})};
// ---------- the header: history on the left, new chat on the right ----------
const IH='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4.5v4h4"/><path d="M12 7.5V12l3 2"/></svg>';
const IB='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const IN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h8"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
ASKH.mount=()=>{const sh=document.getElementById('sh-ask');if(!sh)return;const ph=sh.querySelector('.ph'),pn=sh.querySelector('.panel');if(!ph||!pn)return;
  if(!ph.querySelector('#askh-btn')){ph.classList.add('askhph');const h2=ph.querySelector('h2');h2.insertAdjacentHTML('beforebegin','<button type="button" class="askhb" id="askh-btn" aria-label="Your chats" title="Your chats">'+IH+'</button>');
    const done=ph.querySelector('[data-close]');done.insertAdjacentHTML('beforebegin','<button type="button" class="askhb" id="askh-new" aria-label="New chat" title="New chat">'+IN+'</button>')}
  if(!pn.querySelector('.askh'))pn.insertAdjacentHTML('beforeend','<div class="askh" id="askh" hidden><div class="askhs"><input id="askh-q" type="search" placeholder="Search your chats" aria-label="Search your chats" autocomplete="off"><button type="button" class="sbtn" id="askh-new2">New chat</button></div><div id="askh-list" class="askhl"></div></div>');
  ASKH.head()};
ASKH.isOpen=()=>{const p=document.querySelector('#sh-ask .panel');return !!(p&&p.classList.contains('hopen'))};
ASKH.head=()=>{const b=document.getElementById('askh-btn'),n=document.getElementById('askh-new'),t=document.getElementById('sh-ask-t');if(!b||!t)return;const open=ASKH.isOpen();
  b.innerHTML=open?IB:IH;b.setAttribute('aria-label',open?'Back to chat':'Your chats');b.title=open?'Back to chat':'Your chats';
  const cnt=S().list.length;b.classList.toggle('dim',!open&&!cnt&&!chat.length);
  t.textContent=open?'Your chats':(t.dataset.name||(t.dataset.name=t.textContent));if(n)n.hidden=open||!chat.length};
ASKH.open=()=>{ASKH.save();const p=document.querySelector('#sh-ask .panel');if(!p)return;p.classList.add('hopen');document.getElementById('askh').hidden=false;const q=document.getElementById('askh-q');if(q)q.value='';ASKH.draw();ASKH.head()};
ASKH.close=()=>{const p=document.querySelector('#sh-ask .panel');if(!p)return;p.classList.remove('hopen');const h=document.getElementById('askh');if(h)h.hidden=true;ASKH.head()};
// ---------- the list ----------
const hl=(s,q)=>{const e=esc(s);if(!q)return e;const i=s.toLowerCase().indexOf(q);if(i<0)return e;return esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+q.length))+'</mark>'+esc(s.slice(i+q.length))};
ASKH.draw=()=>{const box=document.getElementById('askh-list');if(!box)return;const q=String((document.getElementById('askh-q')||{}).value||'').toLowerCase().trim(),s=S();
  let L=s.list.filter(r=>r.m&&r.m.length);
  const rows=[];L.forEach(r=>{let snip='',hit=!q;const lastAi=[...r.m].reverse().find(x=>x.ai)||{},lastMe=[...r.m].reverse().find(x=>x.me!=null)||{};snip=clip(lastAi.ai||lastMe.me||'',90);
    if(q){if((r.t||'').toLowerCase().includes(q))hit=true;const m=hit?null:r.m.find(x=>String(x.me!=null?x.me:x.ai||'').toLowerCase().includes(q));if(m){hit=true;const tx=String(m.me!=null?m.me:m.ai).replace(/\*\*/g,'').replace(/\s+/g,' '),i=tx.toLowerCase().indexOf(q);snip=(i>40?'…'+tx.slice(i-30,i+70):tx.slice(0,100))}}
    if(hit)rows.push({r,snip})});
  if(!L.length){box.innerHTML='<div class="askhe">'+IH+'<b>No past chats yet</b><span>Each chat is saved here so you can come back to it, keep asking, rename it or delete it.</span></div>';return}
  if(!rows.length){box.innerHTML='<div class="askhe"><b>Nothing matches “'+esc(q)+'”</b><span>Try a store, an amount or a word from your question.</span></div>';return}
  let g0='',h='';rows.forEach(({r,snip})=>{const g=ASKH.group(r.u||r.c);if(g!==g0){h+='<div class="askhg">'+esc(g)+'</div>';g0=g}const qn=r.m.filter(x=>x.me!=null).length;
    h+='<div class="askhr'+(r.id===s.cur?' cur':'')+'" data-askh="'+r.id+'"><button type="button" class="askho" data-askh-open="'+r.id+'"><span class="askht">'+hl(r.t||'Chat',q)+'</span><span class="askhp">'+hl(snip,q)+'</span><span class="askhm">'+ASKH.when(r.u||r.c)+' · '+qn+(qn===1?' question':' questions')+(r.id===s.cur&&chat.length?'<i class="askhnow">Open now</i>':'')+'</span></button><button type="button" class="askhx" data-askh-more="'+r.id+'" aria-label="More for this chat">⋯</button></div>'});
  box.innerHTML=h};
// ---------- taps ----------
document.addEventListener('click',e=>{const t=e.target,c=s=>t.closest&&t.closest(s);let b;
  if(c('#askh-btn')){e.preventDefault();if(ASKH.isOpen())ASKH.close();else ASKH.open();return}
  if(c('#askh-new')||c('#askh-new2')){e.preventDefault();ASKH.fresh();return}
  if((b=c('[data-askh-open]'))){e.preventDefault();const id=b.dataset.askhOpen;if(S().cur===id&&chat.length){ASKH.close();return}ASKH.load(id);return}
  if((b=c('[data-askh-more]'))){e.preventDefault();const row=b.closest('.askhr'),open=row.querySelector('.askhact');document.querySelectorAll('#askh .askhact').forEach(x=>x.remove());if(open)return;
    row.insertAdjacentHTML('beforeend','<div class="askhact"><button type="button" class="sbtn alt" data-askh-ren="'+b.dataset.askhMore+'">Rename</button><button type="button" class="sbtn bad" data-askh-del="'+b.dataset.askhMore+'">Delete</button></div>');return}
  if((b=c('[data-askh-del]'))){e.preventDefault();ASKH.del(b.dataset.askhDel);return}
  if((b=c('[data-askh-ren]'))){e.preventDefault();const id=b.dataset.askhRen,r=ASKH.find(id),row=b.closest('.askhr');if(!r||!row)return;const ttl=row.querySelector('.askht');
    row.querySelector('.askhact').remove();ttl.outerHTML='<span class="askht"><input class="askhin" maxlength="60" value="'+esc(r.t||'')+'" aria-label="Chat name"></span>';const inp=row.querySelector('.askhin');row.querySelector('.askho').disabled=true;inp.focus();inp.select();
    const done=()=>{if(inp.dataset.done)return;inp.dataset.done=1;ASKH.rename(id,inp.value);ASKH.draw()};inp.addEventListener('blur',done);inp.addEventListener('keydown',k=>{if(k.key==='Enter'){k.preventDefault();done()}if(k.key==='Escape'){inp.value=r.t;done()}});return}},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='askh-q')ASKH.draw()});
// ---------- keep it saved, and start fresh after a long pause ----------
{const _dc=drawChat;drawChat=function(){const r=_dc.apply(this,arguments);try{if(!undoState)document.querySelectorAll('#cmd-out #cmd-undo').forEach(b=>b.remove());ASKH.soon();ASKH.head()}catch(e){}return r}}
let _acc=null;
{const _os=openSheet;openSheet=function(id){try{if(id==='sh-ask'){ASKH.mount();const s=S(),a=typeof ACC!=='undefined'?ACC:null;
      // another account on this phone: its own chats
      if(_acc!==null&&a!==_acc){chat.length=0;try{pending=null;undoState=null;ASK4.ctx={}}catch(e){}}_acc=a;
      const r=s.cur&&ASKH.find(s.cur);
      if(chat.length&&r&&Date.now()-(r.u||r.c)>ASKH.IDLE){ASKH.save();chat.length=0;s.cur=null;try{ASK4.ctx={}}catch(e){}drawChat()}
      else if(!chat.length&&r&&Date.now()-(r.u||r.c)<=ASKH.IDLE){ASKH.load(r.id)}
      else if(!chat.length)s.cur=null;
      ASKH.close()}}catch(e){if(window.__brainDebug)console.error(e)}return _os.apply(this,arguments)}}
// closing the sheet saves right away
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#sh-ask [data-close]'))ASKH.save()},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')ASKH.save()});
setTimeout(ASKH.mount,1500);
try{if(window.__S)window.__S.ASKH=ASKH}catch(e){}
}
