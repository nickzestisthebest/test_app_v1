// ---------- per-account storage: every key on this device is filed under the signed-in account ----------
const ACCKEY='sprout-accounts-v1';let ACC=null;
const LSG=(()=>{try{const l=window.localStorage;l.getItem('x');return l}catch(e){return null}})();
const lsGlobal=k=>k===ACCKEY||String(k).indexOf('sprout-i18n-')===0;
const nsk=k=>(lsGlobal(k)||!ACC)?k:k+'::'+ACC;
const localStorage={getItem:k=>{try{return LSG?LSG.getItem(nsk(k)):null}catch(e){return null}},setItem:(k,v)=>{if(LSG)LSG.setItem(nsk(k),v)},removeItem:k=>{try{LSG&&LSG.removeItem(nsk(k))}catch(e){}}};
try{const R=JSON.parse((LSG&&LSG.getItem(ACCKEY))||'null');if(R&&R.cur&&R.list&&R.list[R.cur])ACC=R.cur}catch(e){}
