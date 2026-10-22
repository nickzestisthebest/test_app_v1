// ---------- Pull down to refresh (at the top of any tab) ----------
const PTR={y0:null,d:0,busy:false,el:null};
function ptrEl(){if(PTR.el)return PTR.el;const e=document.createElement('div');e.id='ptr';e.setAttribute('aria-hidden','true');
  e.innerHTML='<span class="ptrc"><svg viewBox="0 0 24 24"><path class="ptra" d="M20 12a8 8 0 1 1-2.34-5.66"/><path class="ptrh" d="M20 4v4.5h-4.5"/></svg></span>';document.body.appendChild(e);return PTR.el=e}
const ptrTargets=()=>['ov','pg'].map(i=>document.getElementById(i)).filter(e=>e&&e.offsetParent);
const ptrBlocked=()=>document.body.classList.contains('lock')||document.querySelector('.sheet.on,#pmenu,#auth,.lockscr:not([hidden])')||(window.scrollY||document.documentElement.scrollTop)>0;
function ptrSet(d,anim){const e=ptrEl(),k=Math.min(1,d/72);e.style.transition=anim?'transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s':'none';
  e.style.transform='translate(-50%,'+(Math.min(d,96)-46)+'px)';e.style.opacity=d>4?1:0;e.querySelector('svg').style.transform='rotate('+(k*270)+'deg)';e.classList.toggle('ready',d>=72);
  ptrTargets().forEach(t=>{t.style.transition=anim?'translate .3s cubic-bezier(.2,.8,.2,1)':'none';t.style.translate=d>0?'0 '+Math.min(d*.6,64)+'px':''})}
async function ptrRun(){PTR.busy=true;const e=ptrEl();e.classList.add('spin');ptrSet(72,true);const t0=Date.now();
  try{if(state.link&&state.link.on){await lkSync()}
    else if(mode==='cloud'&&db&&uid&&!dirty){const snap=await Promise.race([db.doc(docPath()).get(),new Promise(r=>setTimeout(()=>r(null),6000))]);if(snap&&snap.exists){state=merge(snap.data());saveLocal()}}
  }catch(_){}
  try{await histLoad()}catch(_){}
  try{editors();plan();if(VIEW==='tab')pgRender()}catch(_){}
  await new Promise(r=>setTimeout(r,Math.max(0,650-(Date.now()-t0))));
  e.classList.remove('spin');ptrSet(0,true);PTR.busy=false;toast(state.link&&state.link.on?'Accounts synced just now':'Up to date')}
addEventListener('touchstart',ev=>{if(PTR.busy||ev.touches.length!==1||ptrBlocked()){PTR.y0=null;return}PTR.y0=ev.touches[0].clientY;PTR.d=0},{passive:true});
addEventListener('touchmove',ev=>{if(PTR.y0==null||PTR.busy)return;const dy=ev.touches[0].clientY-PTR.y0;if(dy<=0||(window.scrollY||0)>0){if(PTR.d){PTR.d=0;ptrSet(0,true)}return}
  PTR.d=dy*.5;ptrSet(PTR.d,false);if(ev.cancelable)ev.preventDefault()},{passive:false});
addEventListener('touchend',()=>{if(PTR.y0==null)return;PTR.y0=null;if(PTR.busy)return;if(PTR.d>=72){PTR.d=0;ptrRun()}else{PTR.d=0;ptrSet(0,true)}});
addEventListener('touchcancel',()=>{if(PTR.y0!=null&&!PTR.busy){PTR.y0=null;PTR.d=0;ptrSet(0,true)}});
