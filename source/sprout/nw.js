// ----- net worth v2: history, drivers, own vs owe, milestones -----
netWorth=function(){const C=Math.max(0,+state.cash||0),S=Math.max(0,+state.saved||0),A=C+S,L=totalDebt();return{C,S,A,L,N:A-L}};
let NWR=12,NWH=null,NWN=0;
const kfmt=v=>{const a=Math.abs(v),s=v<0?'−':'';return a>=1e6?s+'$'+(a/1e6).toFixed(a>=1e7?0:1)+'M':a>=1e4?s+'$'+Math.round(a/1e3)+'k':a>=1e3?s+'$'+(a/1e3).toFixed(1).replace('.0','')+'k':s+'$'+Math.round(a)};
const sgn=v=>(v>=0?'+':'−')+money0(Math.abs(v));
function nwSeries(){const n=netWorth(),now=new Date(realDay()),N=25,base=Math.max(+state.startDebt||0,n.L),paid=base-n.L,out=[];
  for(let i=0;i<N;i++){const ago=N-1-i,d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-ago,1)),m=d.getUTCMonth();
    const f=Math.min(1,ago/20),debt=Math.max(0,paid>0?n.L+paid*(1-Math.pow(1-f,1.35)):n.L*(1+.012*ago))+(m===11||m===0?Math.min(900,base*.04)*(ago>0?1:0):0);
    const cash=ago?Math.max(150,n.C*(1-.028*ago)+Math.sin(i*1.7)*Math.max(120,n.C*.045)):n.C,sav=ago?Math.max(0,n.S*(1-ago/15)):n.S;
    out.push({d,m:d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short'}),y:d.getUTCFullYear(),cash:Math.round(cash),sav:Math.round(sav),debt:Math.round(debt)})}
  out.forEach(o=>{o.a=o.cash+o.sav;o.v=o.a-o.debt});return out}
function nwPace(S){const k=Math.min(6,S.length-1);return k>0?(S[S.length-1].v-S[S.length-1-k].v)/k:0}
function nwProj(S,k){const last=S[S.length-1],p=nwPace(S),out=[];for(let j=1;j<=k;j++){const d=new Date(Date.UTC(last.d.getUTCFullYear(),last.d.getUTCMonth()+j,1));out.push({d,m:d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short'}),y:d.getUTCFullYear(),v:Math.round(last.v+p*j),proj:true})}return out}
const NWMS=[0,1000,5000,10000,25000,50000,100000,250000,500000,1000000];
function nwCard(){const n=netWorth(),S=nwSeries(),y=S[S.length-1].v-S[S.length-13].v,pts=S.slice(-12).map(s=>s.v),mn=Math.min(...pts),mx=Math.max(...pts),rg=Math.max(1,mx-mn),u='nwc'+(NWN++);
  const P=pts.map((v,i)=>[i*100/11,30-(v-mn)/rg*26]),own=n.A/Math.max(1,n.A+n.L)*100;
  return '<button class="nwcard" data-x="open" data-v="networth"><div class="nwc1"><div><span class="k">Net worth</span><b class="'+(n.N<0?'dn':'')+'">'+money0(n.N)+'</b><em class="nwpill '+(y>=0?'up':'dn')+'">'+(y>=0?'▲ ':'▼ ')+money0(Math.abs(y))+' this year</em></div>'+
   '<svg viewBox="0 -2 100 36" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".3"/><stop offset="1" style="stop-color:var(--accent)" stop-opacity="0"/></linearGradient></defs><path d="'+smoothPath(P)+' L100 34 L0 34Z" fill="url(#'+u+')"/><path d="'+smoothPath(P)+'" fill="none" style="stroke:var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg></div>'+
   '<div class="nwbar" aria-hidden="true"><i style="width:'+own.toFixed(1)+'%"></i></div><div class="nwleg"><span><i class="o"></i>Own '+money0(n.A)+'</span><span><i class="w"></i>Owe '+money0(n.L)+'</span><span class="nwgo">See trend ›</span></div></button>'}
function nwChart(n){const all=nwSeries(),H=all.slice(-(n+1)),proj=nwProj(all,n>=12?6:3),T=H.concat(proj),W=340,Hh=200,pl=8,pr=8,pt=16,pb=26,vals=T.map(h=>h.v).concat([H[0].v]);
  let mn=Math.min(...vals),mx=Math.max(...vals);const pad=Math.max(200,(mx-mn)*.12);mn-=pad;mx+=pad;
  const X=i=>pl+i*(W-pl-pr)/(T.length-1),Y=v=>pt+(mx-v)/(mx-mn)*(Hh-pt-pb);NWH={H,T,X,Y,W};const u='nwg'+(NWN++);
  const P=H.map((h,i)=>[X(i),Y(h.v)]),line=smoothPath(P),bot=Hh-pb,area=line+' L'+X(H.length-1).toFixed(1)+' '+bot+' L'+X(0).toFixed(1)+' '+bot+'Z';
  const PP=[[X(H.length-1),Y(H[H.length-1].v)]].concat(proj.map((h,j)=>[X(H.length+j),Y(h.v)]));
  const z=mn<0&&mx>0?Y(0):null,zc=z===null?(mn>=0?bot:pt):z;
  const step=Math.ceil(T.length/6);let lab='';T.forEach((h,i)=>{if((T.length-1-i)%step===0)lab+='<text x="'+X(i).toFixed(1)+'" y="'+(Hh-8)+'" text-anchor="middle" font-size="10.5" style="fill:var(--muted)"'+(h.proj?' opacity=".6"':'')+'>'+h.m+'</text>'});
  let cross='';for(let i=1;i<H.length;i++)if(H[i-1].v<0&&H[i].v>=0){cross='<g><circle cx="'+X(i).toFixed(1)+'" cy="'+Y(H[i].v).toFixed(1)+'" r="5" style="fill:var(--panel);stroke:var(--accent)" stroke-width="2.4"/><text x="'+X(i).toFixed(1)+'" y="'+(Y(H[i].v)-11).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="800" style="fill:var(--good)">Crossed $0</text></g>';break}
  const last=H[H.length-1],first=H[0],d=last.v-first.v,pace=nwPace(all),pe=proj[proj.length-1];
  return '<div class="xcard nwchart"><div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1">Over time</h3><div class="xseg" style="padding:3px">'+[[6,'6M'],[12,'1Y'],[24,'2Y']].map(r=>'<button data-nwr="'+r[0]+'" class="'+(NWR===r[0]?'on':'')+'" style="min-height:30px;padding:4px 10px;font-size:12.5px">'+r[1]+'</button>').join('')+'</div></div>'+
   '<div class="crhd"><b id="nw-val">'+money0(last.v)+'</b><span id="nw-sub"><em class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ ':'▼ ')+money0(Math.abs(d))+'</em> since '+first.m+' '+first.y+'</span></div>'+
   '<svg class="crsvg" data-nwchart viewBox="0 0 '+W+' '+Hh+'" width="100%" role="img" aria-label="Net worth over the last '+n+' months, from '+money0(first.v)+' to '+money0(last.v)+', with a projection. Drag to see each month."><defs>'+
    '<linearGradient id="'+u+'u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".32"/><stop offset="1" style="stop-color:var(--accent)" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="'+u+'d" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e48a7a" stop-opacity=".35"/><stop offset="1" stop-color="#e48a7a" stop-opacity="0"/></linearGradient>'+
    '<clipPath id="'+u+'a"><rect x="0" y="0" width="'+W+'" height="'+zc.toFixed(1)+'"/></clipPath><clipPath id="'+u+'b"><rect x="0" y="'+zc.toFixed(1)+'" width="'+W+'" height="'+(Hh-zc).toFixed(1)+'"/></clipPath></defs>'+
   (z!==null?'<line x1="0" x2="'+W+'" y1="'+z.toFixed(1)+'" y2="'+z.toFixed(1)+'" style="stroke:var(--muted)" stroke-dasharray="3 4" stroke-width="1" opacity=".55"/><text x="'+(W-6)+'" y="'+(z-5).toFixed(1)+'" text-anchor="end" font-size="10" font-weight="700" style="fill:var(--muted)">$0</text>':'')+
   '<path d="'+line+' L'+X(H.length-1).toFixed(1)+' '+zc.toFixed(1)+' L'+X(0).toFixed(1)+' '+zc.toFixed(1)+'Z" fill="url(#'+u+'u)" clip-path="url(#'+u+'a)"/>'+
   '<path d="'+line+' L'+X(H.length-1).toFixed(1)+' '+zc.toFixed(1)+' L'+X(0).toFixed(1)+' '+zc.toFixed(1)+'Z" fill="url(#'+u+'d)" clip-path="url(#'+u+'b)"/>'+
   '<rect x="'+X(H.length-1).toFixed(1)+'" y="'+pt+'" width="'+(W-pr-X(H.length-1)).toFixed(1)+'" height="'+(bot-pt)+'" style="fill:var(--wash)" opacity=".55" rx="6"/>'+
   '<text x="'+((X(H.length-1)+W-pr)/2).toFixed(1)+'" y="'+(pt+12)+'" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing=".06em" style="fill:var(--muted)">AT THIS PACE</text>'+
   '<path d="'+smoothPath(PP)+'" fill="none" style="stroke:var(--accent)" stroke-width="2.4" stroke-dasharray="4 5" stroke-linecap="round" opacity=".75"/><circle cx="'+PP[PP.length-1][0].toFixed(1)+'" cy="'+PP[PP.length-1][1].toFixed(1)+'" r="4.5" style="fill:var(--panel);stroke:var(--accent)" stroke-width="2" opacity=".85"/>'+
   '<path d="'+line+'" pathLength="1" fill="none" class="crline" style="stroke:var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+cross+lab+
   '<line id="nw-guide" x1="0" x2="0" y1="'+pt+'" y2="'+bot+'" style="stroke:var(--ink)" stroke-width="1" opacity="0"/><circle id="nw-dot" cx="'+X(H.length-1).toFixed(1)+'" cy="'+Y(last.v).toFixed(1)+'" r="6.5" style="fill:var(--accent);stroke:var(--panel)" stroke-width="3"/><circle class="crpulse" cx="'+X(H.length-1).toFixed(1)+'" cy="'+Y(last.v).toFixed(1)+'" r="6.5" style="fill:var(--accent)"/></svg>'+
   '<div class="crstats"><div><b class="'+(pace>=0?'up':'dn')+'">'+(pace>=0?'+':'−')+kfmt(Math.abs(pace)).replace('−','')+'</b><span>Per month</span></div><div><b>'+kfmt(Math.max(...H.map(h=>h.v)))+'</b><span>Highest</span></div><div><b>'+kfmt(pe.v)+'</b><span>By '+pe.m+' ’'+String(pe.y).slice(2)+'</span></div></div>'+
   '<small class="xhint">Drag across the chart to see any month. The dashed line is where you land if the last 6 months repeat.</small></div>'}
function nwScrub(i){if(!NWH)return;const {T,H,X,Y}=NWH;i=Math.max(0,Math.min(T.length-1,i));const h=T[i],f=H[0],g=document.getElementById('nw-guide'),dt=document.getElementById('nw-dot'),v=document.getElementById('nw-val'),sb=document.getElementById('nw-sub');if(!g)return;
  const x=X(i).toFixed(1),y=Y(h.v).toFixed(1),lastI=H.length-1;g.setAttribute('x1',x);g.setAttribute('x2',x);g.setAttribute('opacity',i===lastI?0:.35);dt.setAttribute('cx',x);dt.setAttribute('cy',y);dt.style.opacity=h.proj?.6:1;v.textContent=money0(h.v);
  if(i===lastI){const d=h.v-f.v;sb.innerHTML='<em class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ ':'▼ ')+money0(Math.abs(d))+'</em> since '+f.m+' '+f.y}
  else if(h.proj)sb.innerHTML=h.m+' '+h.y+' · <em class="up">projected</em> at your pace';
  else{const dv=h.v-(i>0?T[i-1].v:h.v);sb.innerHTML=h.m+' '+h.y+' · own '+kfmt(h.a)+' · owe '+kfmt(h.debt)+' · <em class="'+(dv>=0?'up':'dn')+'">'+(dv>=0?'+':'−')+kfmt(Math.abs(dv)).replace('−','')+'</em>'}}
function nwIdx(e,svg){const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*NWH.W;let best=0,bd=1e9;NWH.T.forEach((h,i)=>{const dd=Math.abs(NWH.X(i)-x);if(dd<bd){bd=dd;best=i}});return best}
addEventListener('pointermove',e=>{const svg=e.target.closest&&e.target.closest('[data-nwchart]');if(svg&&NWH)nwScrub(nwIdx(e,svg))},{passive:true});
addEventListener('pointerdown',e=>{const svg=e.target.closest&&e.target.closest('[data-nwchart]');if(svg&&NWH)nwScrub(nwIdx(e,svg))},{passive:true});
document.addEventListener('pointerout',e=>{const svg=e.target.closest&&e.target.closest('[data-nwchart]');if(svg&&!svg.contains(e.relatedTarget)&&NWH)nwScrub(NWH.H.length-1)});
document.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&NWH&&document.getElementById('nw-dot'))setTimeout(()=>nwScrub(NWH.H.length-1),1200)});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nwr]');if(!b)return;NWR=+b.dataset.nwr;const sc=document.querySelector('#sh-x .panel'),y=sc?sc.scrollTop:0;xRender();if(sc)sc.scrollTop=y});
PAGES.networth=()=>{const n=netWorth(),all=nwSeries(),H=all.slice(-(NWR+1)),f=H[0],l=H[H.length-1],dDebt=f.debt-l.debt,dCash=l.cash-f.cash,dSav=l.sav-f.sav,tot=dDebt+dCash+dSav,pace=nwPace(all);
  const drv=[['Paid down debt',dDebt,'#2fae5a'],['Checking',dCash,'#7fcf9c'],['Savings',dSav,'#b5e4c6']].filter(r=>Math.abs(r[1])>=1),mxd=Math.max(1,...drv.map(r=>Math.abs(r[1])));
  const ratio=n.L>0?n.A/n.L:null,next=NWMS.find(m=>m>n.N),prev=NWMS.filter(m=>m<=n.N),mo=next&&pace>0?Math.ceil((next-n.N)/pace):null;
  const reached=prev.slice(-3).map(m=>{const i=all.findIndex(h=>h.v>=m);return[m,i>0?all[i].m+' ’'+String(all[i].y).slice(2):'']});
  const debts=state.debts.filter(d=>+d.bal>0).slice().sort((a,b)=>b.apr-a.apr),parts=[['Checking',n.C,'#2fae5a']].concat(n.S>0?[['Savings',n.S,'#8fd3a7']]:[]),owes=debts.map((d,i)=>[d.name,+d.bal,['#e48a7a','#eda394','#f3bdb1','#f7d3ca'][i%4]]),G=Math.max(1,n.A+n.L);
  const nb=n.N<0;
  return '<div class="nwhero"><span class="k">Net worth</span><b class="'+(nb?'dn':'')+'">'+money0(n.N)+'</b>'+
   '<div class="nwhl"><em class="nwpill '+(l.v-f.v>=0?'up':'dn')+'">'+(l.v-f.v>=0?'▲ ':'▼ ')+money0(Math.abs(l.v-f.v))+' in '+(NWR===12?'1 year':NWR===24?'2 years':'6 months')+'</em>'+(next?'<span>'+money0(next-n.N)+' to '+kfmt(next)+(mo?' · about '+mo+' mo':'')+'</span>':'')+'</div>'+
   (next?'<div class="nwgoal"><i style="width:'+Math.max(4,Math.min(100,(n.N-(prev[prev.length-1]||0))/Math.max(1,next-(prev[prev.length-1]||0))*100)).toFixed(0)+'%"></i></div>':'')+'</div>'+
   nwChart(NWR)+
   '<div class="xcard"><h3>What moved it</h3><small class="xhint" style="margin-top:-6px">Since '+f.m+' '+f.y+' · '+sgn(tot)+' total</small>'+
    drv.map(r=>'<div class="nwdrv"><span>'+r[0]+'</span><div class="nwdb"><i class="'+(r[1]<0?'neg':'')+'" style="width:'+Math.max(3,Math.abs(r[1])/mxd*100).toFixed(0)+'%;'+(r[1]<0?'':'background:'+r[2])+'"></i></div><b class="'+(r[1]>=0?'up':'dn')+'">'+sgn(r[1])+'</b></div>').join('')+
    (dDebt>0&&tot>0?'<p class="nwtip">'+Math.round(dDebt/Math.max(1,tot)*100)+'% of your growth came from paying down debt. Every dollar of debt you clear counts the same as a dollar saved.</p>':'')+'</div>'+
   '<div class="xcard"><h3>Own vs owe</h3>'+
    '<div class="nwstack" role="img" aria-label="You own '+money0(n.A)+' and owe '+money0(n.L)+'">'+parts.concat(owes).map(p=>'<i style="flex:'+Math.max(.6,p[1]/G*100).toFixed(2)+';background:'+p[2]+'" title="'+esc(p[0])+'"></i>').join('')+'</div>'+
    '<div class="nwsplit"><div><span>You own</span><b>'+money0(n.A)+'</b></div><div style="text-align:right"><span>You owe</span><b>'+money0(n.L)+'</b></div></div>'+
    (ratio!==null?'<p class="nwtip">You own <b>'+money(ratio).replace('.00','')+'</b> for every $1 you owe.'+(ratio>=1?' Debt is '+Math.round(n.L/Math.max(1,n.A)*100)+'% of what you own.':' Paying debt is the fastest way to flip that.')+'</p>':'<p class="nwtip">No debt. Everything you own is yours.</p>')+'</div>'+
   (next?'<div class="xcard"><h3>Milestones</h3><div class="nwms">'+reached.map(r=>'<div class="on"><b>'+kfmt(r[0])+'</b><small>'+(r[1]?'Reached '+r[1]:'Reached')+'</small></div>').join('')+'<div class="nx"><b>'+kfmt(next)+'</b><small>'+(mo?'About '+mo+' mo away':money0(next-n.N)+' to go')+'</small></div></div></div>':'')+
   '<div class="xcard"><h3>What you own</h3>'+parts.map(p=>'<div class="xrow"><span class="xi" style="background:'+p[2]+'33;color:var(--good)">'+(p[0]==='Checking'?'$':'◆')+'</span><div class="xt"><b>'+p[0]+'</b><small>'+(p[0]==='Checking'?(state.link&&state.link.on?'Connected (demo)':'Your latest balance'):'What you’ve put away')+'</small></div><div class="xr">'+money0(p[1])+'</div></div>').join('')+'</div>'+
   (debts.length?'<div class="xcard"><h3>What you owe</h3>'+debts.map((d,i)=>'<div class="xrow"><span class="xi">'+ini(d.name)+'</span><div class="xt"><b>'+esc(d.name)+'</b><small>'+d.apr+'% APR'+(i===0&&debts.length>1?' · <span class="chip">Paying this first</span>':'')+'</small></div><div class="xr dn">−'+money0(d.bal)+'</div></div>').join('')+'</div>':'')+
   demoNote('Past months are an illustration in the demo, built from your current balances. In the full release the history comes from your connected accounts.')};
