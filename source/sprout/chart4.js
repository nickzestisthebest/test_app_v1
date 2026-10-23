// ===================== Charts 4: one readable chart pattern for every screen =====================
// Labeled dollar gridlines ($0 marked), month ticks with the year at January and the ends, a Today line with the
// past and the road ahead shaded differently, flags for milestones, a band for lighter and heavier months,
// value labels you can read without touching, and a scrub that shows exact numbers for any point.
const C4={};
{
const r2=x=>Math.round((+x||0)*100)/100;
let N=0;C4.REG={};
C4.mon=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short'});
C4.yr2=t=>'’'+String(new Date(t).getUTCFullYear()).slice(2);
C4.kfmt=v=>{const a=Math.abs(v);if(a>=1e6)return (v<0?'−':'')+'$'+(a/1e6).toFixed(1).replace(/\.0$/,'')+'M';if(a>=10000)return (v<0?'−':'')+'$'+Math.round(a/1000)+'k';if(a>=1000)return (v<0?'−':'')+'$'+(a/1000).toFixed(1).replace(/\.0$/,'')+'k';return (v<0?'−':'')+'$'+Math.round(a)};
// nice tick values: 3 to 5 gridlines, always including $0 when the range crosses it
C4.ticks=(lo,hi)=>{if(!(hi>lo))hi=lo+1;const span=hi-lo,raw=span/4,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p,step=(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p,out=[];for(let v=Math.ceil(lo/step)*step;v<=hi+1e-9;v+=step)out.push(r2(v));if(lo<0&&hi>0&&!out.some(v=>Math.abs(v)<1e-9))out.push(0);return out.sort((a,b)=>a-b)};
// month ticks across a span: every 1, 2, 3, 6 or 12 months so there are at most 7 labels
C4.mticks=(t0,t1)=>{const a=new Date(t0),months=(new Date(t1).getUTCFullYear()-a.getUTCFullYear())*12+new Date(t1).getUTCMonth()-a.getUTCMonth(),step=months<=7?1:months<=14?2:months<=21?3:months<=42?6:12,out=[];
  let y=a.getUTCFullYear(),m=a.getUTCMonth()+(a.getUTCDate()>1?1:0);for(let i=0;i<200;i++){const t=Date.UTC(y,m,1);if(t>t1)break;if(t>=t0&&((m%step)===0||step===1))out.push(t);m++;if(m>11){m=0;y++}}return out};
// ---------- time chart: lines, an area, a band, flags, a today line ----------
// o: {series:[{pts:[{t,v}],color,dash,area,width,name}], band:{lo:[{t,v}],hi:[{t,v}]}, today, zero, h, fmt, flags:[{t,v,text}], vals:[{t,v,text}], tip:(t)=>html, cush, cat:'x labels off'}
C4.time=o=>{o=o||{};const S=(o.series||[]).filter(s=>s&&s.pts&&s.pts.length);if(!S.length)return '<p class="xhint">Not enough to chart yet.</p>';
  const id='c4'+(++N),W=360,H=o.h||190,pl=44,pr=10,pt=14,pb=22;
  const all=[];S.forEach(s=>s.pts.forEach(p=>all.push(p)));if(o.band){o.band.lo.forEach(p=>all.push(p));o.band.hi.forEach(p=>all.push(p))}
  const ts=all.map(p=>p.t),vs=all.map(p=>p.v),t0=o.t0!=null?o.t0:Math.min(...ts),t1=o.t1!=null?o.t1:Math.max(...ts);
  let lo=Math.min(...vs,o.zero?0:Infinity,o.cush!=null?o.cush:Infinity),hi=Math.max(...vs,o.zero?0:-Infinity,o.cush!=null?o.cush:-Infinity);if(hi-lo<1){hi=lo+Math.max(1,Math.abs(lo)*.2)}const pad=(hi-lo)*.08;lo-=pad;hi+=pad;
  const X=t=>pl+(t-t0)/Math.max(1,t1-t0)*(W-pl-pr),Y=v=>pt+(hi-v)/Math.max(1e-9,hi-lo)*(H-pt-pb),y0=H-pb;
  let s='<svg viewBox="0 0 '+W+' '+H+'" class="c4svg" aria-hidden="true">';
  // past and ahead shading
  if(o.today!=null&&o.today>t0&&o.today<t1){s+='<rect x="'+X(o.today).toFixed(1)+'" y="'+pt+'" width="'+(X(t1)-X(o.today)).toFixed(1)+'" height="'+(y0-pt)+'" class="c4ahead"/>'}
  // gridlines with dollar labels
  C4.ticks(lo+pad,hi-pad).forEach(v=>{const y=Y(v).toFixed(1);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" class="c4g'+(Math.abs(v)<1e-9?' z':'')+'"/><text x="'+(pl-6)+'" y="'+y+'" class="c4yl'+(Math.abs(v)<1e-9?' z':'')+'" text-anchor="end" dominant-baseline="middle">'+C4.kfmt(v)+'</text>'});
  if(o.cush!=null&&o.cush>lo&&o.cush<hi){const y=Y(o.cush).toFixed(1);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" class="c4cush"/><text x="'+(W-pr)+'" y="'+(+y-4)+'" class="c4cl" text-anchor="end">cushion</text>'}
  // band
  if(o.band&&o.band.lo.length>1){const up=o.band.hi.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+','+Y(p.v).toFixed(1)).join(''),dn=o.band.lo.slice().reverse().map(p=>'L'+X(p.t).toFixed(1)+','+Y(p.v).toFixed(1)).join('');s+='<path d="'+up+dn+'Z" class="c4band" style="fill:'+(o.band.color||'var(--mxc-line)')+'"/>'}
  // series
  S.forEach((sr,k)=>{const P=sr.pts,col=sr.color||'var(--mxc-line)',d=P.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+','+Y(p.v).toFixed(1)).join('');
    if(sr.area)s+='<defs><linearGradient id="g'+id+k+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".2"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs><path d="'+d+'L'+X(P[P.length-1].t).toFixed(1)+','+y0+'L'+X(P[0].t).toFixed(1)+','+y0+'Z" fill="url(#g'+id+k+')" stroke="none"/>';
    s+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+(sr.width||2.4)+'" '+(sr.dash?'stroke-dasharray="5 5" ':'')+'stroke-linejoin="round" stroke-linecap="round" class="c4line" pathLength="1"/>'});
  // today line
  if(o.today!=null&&o.today>=t0&&o.today<=t1){const x=X(o.today).toFixed(1);s+='<line x1="'+x+'" x2="'+x+'" y1="'+pt+'" y2="'+y0+'" class="c4today"/>'}
  // flags: a small marker with a label
  // flags: numbered markers on the line, named in a key under the chart (so labels never pile up)
  const FL=(o.flags||[]).filter(f=>f.t>=t0&&f.t<=t1);FL.forEach((f,i)=>{const x=X(f.t),y=f.v!=null?Y(f.v):pt+10;s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7" class="c4flag"/><text x="'+x.toFixed(1)+'" y="'+(y+0.5).toFixed(1)+'" class="c4fn" text-anchor="middle" dominant-baseline="middle">'+(i+1)+'</text>'});
  // value labels (start, today, end)
  (o.vals||[]).forEach(v=>{if(v.t<t0||v.t>t1)return;const x=X(v.t),y=Y(v.v);s+='<text x="'+x.toFixed(1)+'" y="'+(y-7).toFixed(1)+'" class="c4vl" text-anchor="'+(x>W-60?'end':x<pl+30?'start':'middle')+'">'+esc(v.text||(o.fmt||money0)(v.v))+'</text>'});
  // month ticks
  const mt=C4.mticks(t0,t1);let lastY=null;mt.forEach(t=>{const x=X(t).toFixed(1),y=new Date(t).getUTCFullYear(),jan=new Date(t).getUTCMonth()===0,lab=C4.mon(t)+((jan||lastY===null)?' '+C4.yr2(t):'');lastY=y;
    if(o.today!=null&&Math.abs(X(t)-X(o.today))<30)return;s+='<text x="'+x+'" y="'+(H-6)+'" class="c4xl" text-anchor="middle">'+lab+'</text>'});
  if(o.today!=null&&o.today>=t0&&o.today<=t1)s+='<text x="'+X(o.today).toFixed(1)+'" y="'+(H-6)+'" class="c4xl td" text-anchor="middle">Today</text>';
  s+='</svg>';
  C4.REG[id]={o,S,X,Y,W,H,t0,t1,pl,pr};
  return '<div class="c4" data-c4="'+id+'" style="--h:'+H+'px">'+s+'<i class="c4v"></i><i class="c4d"></i><div class="c4tip"></div></div>'+(FL.length?'<div class="c4fk">'+FL.map((f,i)=>'<span><i>'+(i+1)+'</i>'+esc(f.text||'')+' · '+C4.mon(f.t)+' '+C4.yr2(f.t)+'</span>').join('')+'</div>':'')};
// ---------- bars by month (or any category), optionally stacked, tap to select ----------
// o: {cats:[{k,lab,sub}], stack:[{name,color,vals:[...]}], sel:k, h, fmt, total:bool, onsel:'data-attr name'}
C4.bars=o=>{o=o||{};const C=o.cats||[],St=o.stack||[];if(!C.length||!St.length)return '<p class="xhint">Nothing to chart yet.</p>';
  const id='c4'+(++N),W=360,H=o.h||200,pl=40,pr=8,pt=22,pb=24,n=C.length,gap=Math.max(4,Math.min(12,(W-pl-pr)/n*.3)),bw=(W-pl-pr)/n-gap;
  const tot=C.map((c,i)=>St.reduce((a,s)=>a+(+s.vals[i]||0),0)),hi0=Math.max(1,...tot,o.ref||0),hi=hi0*1.12,Y=v=>pt+(1-v/hi)*(H-pt-pb),y0=H-pb;
  let s='<svg viewBox="0 0 '+W+' '+H+'" class="c4svg" aria-hidden="true">';
  C4.ticks(0,hi0).forEach(v=>{if(v<=0)return;const y=Y(v).toFixed(1);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" class="c4g"/><text x="'+(pl-6)+'" y="'+y+'" class="c4yl" text-anchor="end" dominant-baseline="middle">'+C4.kfmt(v)+'</text>'});
  s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y0+'" y2="'+y0+'" class="c4g z"/>';
  if(o.ref>0){const y=Y(o.ref).toFixed(1);s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" class="c4ref"/><text x="'+(W-pr)+'" y="'+(+y-4)+'" class="c4cl" text-anchor="end">'+esc(o.refLab||'average')+'</text>'}
  C.forEach((c,i)=>{const x=pl+i*((W-pl-pr)/n)+gap/2,sel=o.sel!=null&&String(o.sel)===String(c.k),dim=o.sel!=null&&!sel;let acc=0;
    s+='<g class="c4bar'+(sel?' sel':'')+(dim?' dim':'')+'" data-c4k="'+esc(c.k)+'">';
    St.forEach(st=>{const v=+st.vals[i]||0;if(v<=0)return;const y1=Y(acc+v),y2=Y(acc);s+='<rect x="'+x.toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1.5,y2-y1).toFixed(1)+'" rx="4" fill="'+st.color+'" class="c4rect"/>';acc+=v});
    if(o.total!==false)s+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(Y(acc)-5).toFixed(1)+'" class="c4vl'+(sel?' sel':'')+'" text-anchor="middle">'+(o.fmt||C4.kfmt)(acc)+'</text>';
    s+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-7)+'" class="c4xl'+(sel?' sel':'')+'" text-anchor="middle">'+esc(c.lab)+'</text><rect x="'+(x-gap/2).toFixed(1)+'" y="'+pt+'" width="'+(bw+gap).toFixed(1)+'" height="'+(H-pt)+'" fill="transparent"/></g>'});
  s+='</svg>';
  return '<div class="c4 c4b" data-c4b="'+id+'" data-c4sel="'+esc(o.onsel||'')+'">'+s+(St.length>1&&o.legend!==false?'<div class="c4leg">'+St.map(st=>'<span><i style="background:'+st.color+'"></i>'+esc(st.name)+'</span>').join('')+'</div>':'')+'</div>'};
// ---------- scrub on time charts: exact numbers for the nearest point ----------
C4.nearest=(c,fx)=>{const t=c.t0+fx*(c.t1-c.t0);let best=null,bd=Infinity;c.S.forEach((sr,k)=>sr.pts.forEach((p,i)=>{const d=Math.abs(p.t-t);if(d<bd){bd=d;best={p,k,i}}}));return best};
const move=(el,cx)=>{const c=C4.REG[el.dataset.c4];if(!c)return;const rc=el.getBoundingClientRect(),fx=Math.max(0,Math.min(1,(cx-rc.left)/rc.width)),ptx=c.pl/c.W,ptw=(c.W-c.pl-c.pr)/c.W,f2=Math.max(0,Math.min(1,(fx-ptx)/ptw)),b=C4.nearest(c,f2);if(!b)return;
  const p=b.p,x=c.X(p.t)/c.W*100,y=c.Y(p.v)/c.H*100;el.classList.add('on');el.querySelector('.c4v').style.left=x+'%';const d=el.querySelector('.c4d');d.style.left=x+'%';d.style.top=y+'%';
  const tip=el.querySelector('.c4tip');tip.innerHTML=c.o.tip?c.o.tip(p,b.k,b.i):('<b>'+(c.o.fmt||money0)(p.v)+'</b><span>'+esc(p.lab||sdate(p.t))+'</span>');tip.style.left=Math.max(14,Math.min(86,x))+'%';if(c.o.onscrub)try{c.o.onscrub(p,b.k,b.i)}catch(e){}};
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.c4[data-c4]');if(!el)return;move(el,e.clientX);const mv=ev=>{move(el,ev.clientX)},up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);setTimeout(()=>el.classList.remove('on'),2200)};addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)});
// bars: tap selects (the page decides what to do through the data attribute it asked for)
document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.c4bar');if(!g)return;const el=g.closest('.c4b'),attr=el&&el.dataset.c4sel;if(!attr)return;e.preventDefault();e.stopImmediatePropagation();const fn=C4.onsel[attr];if(fn)fn(g.dataset.c4k)},true);
C4.onsel={};
// ---------- range controls: "Look back" and "Look ahead", in words ----------
C4.ranges=(name,back,ahead,cur)=>'<div class="c4rg"><div><small>Look back</small>'+F3.seg(name+'b',back,cur.back)+'</div>'+(ahead?'<div><small>Look ahead</small>'+F3.seg(name+'a',ahead,cur.ahead)+'</div>':'')+'</div>';
C4.monthsBetween=(a,b)=>{const A=new Date(a),B=new Date(b);return (B.getUTCFullYear()-A.getUTCFullYear())*12+B.getUTCMonth()-A.getUTCMonth()};
C4.spanText=(t0,t1)=>{const f=t=>new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',year:'numeric'});return f(t0)+' to '+f(t1)};
try{if(window.__S)window.__S.C4=C4}catch(e){}
}
