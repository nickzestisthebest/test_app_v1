// ===================== Plus 4: a trial you can actually cancel (and resume), honest about access codes, no promised savings =====================
const PL4={};
{
PL4.ends=()=>{const x=X(),s=(x.plus&&x.plus.start)||Date.now();return s+7*864e5};
PL4.endTxt=()=>new Date(PL4.ends()).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
// a canceled trial keeps Plus until the end date, then turns off by itself
{const _pi=plusIs;plusIs=()=>{const x=X();if(!(typeof liveOK==='function'&&liveOK())&&x.plus&&x.plus.on&&x.plus.canceled&&Date.now()>PL4.ends()){x.plus.on=0;try{queueSave()}catch(e){}}return _pi()}}
// the Plus page
{const _pp=PAGES.plus;PAGES.plus=function(arg){const x=X(),live=typeof liveOK==='function'&&liveOK();
  if(live&&LIVE.st&&LIVE.st.plus)return '<div class="plhero on"><span class="plbadge">Sprout Plus</span><b>You’re on Plus</b><span>Plus is on through your access code, so there’s no trial and nothing is billed.</span></div><div class="xcard"><p class="xhint" style="margin:0">When paid plans open, you’ll manage your plan here. Plans bought in the App Store are canceled in iPhone Settings › Apple ID › Subscriptions.</p></div>';
  let h=_pp.apply(this,arguments);
  try{// savings are only shown when they come from your own data: unused subscriptions yes, guessed bill savings no
    h=h.replace(/<div class="plrow"><span>\d+ bills? Sprout can lower<\/span><b>[^<]*<\/b><\/div>/,'').replace(/<button class="sbtn[^"]*" data-x="open" data-v="nego">Lower my bills<\/button>/,'');
    if(x.plus&&x.plus.on&&x.plus.canceled){h=h.replace(/<span>Free trial until <b>[^<]*<\/b>\. We’ll remind you 2 days before it ends\.<\/span>/,'<span>Trial canceled. Plus stays on until <b>'+PL4.endTxt()+'</b>, then you’re on the free plan. Nothing is charged.</span>')
      .replace(/<button class="btn alt" data-x="pstop">Cancel free trial<\/button><p class="plfine">[^<]*<\/p>/,'<button class="btn" data-x="pl4resume">Resume trial</button>')}}catch(e){}
  return h}}
// cancel: a calm confirmation, then it really changes
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=pstop],[data-x=pl4resume],[data-x=pl4keep],[data-x=pl4yes]');if(!b)return;const live=typeof liveOK==='function'&&liveOK();if(live&&b.dataset.x==='pstop')return;e.preventDefault();e.stopImmediatePropagation();const x=X(),a=b.dataset.x;
  if(a==='pstop'){if(document.querySelector('.pl4conf'))return;b.insertAdjacentHTML('afterend','<div class="xcard pl4conf"><b>Cancel your free trial?</b><p class="xhint" style="margin:4px 0 8px">You keep Plus until '+PL4.endTxt()+', then you’re on the free plan. Nothing is charged.</p><div class="svbtns"><button type="button" class="sbtn alt" data-x="pl4keep">Keep Plus</button><button type="button" class="sbtn" data-x="pl4yes">Cancel trial</button></div></div>');return}
  if(a==='pl4keep'){const c=document.querySelector('.pl4conf');if(c)c.remove();return}
  if(a==='pl4yes'){x.plus=Object.assign({},x.plus,{canceled:Date.now()});try{const n=NT.g();n.rem=(n.rem||[]).filter(r=>!/trial/i.test(r.t||''))}catch(_){}sv();queueSave();xRender();D4.undo('Trial canceled. Plus stays on until '+PL4.endTxt(),()=>{const p=Object.assign({},X().plus);delete p.canceled;X().plus=p;sv();queueSave();xRender()});return}
  if(a==='pl4resume'){const p=Object.assign({},x.plus);delete p.canceled;x.plus=p;sv();queueSave();xRender();toast('Trial resumed. It ends '+PL4.endTxt()+'.')}},true);
// the Home card about Plus doesn't promise savings it can't show
{const _pc=typeof plusCard==='function'?plusCard:null;if(_pc)plusCard=function(){return ''}}
// "Lower my bills" is a request our team handles: say so plainly
TITLES.nego='Ask us to help lower a bill';
{const _ng=PAGES.nego;if(_ng)PAGES.nego=function(){let h=_ng.apply(this,arguments);try{h=h.replace(/We negotiate for you/g,'You ask, our team calls your provider for you. Results vary and aren’t guaranteed.')}catch(e){}return h}}
try{if(window.__S)window.__S.PL4=PL4}catch(e){}
}
// Plus value counts only what comes from your own data (unused subscriptions), not guessed bill savings
{const _pv=plusValue;plusValue=function(){const v=_pv.apply(this,arguments);try{if(v&&v.nego){v.total=Math.max(0,(v.total||0)-v.nego);v.nego=0;v.nn=0}}catch(e){}return v}}
