// ---------- Savings: Sprout tracks your savings, your money stays at your own bank ----------
// No money moves through Sprout. People record where their savings live, set goals and get reminders.
function SV(){const x=X(),v=x.vault=x.vault||{bal:0,log:[],al:{}};v.log=v.log||[];v.al=v.al||{};v.rem=v.rem||{};
  if(!Array.isArray(v.accts)){v.accts=+v.bal>0?[{id:'s1',name:'My savings',bal:+v.bal,apy:0,at:Date.now()}]:[]}
  v.bal=v.accts.reduce((a,c)=>a+(+c.bal||0),0);return v}
let SVED=null;
const svDate=t=>new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});
PAGES.vault=()=>{const v=SV(),goals=(state.goals||[]).filter(g=>+g.amt>0),asg=goals.reduce((a,g)=>a+(+v.al[g.name]||0),0),free=Math.max(0,v.bal-asg);
  const moInt=v.accts.reduce((a,c)=>a+(+c.bal||0)*(+c.apy||0)/100/12,0),lowRate=v.accts.some(c=>+c.bal>0&&(+c.apy||0)<1);
  const acct=c=>SVED===c.id?
    '<div class="svacc ed"><label class="f">Account name<input id="sv-n" maxlength="40" value="'+esc(c.name)+'" placeholder="e.g. Ally Savings"></label><div class="svrow2"><label class="f">Balance<input id="sv-b" type="number" inputmode="decimal" step="0.01" value="'+(+c.bal||0)+'"></label><label class="f">Interest rate (APY %)<input id="sv-r" type="number" inputmode="decimal" step="0.01" value="'+(+c.apy||'')+'" placeholder="Optional"></label></div><div class="svbtns"><button class="sbtn" data-x="svsave" data-v="'+c.id+'">Save</button><button class="sbtn alt" data-x="svcancel">Cancel</button>'+(c.id!=='new'?'<button class="sbtn bad" data-x="svdel" data-v="'+c.id+'">Remove</button>':'')+'</div></div>'
   :'<button type="button" class="svacc" data-x="svedit" data-v="'+c.id+'"><span class="svic">'+ic('vault')+'</span><span class="svt"><b>'+esc(c.name)+'</b><small>'+(+c.apy>0?(+c.apy).toFixed(2)+'% APY · ':'')+'Updated '+svDate(c.at||Date.now())+'</small></span><span class="sva">'+money(+c.bal||0)+'</span></button>';
  return '<div class="svhero"><span class="k">Your savings</span><b>'+money(v.bal)+'</b><span class="d">Sprout keeps track. Your money stays at your bank.</span>'+(moInt>=0.01?'<span class="svint">About '+money(moInt)+' a month in interest at your bank’s rate (estimate)</span>':'')+'</div>'+
   '<div class="xcard"><div class="svh"><h3>Where your savings are</h3><button class="lnk" data-x="svedit" data-v="new">+ Add account</button></div>'+
     (v.accts.length||SVED==='new'?v.accts.map(acct).join('')+(SVED==='new'?acct({id:'new',name:'',bal:0,apy:''}):''):'<p class="xhint">Add the savings account you already use, like a high-yield account at your bank. Sprout only tracks the balance.</p>')+'</div>'+
   (v.accts.length?'<div class="xcard"><h3>Record a change</h3><p class="xhint" style="margin:0 0 8px">Moved money at your bank? Note it here so your goals stay right.</p><div class="svrec"><select id="sv-acc" aria-label="Account">'+v.accts.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('')+'</select><input id="sv-amt" type="number" inputmode="decimal" step="0.01" placeholder="$0.00" aria-label="Amount"></div><div class="svbtns"><button class="sbtn" data-x="svrec" data-v="in">I added money</button><button class="sbtn alt" data-x="svrec" data-v="out">I took money out</button></div></div>':'')+
   (goals.length?'<div class="xcard"><div class="svh"><h3>Goals</h3><small class="xhint">'+money0(free)+' not assigned</small></div>'+goals.map(g=>{const al=+v.al[g.name]||0,t=+g.amt;return '<div class="svgoal"><div class="svgh"><b>'+esc(g.name)+'</b><span>'+money0(al)+' of '+money0(t)+'</span></div><div class="xbar"><i style="width:'+Math.min(100,Math.round(al/t*100))+'%"></i></div><div class="svgb"><button class="sbtn alt" data-x="svalloc" data-v="'+esc(g.name)+'" data-w="-25"'+(al<=0?' disabled':'')+'>−$25</button><button class="sbtn" data-x="svalloc" data-v="'+esc(g.name)+'" data-w="25"'+(free<1?' disabled':'')+'>+$25</button></div></div>'}).join('')+'<p class="xhint" style="margin:6px 0 0">Assigning only labels your savings for a goal. Nothing moves.</p></div>':'')+
   '<div class="xcard"><h3>Reminders</h3>'+[['pay','Remind me to save on payday','A nudge the day your paycheck lands'],['week','Weekly savings check','Every Sunday, see what you could set aside']].map(r=>'<label class="xtog"><span>'+r[1]+'<small>'+r[2]+'</small></span><input type="checkbox" class="sw" data-x="svrem" data-v="'+r[0]+'"'+(v.rem[r[0]]?' checked':'')+'></label>').join('')+'<p class="xhint" style="margin:6px 0 0">You move the money yourself at your bank. Sprout never moves money.</p></div>'+
   '<div class="xcard svhy"><h3>Earn more on what you save</h3><p style="margin:0">'+(lowRate?'One of your accounts earns under 1%. ':'')+'Online high-yield savings accounts often pay much more than big-bank savings. Compare FDIC-insured options and check the current rate before you open one.</p><p class="pldisc">Rates change. This isn’t a recommendation. In the future, Sprout may earn a referral fee from partners, and we’ll always say so.</p></div>'+
   (v.log.length?'<div class="xcard"><h3>Activity</h3>'+v.log.slice(0,8).map(l=>'<div class="xrow"><div class="xt"><b>'+esc(l.t)+'</b><small>'+esc(l.d)+'</small></div><div class="xr '+(l.a>=0?'up':'')+'">'+(l.a>=0?'+':'−')+money(Math.abs(l.a))+'</div></div>').join('')+'</div>':'')};
