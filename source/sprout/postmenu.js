// ---------- Post "..." menu, report reasons, and a review queue for moderators ----------
const RREASONS=[['harass','Harassment, hate or bullying'],['scam','Scam or asking for money'],['spam','Spam, selling or investment pitch'],['private','Sharing private info'],['harm','Self-harm or someone in danger'],['other','Something else']];
const SR=()=>{const s=CS();s.hideP=s.hideP||{};s.removed=s.removed||{};s.susp=s.susp||{};s.reports=s.reports||[];return s};
let MODOK=false;setTimeout(async()=>{try{if(typeof userNS!=='undefined'&&userNS&&await userNS.isOwner())MODOK=true}catch(e){}},2500);
const modOK=()=>MODOK||!!(acctMe()||{}).demo||!!window.__mod;
// hidden, removed and suspended posts drop out of the feed
{const _ph=postHTML;postHTML=p=>{const s=SR();if(s.hideP[p.id]||s.removed[p.id]||s.susp[p.who])return '';return _ph(p)}}
let PM=null;
function pmClose(){const m=document.getElementById('pmenu');if(!m)return;m.classList.remove('on');setTimeout(()=>m.remove(),220);PM=null}
function pmOpen(o){pmClose();PM=o;const m=document.createElement('div');m.id='pmenu';m.innerHTML='<div class="pmbg" data-pm="close"></div><div class="pmbox" role="dialog" aria-modal="true" aria-label="Post options"></div>';document.body.appendChild(m);pmRender();requestAnimationFrame(()=>m.classList.add('on'))}
function pmRender(){const box=document.querySelector('#pmenu .pmbox');if(!box||!PM)return;const o=PM,s=SR();let h='';
  if(o.step==='reasons'){h='<div class="pmh"><b>Why are you reporting this?</b><span>Your report is private. '+esc(o.who)+' won’t know it was you.</span></div>'+
    RREASONS.map(r=>'<button class="pmi" data-pm="reason" data-v="'+r[0]+'">'+r[1]+'<span class="pmchev">›</span></button>').join('')+
    '<button class="pmi pmc" data-pm="back">Back</button>'}
  else if(o.step==='done'){h='<div class="pmh pmdone"><b>Thanks for reporting</b><span>We’ll review it against the community guidelines. '+(o.kind==='post'?'This post is now hidden for you.':'')+'</span></div>'+
    (s.block[o.who]?'':'<button class="pmi" data-pm="block">Also block '+esc(o.who)+'</button>')+(o.reason==='harm'?'<p class="pmnote">If someone may be in danger, call 911. For emotional support, call or text 988.</p>':'')+'<button class="pmi pmc" data-pm="close">Done</button>'}
  else if(o.mine){h='<div class="pmh"><b>Your post</b></div>'+(o.step==='del'?'<button class="pmi pmbad" data-pm="del2">Tap again to delete</button>':'<button class="pmi pmbad" data-pm="del">Delete post</button>')+'<button class="pmi pmc" data-pm="close">Cancel</button>'}
  else{h='<div class="pmh"><b>'+esc(o.who)+'’s post</b></div>'+
    '<button class="pmi" data-pm="report">Report post<small>Tell us it breaks the guidelines</small></button>'+
    '<button class="pmi" data-pm="hide">Hide this post<small>Only for you</small></button>'+
    '<button class="pmi" data-pm="mute">Mute '+esc(o.who)+'<small>Stop seeing their posts. They won’t know.</small></button>'+
    (s.block[o.who]?'':'<button class="pmi pmbad" data-pm="block">Block '+esc(o.who)+'<small>They can’t message you</small></button>')+
    '<button class="pmi pmc" data-pm="close">Cancel</button>'}
  box.innerHTML=h;const f=box.querySelector('button');if(f)f.focus({preventScroll:true})}
function repAdd(o,reason){const s=SR();const r={id:'r'+Date.now(),kind:o.kind,target:o.id||'',who:o.who,txt:String(o.txt||'').slice(0,500),reason,at:Date.now(),by:(acctMe()||{}).first||'Member',status:'open'};s.reports.unshift(r);if(s.reports.length>200)s.reports.length=200;
  if(o.kind==='post'&&o.id)s.hideP[o.id]=1;sv();afterChange();return r}
