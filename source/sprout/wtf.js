// ---------- sanity check for absurd purchases ----------
let WTF_SEEN=null;
const wtfKey=s=>[s.at||'',s.d,s.amt,s.note||'',s.cat].join('|');
function wtfCheck(){const sp=state.spend||[];if(!WTF_SEEN){WTF_SEEN=new Set(sp.map(wtfKey));return}
  const fresh=sp.filter(s=>!WTF_SEEN.has(wtfKey(s)));fresh.forEach(s=>WTF_SEEN.add(wtfKey(s)));
  const big=fresh.filter(s=>s.cat!=='Income'&&+s.amt>100000).sort((a,b)=>b.amt-a.amt)[0];if(!big)return;
  setTimeout(()=>{toastAct('What the fuck are you doing? '+money(+big.amt)+'?','Undo',()=>{state.spend=state.spend.filter(x=>x!==big);plan();queueSave();if(typeof txOpen!=='undefined'&&txOpen)renderTx();toast('Undone. Phew.')});const t=document.getElementById('toast');if(t){t.classList.remove('wtf');void t.offsetWidth;t.classList.add('wtf')}try{navigator.vibrate&&navigator.vibrate([40,60,40])}catch(_){}},150)}
