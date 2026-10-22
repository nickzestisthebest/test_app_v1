// ---------- Refer a friend: both people get one free month of Plus ----------
// Rules: code entered at sign-up only, new person only (unique email, phone, name+birthday), never your own code,
// referrer earns up to 12 months per rolling year, each reward applied exactly once (tracked on the account record),
// and free time is a date that simply runs out, so it can never become permanent.
const REFMO=30*864e5,REFCAP=12;
function refCodeFor(id){let h=2166136261;for(const c of String(id))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<6;i++){o+=A[h%32];h=Math.floor(h/32)^(h<<7)>>>0;h=h>>>0}return 'SPRT-'+o}
function refFind(code){const c=String(code||'').trim().toUpperCase().replace(/\s+/g,'');if(!c)return null;const L=acctReg().list;
  return Object.values(L).find(a=>(a.ref||refCodeFor(a.id))===c)||null}
function refGrant(acc,refById){if(!refById)return;const R=acctReg(),ref=R.list[refById];if(!ref||ref.id===acc.id)return;const rid='ref_'+acc.id,now=Date.now();
  if(acc.dupHint){acc.refBy=ref.id;acc.rw=(acc.rw||[]).concat([{id:rid,months:0,pending:true,why:'Referral bonus under review',at:now}]);if(!(ref.rw||[]).some(r=>r.id===rid)){ref.rw=(ref.rw||[]).concat([{id:rid,kind:'ref',months:0,pending:true,why:acc.first+' joined with your code (under review)',at:now}]);acctPut(ref)}return}
  acc.refBy=ref.id;acc.rw=(acc.rw||[]).concat([{id:rid,months:1,why:'Joined with '+ref.first+'’s code',at:now}]);
  const yr=(ref.rw||[]).filter(r=>r.kind==='ref'&&r.months>0&&now-r.at<365*864e5).length;
  if(!(ref.rw||[]).some(r=>r.id===rid)){ref.rw=(ref.rw||[]).concat([{id:rid,kind:'ref',months:yr<REFCAP?1:0,why:acc.first+' joined with your code'+(yr<REFCAP?'':' (yearly limit reached)'),at:now}]);ref.ref=ref.ref||refCodeFor(ref.id);acctPut(ref)}}
function refApply(){const me=acctMe();if(!me)return;let got=0,changed=false;me.ref=me.ref||refCodeFor(me.id);
  (me.rw||[]).forEach(r=>{if(r.applied)return;r.applied=Date.now();changed=true;if(r.months>0){me.plusFree=Math.max(Date.now(),+me.plusFree||0)+r.months*REFMO;got+=r.months}});
  if(changed||!me.ref)acctPut(me);if(got)setTimeout(()=>toast('You got '+(got>1?got+' free months':'a free month')+' of Sprout Plus. Enjoy!'),1600)}
const refFreeUntil=()=>{const me=acctMe();return me&&+me.plusFree>Date.now()?+me.plusFree:0};
const refDate=t=>new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
PAGES.invite=()=>{const me=acctMe()||{},code=me.ref||refCodeFor(me.id||'x'),rw=(me.rw||[]).filter(r=>r.kind==='ref'),yr=rw.filter(r=>r.months>0&&Date.now()-r.at<365*864e5).length,fu=refFreeUntil();
  return '<div class="refhero"><span class="plbadge">Invite friends</span><b>Give a month, get a month</b><span>When a friend signs up with your code, you both get one free month of Sprout Plus.</span>'+
   '<div class="refcode"><code id="ref-code">'+code+'</code><button class="sbtn" data-x="refcopy">Copy</button></div></div>'+
   (fu?'<div class="xcard"><div class="plrow tot"><span>Free Plus until</span><b>'+refDate(fu)+'</b></div></div>':'')+
   '<div class="xcard"><h3>How it works</h3><ol class="cgl"><li><b>Share your code</b><span>Send it to a friend who isn’t on Sprout yet.</span></li><li><b>They enter it when signing up</b><span>It goes in the “Referral code” box on the last sign-up step.</span></li><li><b>You both get a free month</b><span>It’s added right away. Free months stack and simply run out. Nothing renews or charges you.</span></li></ol></div>'+
   '<div class="xcard"><h3>Your referrals</h3>'+(rw.length?rw.slice().reverse().map(r=>'<div class="plrow"><span>'+esc(r.why)+'<br><small>'+refDate(r.at)+'</small></span><b>'+(r.months>0?'+1 month':'Limit reached')+'</b></div>').join(''):'<p class="xhint" style="margin:0">No referrals yet. Your first friend gets you a free month.</p>')+'<p class="xhint" style="margin:6px 0 0">'+yr+' of '+REFCAP+' referral months earned this year.</p></div>'+
   '<p class="plfine">New accounts only, one per person. Codes can’t be added after sign-up. See Terms, section 10.</p>'};
Object.assign(TITLES,{invite:'Invite friends'});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x=refcopy]');if(!b)return;const me=acctMe(),code=me&&(me.ref||refCodeFor(me.id));
  let ok=false;try{await navigator.clipboard.writeText(code);ok=true}catch(_){}
  if(!ok){const c=document.getElementById('ref-code');if(c){const r=document.createRange();r.selectNodeContents(c);const sl=getSelection();sl.removeAllRanges();sl.addRange(r)}}
  toast(ok?'Copied '+code:'Code selected. Copy it to share.')});
// Plus counts free referral time; free time shows on the Plus page and in Settings
{const _pi=plusIs;plusIs=()=>_pi()||refFreeUntil()>0}
{const _pp=PAGES.plus;PAGES.plus=a=>{const fu=refFreeUntil(),x=X();if(fu&&!(x.plus&&x.plus.on))return '<div class="plhero on"><span class="plbadge">Sprout Plus</span><b>You’re on Plus, free</b><span>Your free referral time lasts until <b>'+refDate(fu)+'</b>. Nothing is charged, and it doesn’t renew on its own.</span></div><button class="btn" data-x="open" data-v="invite">Invite friends for more free months</button>'+demoNote('Demo mode. No payment is taken and nothing is billed.');
  return _pp(a)+'<button class="btn alt" data-x="open" data-v="invite" style="margin-top:4px">Invite a friend, both get a free month</button>'}}
{const _psc=plusSetCard;plusSetCard=()=>{const fu=refFreeUntil(),x=X();const top=fu&&!(x.plus&&x.plus.on)?'<button type="button" class="plset on" data-x="open" data-v="plus"><span class="plbadge">Plus</span><span class="plst"><b>Sprout Plus</b><small>Free until '+refDate(fu)+'</small></span><span class="schev">›</span></button>':_psc();
  return top+'<button type="button" class="plset refset" data-x="open" data-v="invite"><span class="refgift">'+ic('users')+'</span><span class="plst"><b>Invite friends</b><small>You both get a free month of Plus</small></span><span class="schev">›</span></button>'}}
