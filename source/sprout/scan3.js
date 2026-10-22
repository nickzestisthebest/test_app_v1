// ===================== Scans 3: keep going in the background, read recordings fully, and know Cash App Borrow =====================
const SC3={};
{
const r2=MX.r2;
// ---------- recordings: look at many more moments, skip blank or locked screens, keep the frames that show something new ----------
LG.vidFrames=async(file,max)=>{const url=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.src=url;
  try{await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=()=>no(new Error('video'));setTimeout(()=>no(new Error('timeout')),20000)});try{await v.play();v.pause()}catch(e){}
    const dur=Math.min(+v.duration||0,240);if(!(dur>0)||!v.videoWidth)throw new Error('video');
    const W=Math.min(1080,v.videoWidth),H=Math.round(v.videoHeight*W/v.videoWidth),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    const s=document.createElement('canvas');s.width=32;s.height=64;const sg=s.getContext('2d',{willReadFrequently:true});
    const seek=t=>new Promise(ok=>{const done=()=>{v.removeEventListener('seeked',done);ok()};v.addEventListener('seeked',done);v.currentTime=t;setTimeout(done,3000)});
    const n=Math.min(120,Math.max(6,Math.ceil(dur/0.35))),got=[];let prev=null;
    for(let i=0;i<n;i++){if(SC3.cancel)throw new Error('cancelled');await seek(Math.min(dur-0.05,(i+0.5)*dur/n));g.drawImage(v,0,0,W,H);sg.drawImage(c,0,0,32,64);
      const px=sg.getImageData(0,0,32,64).data,sig=new Float32Array(32*64);let sum=0;for(let k=0;k<sig.length;k++){sig[k]=(px[k*4]+px[k*4+1]+px[k*4+2])/3;sum+=sig[k]}
      const mean=sum/sig.length;let vr=0;for(let k=0;k<sig.length;k++)vr+=(sig[k]-mean)*(sig[k]-mean);const sd=Math.sqrt(vr/sig.length);
      // a blank, black or nearly empty frame (a passcode or Face ID screen, a transition) has almost no detail
      if(sd<14||mean<18)continue;
      let diff=1;if(prev){let t=0;for(let k=0;k<sig.length;k++)t+=Math.abs(sig[k]-prev[k]);diff=t/sig.length/255}
      if(diff>=0.035){prev=sig;const b=await new Promise(r=>c.toBlob(x=>r(x),'image/jpeg',0.85));if(b)got.push({b,sd})}
      const r=document.querySelector('#sc-body .scread small');if(r)r.textContent='Looking through your recording… '+Math.round((i+1)/n*100)+'%'}
    if(got.length<=max)return got.map(x=>x.b);
    // spread the picks across the whole recording so a long scroll isn't cut short
    const out=[];for(let i=0;i<max;i++)out.push(got[Math.round(i*(got.length-1)/(max-1))].b);return out}
  finally{try{URL.revokeObjectURL(url)}catch(e){}}};
