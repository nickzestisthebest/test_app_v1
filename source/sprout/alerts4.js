// ===================== Alerts 4: counts come from the live list, every alert can be dismissed, and it stays dismissed =====================
const AL4={};
{
// the request alert is the owner's view of everyone's requests: count from the server, re-checked after any change,
// dismissible (stays gone until the number of open requests changes)
alerts=(function(_al){return function(){let A=_al.apply(this,arguments);const x=X();A=A.filter(a=>!/^cqopen-/.test(a.id));
  const n=LIVE.st&&LIVE.st.ai&&+LIVE.st.cancelOpen>0?+LIVE.st.cancelOpen:0;if(n){const id='cqopen-'+n;if(!x.dis[id])A.unshift({id,t:n+' member request'+(n>1?'s':'')+' to handle',s:'Requests from Sprout members to cancel or lower a bill. Only you see this.',go:['cq']})}
  // your own requests: one line about where each stands
  try{Object.keys(x.subs||{}).forEach(k=>{const r=(x.subs[k]||{}).req;if(!r||!/needs_you|done|failed/.test(r.status||''))return;const id='cqme-'+k+'-'+r.status;if(x.dis[id])return;const s=(typeof subsList==='function'?subsList():[]).find(z=>z.id===k);A.push({id,t:'Your request to cancel '+(s?s.name:'a subscription')+(r.status==='done'?': done':r.status==='needs_you'?': needs you':': couldn’t finish'),s:r.status==='needs_you'?'Open it to see what’s needed.':'Tap to see the details.',go:['cancel',k]})})}catch(e){}
  return A}})(alerts);
// after a request changes, check the server again so the count is current
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=cxwithdraw],[data-x=cxdone2],[data-x=cxselfv]');if(!b)return;setTimeout(async()=>{try{await LIVE.check();if(typeof tbSync==='function')tbSync();if(typeof afterChange==='function')afterChange()}catch(err){}},900)},false);
setInterval(()=>{try{if(LIVE.on&&document.visibilityState==='visible')LIVE.check().then(()=>{try{tbSync()}catch(e){}})}catch(e){}},5*60e3);
try{if(window.__S)window.__S.AL4=AL4}catch(e){}
}
