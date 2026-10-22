// ---------- friendlier paycheck / payday views + transactions as a page ----------
const fxBar=(parts)=>{const tot=Math.max(0.01,parts.reduce((a,p)=>a+Math.max(0,p[1]),0));return '<div class="stack fxstack">'+parts.filter(p=>p[1]>0.004).map(p=>'<i class="'+p[2]+'" style="width:'+(p[1]/tot*100).toFixed(1)+'%"></i>').join('')+'</div>'};
const fxRows=(parts)=>parts.filter(p=>p[1]>0.004).map(p=>'<div class="fxrow"><span class="fxdot '+p[2]+'"></span><span class="fxl">'+p[0]+(p[3]?'<small>'+esc(p[3])+'</small>':'')+'</span><b>'+money0(p[1])+'</b></div>').join('');
function fxSplit(r){const must=r.bl+r.affOnly+r.one+r.mins,exn=Object.keys(r.ex||{}).filter(k=>r.ex[k]>0.004);
  return[['Bills',must,'k1'],['Food and fun',r.every,'k2'],['Can-wait payments',r.payAll,'k3'],['Extra toward goals',exn.reduce((a,k)=>a+r.ex[k],0),'k4',exn.map(k=>shortName(k)+' '+money0(r.ex[k])).join(', ')],['Left over',Math.max(0,r.cash),'k5']]}
function fxMeter(lab,spent,allow,daysLeft){const left=allow-spent,p=allow>0?Math.min(100,spent/allow*100):(spent>0?100:0),cls=left<0?'over':p>=80?'near':'';
  return '<div class="fxm '+cls+'"><div class="fxmh"><b>'+lab+'</b><span>'+(left<0?money(-left)+' over':money(left)+' left')+'</span></div><div class="fxbar"><i style="width:'+Math.max(2,p).toFixed(0)+'%"></i></div><small>'+money0(spent)+' of '+money0(allow)+' spent'+(left>0&&daysLeft>0?' · about '+money(left/daysLeft)+' a day for '+daysLeft+' day'+(daysLeft===1?'':'s'):'')+'</small></div>'}
function paycheckView(){const sp=fsp(),A=availAt(realToday(),sp),r=A.r,i=A.info,sE=A.allow.Everyday-i.Everyday.rest,sP=A.allow.Personal-i.Personal.rest;
  const recent=sp.filter(s=>(s.cat==='Everyday'||s.cat==='Personal')&&s.t>=r.d0&&s.t<A.d1).sort((a,b)=>b.t-a.t||(b.at||0)-(a.at||0)),top=recent.slice(0,5);
  const parts=fxSplit(r),start=r.inc>0.004?'+'+money0(r.inc)+' came in '+sdate(r.d0):'Started with '+money0(Math.max(0,r.cashIn))+' in checking';
  return '<div class="fxc"><h3>Your spending money</h3>'+fxMeter('Basics',sE,A.allow.Everyday,A.daysLeft)+fxMeter('Fun',sP,A.allow.Personal,A.daysLeft)+'<p class="fxn">Unspent money rolls into the next days, so a cheap day today means more tomorrow.</p></div>'+
   '<div class="fxc"><h3>Where this paycheck goes</h3><p class="fxsub">'+start+'</p>'+fxBar(parts)+fxRows(parts)+'</div>'+
   '<div class="fxc"><h3>Spent this paycheck</h3>'+(top.length?top.map(s=>'<div class="fxrow"><span class="txic '+(s.cat==='Personal'?'fun':'bas')+'" style="width:30px;height:30px;font-size:13px">'+(s.cat==='Personal'?'★':'●')+'</span><span class="fxl">'+esc(s.note||(s.cat==='Personal'?'Fun':'Basics'))+'<small>'+sdate(s.t)+'</small></span><b>'+money(+s.amt)+'</b></div>').join(''):'<p class="fxn">Nothing logged yet this paycheck.</p>')+
   (recent.length>5?'<button class="lnk" data-fxtx>See all '+recent.length+' in Transactions</button>':'<button class="lnk" data-fxtx>Open Transactions</button>')+'</div>'+
   '<button class="lnk fxmore" data-fxmore="#m-spend,#m-per">Show the detailed breakdown</button>'}