SC3.MAX=14;
// recordings get up to 14 frames instead of 8
document.addEventListener('change',async e=>{const t=e.target;if(!t||t.id!=='sc-file')return;const fs=[...(t.files||[])],vid=fs.find(f=>/^video\//.test(f.type));if(!vid)return;e.stopImmediatePropagation();t.value='';
  SC3.cancel=false;SC3.started=Date.now();SC.imgs=[];SC.step='read';SC.vid=true;scRender();let frames=[];try{frames=await LG.vidFrames(vid,SC3.MAX)}catch(err){frames=[];if(SC3.cancel)return}
  if(SC3.cancel)return;
  if(!frames.length){SC.step='review';SC.items=[];SC.note='Sprout couldn’t find anything readable in that recording. Try screenshots instead, or a recording that pauses on each screen.';SC.vid=false;scRender();return}
  const imgs=fs.filter(f=>/^image\//.test(f.type));await scRead(frames.concat(imgs).slice(0,SC3.MAX+2));SC.vid=false},true);
{const _sr=scRead;scRead=async function(files){if(files&&files.length>8){const keep=SC3.MAX+2;files=files.slice(0,keep)}return _sr.call(this,files)}}
// ---------- Cash App Borrow: borrowed money is a debt, not income ----------
{const _li=scLoadItems;scLoadItems=function(items,note){if(SC3.cancel)return;try{(items||[]).forEach(i=>{const n=String(i.name||'')+' '+String(i.prov||'')+' '+String(i.memo||'');
      if(i.type==='borrow'||(/\bborrow\b/i.test(n)&&/cash ?app/i.test(n+' '+(i.via||'')))){if(i.dir==='in'||i.type==='borrow'){i.borrow=1;i.type='borrow'}if(i.type==='scheduled'||i.dir==='out'&&isDate(i.d)&&pd(i.d)>realDay()){i.prov='Cash App Borrow';i.borrowPay=1}}})}catch(e){}
  const r=_li.call(this,items,note);try{SC.items.forEach(it=>{if(it.borrow&&!it.borrowPay){it.skip='borrowed money, added to what you owe';it.st='skip'}})}catch(e){}
  // grouped by app, then date, so a long list is easy to check
  try{const ord={new:0,plan:1,link:2,dupe:3,twin:4};SC.items.sort((a,b)=>((a.st in ord)?ord[a.st]:9)-((b.st in ord)?ord[b.st]:9)||String(a.via||'').localeCompare(String(b.via||''))||String(b.d).localeCompare(String(a.d)))}catch(e){}
  SC3.done();return r}}
{const _cm0=scCommit;scCommit=function(){const r=_cm0.apply(this,arguments);try{SC.committed=true}catch(e){}return r}}
{const _cm=scCommit;scCommit=function(){const B=SC.items.filter(it=>it.borrow&&!it.borrowPay&&!it.off),P=SC.items.filter(it=>it.borrowPay&&it.st==='plan'&&!it.off);
  P.forEach(it=>{it.pname='Cash App Borrow'});const r=_cm.apply(this,arguments);
  try{if(B.length&&!P.length){const tot=r2(B.reduce((a,i)=>a+i.amt,0)),d=(state.debts||[]).find(x=>/cash app borrow/i.test(x.name));if(d)d.bal=r2(+d.bal+tot);else state.debts.push({name:'Cash App Borrow',bal:tot,apr:0,min:0,day:0,extra:false,skippable:false,aprZero:1});plan();queueSave();toast('Cash App Borrow added to what you owe: '+money(tot))}
    // its repayment is a can-wait payment, not a must-pay installment
    (state.sched||[]).forEach(x=>{if(/^Cash App Borrow/.test(x.name)&&x.group==='Affirm')x.group='Cash App'});plan()}catch(e){}return r}}
// ---------- a total to check against the screen ----------
{const _rd=scRender;scRender=function(){const r=_rd.apply(this,arguments);try{const B=$('#sc-body');if(!B||B===DUMMY)return r;const hd=document.querySelector('#sh-scan .ph [data-close]');
    if(SC.step==='read'){if(hd)hd.textContent='Hide';if(!B.querySelector('[data-sc3cancel]'))B.insertAdjacentHTML('beforeend','<p class="xhint sc3h">You can hide this and keep using Sprout. It keeps reading and tells you when it’s ready.</p><button type="button" class="btn alt" data-sc3cancel>Cancel</button>')}
    else{if(hd)hd.textContent='Done'}
    if(SC.step==='review'){const nw=SC.items.filter(i=>i.st==='new'&&!i.off),tot=r2(nw.reduce((a,i)=>a+(i.cat==='Income'?0:i.amt),0)),inn=r2(nw.reduce((a,i)=>a+(i.cat==='Income'?i.amt:0),0));
      if(nw.length>1&&!B.querySelector('.sc3tot'))B.insertAdjacentHTML('afterbegin','<div class="sc3tot"><b>'+nw.length+' new</b><span>'+(tot>0?'−'+money(tot)+' out':'')+(tot>0&&inn>0?' · ':'')+(inn>0?'+'+money(inn)+' in':'')+'</span><small>Check that this matches what you see.</small></div>')}}catch(e){}return r}}
// ---------- keep going in the background ----------
SC3.done=()=>{const sh=document.getElementById('sh-scan'),hidden=!sh||sh.hidden||!sh.classList.contains('on');if(!hidden)return;const n=SC.items.filter(i=>(i.st==='new'||i.st==='plan')&&!i.skip).length;
  toastAct(n?'Your scan is ready: '+n+' to review':'Your scan is done','Review',()=>{scRender();openSheet('sh-scan')});
  try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.getRegistration().then(reg=>{if(reg)reg.showNotification('Sprout',{body:n?'Your scan is ready: '+n+' to review':'Your scan is done',tag:'sprout-scan',data:{url:'/?go=scan'}})})}catch(e){}};
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-sc3cancel]')))return;e.preventDefault();SC3.cancel=true;SC={step:'pick',imgs:[],items:[],note:'',busy:false};scRender();toast('Scan cancelled')},true);
// opening Scan again picks up where it was instead of starting over
{const _so=scanOpen;scanOpen=function(){if(SC&&!SC.committed&&(SC.step==='read'||(SC.step==='review'&&SC.items.some(i=>i.st==='new'||i.st==='plan')))){closeSheets();setTimeout(()=>{scRender();openSheet('sh-scan')},closeSheetsDelay());return}SC3.cancel=false;return _so.apply(this,arguments)}}
{const _sr2=scRead;scRead=async function(){SC3.cancel=false;return _sr2.apply(this,arguments)}}
try{if(window.__S)window.__S.SC3=SC3}catch(e){}
}