// the "..." button on posts opens the menu instead of reporting right away
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=report]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  const p=allPosts().find(z=>z.id===b.dataset.v);if(!p)return;pmOpen({kind:'post',id:p.id,who:p.who,txt:p.txt,mine:!!p.mine})},true);
// Report in chats and on profiles asks for a reason too
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=ureport]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  const n=b.dataset.v;let txt='';try{const L=[...document.querySelectorAll('#x-body .bub:not(.me) p, #x-body .bub:not(.me)')].map(z=>z.textContent.trim()).filter(Boolean);txt=L.slice(-3).join(' / ')}catch(_){}
  pmOpen({kind:document.querySelector('#x-body [data-x=dmsend]')?'message':'member',who:n,txt,step:'reasons'})},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pm]');if(!b||!PM)return;const a=b.dataset.pm,o=PM,s=SR();
  if(a==='close')return pmClose();
  if(a==='back'){if(o.kind!=='post')return pmClose();o.step='';pmRender();return}
  if(a==='report'){o.step='reasons';pmRender();return}
  if(a==='reason'){o.reason=b.dataset.v;repAdd(o,b.dataset.v);o.step='done';pmRender();return}
  if(a==='hide'){s.hideP[o.id]=1;sv();afterChange();pmClose();toastAct('Post hidden','Undo',()=>{delete SR().hideP[o.id];sv();afterChange()});return}
  if(a==='mute'){s.mute[o.who]=1;sv();afterChange();pmClose();toastAct(o.who+' is muted','Undo',()=>{delete CS().mute[o.who];sv();afterChange()});return}
  if(a==='block'){s.block[o.who]=Date.now();s.mute[o.who]=1;sv();afterChange();pmClose();toast(o.who+' is blocked. They can’t message you, and you won’t see their posts.');return}
  if(a==='del'){o.step='del';pmRender();return}
  if(a==='del2'){const x=X();x.soc.posts=x.soc.posts.filter(z=>z.id!==o.id);if(!x.soc.posts.length||allPosts().some(z=>z.id===o.id))s.hideP[o.id]=1;sv();afterChange();pmClose();toast('Post deleted');return}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&PM)pmClose()});
// ---- review queue (moderators only) ----
const RLBL=Object.fromEntries(RREASONS);
PAGES.modq=arg=>{if(!modOK())return '<div class="xcard"><p class="xhint" style="margin:0">Only Sprout moderators can see this.</p></div>';const s=SR(),open=arg!=='done',L=s.reports.filter(r=>open?r.status==='open':r.status!=='open');
  const dt=t=>new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const ST={removed:'Removed',kept:'Kept, no action',suspended:'Member suspended'};
  return '<div class="xcard mqhead"><b>'+s.reports.filter(r=>r.status==='open').length+' open</b><span>Reports from members land here. Review each against the guidelines, oldest first.</span></div>'+
   '<div class="mqseg"><button class="'+(open?'on':'')+'" data-x="open" data-v="modq">Open</button><button class="'+(open?'':'on')+'" data-x="open" data-v="modq" data-w="done">Resolved</button></div>'+
   (L.length?L.map(r=>'<div class="xcard mq"><div class="mqtop"><span class="mqtag">'+esc(RLBL[r.reason]||r.reason)+'</span><small>'+({post:'Post',message:'Message',member:'Profile'}[r.kind]||'')+' · '+dt(r.at)+'</small></div>'+
     '<p class="mqwho">From <b>'+esc(r.who)+'</b>, reported by '+esc(r.by)+'</p>'+(r.txt?'<blockquote>'+esc(r.txt)+'</blockquote>':'')+
     (open?'<div class="mqact">'+(r.kind==='post'?'<button class="sbtn" data-x="mqdo" data-v="'+r.id+'" data-w="removed">Remove post</button>':'')+'<button class="sbtn alt" data-x="mqdo" data-v="'+r.id+'" data-w="kept">Keep</button><button class="sbtn bad" data-x="mqdo" data-v="'+r.id+'" data-w="suspended">Suspend member</button></div>'
       :'<p class="mqres">'+(ST[r.status]||r.status)+(r.done?' · '+dt(r.done):'')+'</p>')+'</div>').join('')
     :'<div class="xcard"><p class="xhint" style="margin:0">'+(open?'Nothing to review. Nice.':'No resolved reports yet.')+'</p></div>')+
   demoNote('Demo: this shows reports made in this app. At launch, reports from every member go to a private queue on Sprout’s server, and moderators get an email alert.')};
Object.assign(TITLES,{modq:'Review reports'});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=mqdo]');if(!b||!modOK())return;const s=SR(),r=s.reports.find(z=>z.id===b.dataset.v);if(!r)return;
  r.status=b.dataset.w;r.done=Date.now();if(r.status==='removed'&&r.target)s.removed[r.target]=1;if(r.status==='suspended')s.susp[r.who]=Date.now();sv();afterChange();
  toast({removed:'Post removed for everyone',kept:'Marked as reviewed',suspended:r.who+' is suspended'}[r.status]);try{xRender()}catch(_){}});