function paydayView(){const {np,low}=lowBeforePay(),T=realDay();if(!np)return '<div class="fxc"><h3>No payday set</h3><p class="fxn">Add your paycheck in Edit numbers and Sprout will plan around it.</p></div>';
  const days=Math.max(0,Math.round((np.d0-T)/MS)),due=rows.items.filter(x=>x.t>=T&&x.t<np.d0&&x.a>0.004).sort((a,b)=>a.t-b.t),dueSum=due.reduce((a,x)=>a+x.a,0),parts=fxSplit(np),later=rows.filter(r=>r.inc>0.004&&r.d0>np.d0).slice(0,3);
  return '<div class="fxhero"><span>'+new Date(np.d0).toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'short',day:'numeric'})+'</span><b>'+(days===0?'Today':days===1?'Tomorrow':'In '+days+' days')+'</b><small>+'+money0(np.inc)+' coming in</small><div class="fxdots">'+Array.from({length:Math.min(14,Math.max(1,days))},(_,k)=>'<i class="'+(k===0?'on':'')+'"></i>').join('')+'</div></div>'+
   '<div class="fxc"><h3>Before payday</h3>'+(due.length?due.slice(0,5).map(x=>'<div class="fxrow"><span class="fxd">'+sdate(x.t)+'</span><span class="fxl">'+esc(shortName(x.name).replace(/ \(every \d+ days\)/,''))+'</span><b>'+money(x.a)+'</b></div>').join('')+(due.length>5?'<p class="fxn">+'+(due.length-5)+' more</p>':''):'<p class="fxn">No bills before payday.</p>')+
   '<div class="fxtot"><span>Due before payday</span><b>'+money0(dueSum)+'</b></div>'+(low?'<div class="fxtot"><span>Lowest checking gets</span><b class="'+(low.v<0?'neg':'')+'">'+money0(low.v)+' <small>'+sdate(low.t)+'</small></b></div>':'')+'</div>'+
   '<div class="fxc"><h3>When it lands</h3><p class="fxsub">Here is how Sprout will split the '+money0(np.inc)+'.</p>'+fxBar(parts)+fxRows(parts)+'</div>'+
   (later.length?'<div class="fxc"><h3>After that</h3>'+later.map(r=>{const must=r.bl+r.affOnly+r.one+r.mins;return '<div class="fxrow"><span class="fxd">'+sdate(r.d0)+'</span><span class="fxl">+'+money0(r.inc)+'<small>'+money0(must)+' to bills</small></span><b class="'+(r.cash<0?'neg':'')+'">'+money0(r.cash)+'<small>left</small></b></div>'}).join('')+'</div>':'')+
   '<button class="lnk fxmore" data-fxmore="#m-per">Show every pay period in detail</button>'}
Object.assign(FOCUS['#m-spend'],{show:['#fx'],ins:null,custom:paycheckView});
Object.assign(FOCUS['#m-per'],{show:['#fx'],ins:null,custom:paydayView});
FOCUS['#txv']={t:'Transactions',show:['#txv'],act:'<button class="lnk fxact" id="tx-add">+ Add</button>'};
document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('[data-fxmore]');if(m){m.dataset.fxmore.split(',').forEach(q=>{const el=document.querySelector(q);if(!el)return;const top=el.closest('details.mod')||el;top.classList.add('focus-on');top.open=true;const mods=el.closest('.mods');if(mods)mods.classList.add('focus-host')});m.remove()}
  if(e.target.closest&&e.target.closest('[data-fxtx]'))openTx()});
// transactions: same page layout as everything else
(function(){const v=document.getElementById('txv'),fb=document.getElementById('fbar');if(!v||!fb)return;const h=v.querySelector('.txh');if(h)h.remove();v.hidden=false;v.classList.remove('on');fb.insertAdjacentElement('afterend',v);
  const fx=document.createElement('section');fx.id='fx';fx.className='fx';v.insertAdjacentElement('afterend',fx)})();
openTx=function(){openFocus('#txv');txOpen=true;txEdit=null;renderTx()};
closeTx=function(){if(!txOpen)return;txOpen=false;const v=document.getElementById('txv');if(VIEW==='focus'&&v&&v.classList.contains('focus-on'))setView('ov')};