Object.assign(TITLES,{vault:'Savings'});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x,id=b.dataset.v;if(!/^sv/.test(a))return;const v=SV();
  switch(a){
   case 'svedit':SVED=id;xRender();setTimeout(()=>{const i=document.getElementById('sv-n');if(i&&id==='new')i.focus()},60);break;
   case 'svcancel':SVED=null;xRender();break;
   case 'svsave':{const n=(($('#sv-n')||{}).value||'').trim().slice(0,40),bal=Math.max(0,parseFloat(($('#sv-b')||{}).value)||0),apy=Math.max(0,Math.min(25,parseFloat(($('#sv-r')||{}).value)||0));
     if(!n){toast('Give the account a name');break}
     if(id==='new'){v.accts.push({id:'s'+Date.now().toString(36),name:n,bal,apy,at:Date.now()});v.log.unshift({t:'Added '+n,d:fdate(realDay()),a:bal})}
     else{const c=v.accts.find(z=>z.id===id);if(c){const d=bal-(+c.bal||0);Object.assign(c,{name:n,bal,apy,at:Date.now()});if(Math.abs(d)>=0.01)v.log.unshift({t:'Updated '+n,d:fdate(realDay()),a:d})}}
     SVED=null;SV();sv();xRender();try{plan()}catch(_){}toast('Saved');break}
   case 'svdel':{const i=v.accts.findIndex(z=>z.id===id);if(i>=0){if(b.dataset.arm){v.accts.splice(i,1);SVED=null;SV();sv();xRender();try{plan()}catch(_){}toast('Account removed from Sprout')}else{b.dataset.arm='1';b.textContent='Tap again to remove'}}break}
   case 'svrec':{const c=v.accts.find(z=>z.id===($('#sv-acc')||{}).value),amt=Math.abs(parseFloat(($('#sv-amt')||{}).value)||0);if(!c||!amt){toast('Enter an amount');break}
     const d=id==='in'?amt:-Math.min(amt,+c.bal||0);c.bal=(+c.bal||0)+d;c.at=Date.now();v.log.unshift({t:(d>=0?'Added to ':'Took out of ')+c.name,d:fdate(realDay()),a:d});SV();
     const asg=Object.values(v.al).reduce((s,x)=>s+(+x||0),0);if(asg>v.bal){let over=asg-v.bal;Object.keys(v.al).forEach(k=>{const cut=Math.min(over,+v.al[k]||0);v.al[k]-=cut;over-=cut})}
     sv();xRender();try{plan()}catch(_){}toast(d>=0?'Nice. Noted '+money(amt)+' saved.':'Noted.');break}
   case 'svalloc':{const w=+b.dataset.w,cur=+v.al[id]||0,asg=Object.values(v.al).reduce((s,x)=>s+(+x||0),0),free=Math.max(0,v.bal-asg);
     v.al[id]=w>0?cur+Math.min(w,free):Math.max(0,cur+w);sv();xRender();break}
  }});
document.addEventListener('change',e=>{const t=e.target;if(!t||t.dataset.x!=='svrem')return;const v=SV();v.rem[t.dataset.v]=t.checked;sv();toast(t.checked?'Reminder on':'Reminder off')});
