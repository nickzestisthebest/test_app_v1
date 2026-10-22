// ---------- Face ID (demo of the real iPhone flow) ----------
// In the App Store app this calls iOS Face ID through a native plugin and unlocks a sign-in key kept in the Keychain.
const FIDG='<svg viewBox="0 0 48 48" class="fidg" aria-hidden="true"><path d="M6 16v-5a5 5 0 0 1 5-5h5M32 6h5a5 5 0 0 1 5 5v5M42 32v5a5 5 0 0 1-5 5h-5M16 42h-5a5 5 0 0 1-5-5v-5"/><path class="fface" d="M18 19v3M30 19v3M24.5 19v7.5H22M19 31.5c3.2 2.6 6.8 2.6 10 0"/><path class="fok" d="M15 24.5l6 6L33.5 18"/></svg>';
function fidScan(onOk){if(document.getElementById('fidov'))return;const o=document.createElement('div');o.id='fidov';o.className='fidov';o.setAttribute('role','status');
  o.innerHTML='<div class="fidbox scanning">'+FIDG+'<b>Face ID</b><small>Demo</small></div>';document.body.appendChild(o);
  setTimeout(()=>{const b=o.querySelector('.fidbox');if(b){b.classList.remove('scanning');b.classList.add('ok');b.querySelector('b').textContent='Done'}},1100);
  setTimeout(()=>{o.classList.add('out');setTimeout(()=>o.remove(),250);try{onOk&&onOk()}catch(e){}},1650)}
const fidAcc=()=>{const R=acctReg();return R.fid&&R.list[R.fid]?R.list[R.fid]:null};
function fidSet(on){const R=acctReg();if(on)R.fid=ACC;else if(R.fid===ACC)delete R.fid;acctSaveReg(R);P().faceid=!!on;try{savePrefs()}catch(e){}}
// lock screen: a proper Face ID button that starts on its own, like iPhone apps
{const _sl=showLock;showLock=function(){_sl.apply(this,arguments);const d=document.getElementById('lock');if(!d||!P().faceid)return;
  const old=d.querySelector('[data-pin=face]');if(old)old.remove();d.querySelector('h2').insertAdjacentHTML('beforebegin','<button type="button" class="fidbtn lockfid" data-pin="face">'+FIDG+'<span>Unlock with Face ID</span></button>');
  setTimeout(()=>{if(document.getElementById('lock'))fidScan(unlock)},450)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pin=face]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();fidScan(unlock)},true);
// settings switch remembers which account this phone unlocks
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.x==='pref'&&t.dataset.v==='faceid'){setTimeout(()=>{fidSet(t.checked);if(t.checked)fidScan(()=>toast('Face ID is on. Next time, log in with a glance.'))},30)}});
// a friendly nudge on Home, easy to dismiss
function fidCard(){const a=acctMe();if(!a||P().faceid||a.fidAsked)return '';
  return '<div class="ovcard wide fidcard">'+FIDG+'<div><b>Log in faster with Face ID</b><small>Skip typing your password next time.</small></div><div class="fidcb"><button class="sbtn" data-x="fidon">Turn on</button><button class="plx" data-x="fidno">Not now</button></div></div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=fidon],[data-x=fidno]');if(!b)return;const a=acctMe();if(a){a.fidAsked=Date.now();acctPut(a)}
  if(b.dataset.x==='fidon')fidScan(()=>{fidSet(true);try{plan()}catch(_){}toast('Face ID is on. Next time, log in with a glance.')});else{try{plan()}catch(_){}toast('You can turn it on later in Settings › Security')}});
{const _ovf=overview;overview=function(){const r=_ovf.apply(this,arguments);const o=document.getElementById('ov');if(o&&!o.querySelector('.fidcard')){const h=fidCard();if(h){const t=o.querySelector('.ovcard.wide.row[data-goto="#guide"]')||o.querySelector('.ovhero');if(t)t.insertAdjacentHTML('afterend',h)}}return r}}
