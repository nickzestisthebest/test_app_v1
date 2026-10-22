// ---------- transactions by category ----------
const TCATS=[['groc','Groceries','#5fc98a','🥬',/kroger|publix|grocery|aldi|walmart|safeway|trader|whole foods|costco|food lion|market/],
 ['dine','Dining and coffee','#9ad9b4','🍵',/chipotle|starbucks|coffee|cafe|restaurant|doordash|uber ?eats|grubhub|pizza|taco|burger|dunkin|chick|mcdonald|lunch|dinner|breakfast|bagel|sushi/],
 ['gas','Gas and getting around','#7cc6c2','🚲',/shell|chevron|exxon|fuel|\bgas\b|uber|lyft|parking|toll|transit|\bbp\b|metro/],
 ['shop','Shopping','#c3e88d','🛍️',/amazon|target|best buy|ebay|etsy|clothes|shoes|mall|nike|zara/],
 ['subs','Subscriptions','#4fae7e','♻️',/netflix|spotify|hulu|apple|icloud|adobe|audible|prime|\bgym\b|youtube|disney|max\b/],
 ['health','Health','#a6e3a1','🍏',/cvs|walgreens|pharmacy|doctor|dental|clinic|rx\b/],
 ['fun','Going out and fun','#f6d98b','🎉',/concert|movie|ticket|game|\bbar\b|club|show/],
 ['bill','Bills and payments','#3d8f6a','💵',null],['bas','Other basics','#b5dfc8','🌱',null],['oth','Other fun','#f5b7a5','🍀',null]];
const tcatOf=s=>{if(s.cat==='Bill')return'bill';const n=String(s.note||'').toLowerCase();const h=TCATS.find(c=>c[4]&&c[4].test(n));return h?h[0]:(s.cat==='Personal'?'oth':'bas')};
let TXV='cat',TXCX=null;
function txSegSync(){let g=document.getElementById('tx-seg');if(!g){const sum=document.getElementById('tx-sum');if(!sum)return;g=document.createElement('div');g.id='tx-seg';g.className='xseg2';g.setAttribute('role','tablist');sum.insertAdjacentElement('afterend',g)}
  g.innerHTML=[['cat','Breakdown'],['list','History']].map(v=>'<button type="button" role="tab" data-txview="'+v[0]+'" aria-selected="'+(TXV===v[0])+'" class="'+(TXV===v[0]?'on':'')+'">'+v[1]+'</button>').join('')}
function catDonut(parts,tot){let a=-Math.PI/2,o='';const R=54,r=36,cx=64,cy=64;parts.forEach(p=>{const f=p.v/tot;if(f<=0)return;const a2=a+f*Math.PI*2-(f<1?0.02:0);const lg=a2-a>Math.PI?1:0;
  const P=(rad,ang)=>[cx+rad*Math.cos(ang),cy+rad*Math.sin(ang)].map(n=>n.toFixed(2)).join(' ');
  o+=f>=0.999?'<circle cx="64" cy="64" r="45" fill="none" stroke="'+p.c+'" stroke-width="18"/>':'<path d="M'+P(R,a)+' A'+R+' '+R+' 0 '+lg+' 1 '+P(R,a2)+' L'+P(r,a2)+' A'+r+' '+r+' 0 '+lg+' 0 '+P(r,a)+'Z" fill="'+p.c+'"/>';a=a+f*Math.PI*2});
  return '<svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="Spending by category">'+o+'</svg>'}
function renderCats(){const L=txList().filter(s=>s.cat!=='Income'),box=document.getElementById('tx-list');if(!box)return;
  if(!L.length){box.innerHTML='<div class="txempty"><b>No spending in this range</b><p>Try a wider date range above.</p></div>';return}
  const g={};L.forEach(s=>{const k=tcatOf(s);(g[k]=g[k]||{v:0,n:0,items:[]});g[k].v+= +s.amt;g[k].n++;g[k].items.push(s)});
  const tot=Object.values(g).reduce((a,x)=>a+x.v,0),parts=TCATS.filter(c=>g[c[0]]).map(c=>({k:c[0],name:c[1],c:c[2],ic:c[3],v:g[c[0]].v,n:g[c[0]].n,items:g[c[0]].items})).sort((a,b)=>b.v-a.v),top=parts[0];
  const disc=parts.filter(p=>p.k!=='bill'),dtop=disc[0];
  box.innerHTML='<div class="catsum">'+catDonut(parts,tot)+'<div><span>Total spent</span><b>'+money(tot)+'</b><small>'+L.length+' purchase'+(L.length===1?'':'s')+'</small>'+(dtop?'<p>Most went to <b>'+esc(dtop.name.toLowerCase())+'</b>: '+Math.round(dtop.v/tot*100)+'% of the total.</p>':'')+'</div></div>'+
   parts.map(p=>{const open=TXCX===p.k;return '<div class="catr'+(open?' open':'')+'"><button type="button" class="catb" data-txcx="'+p.k+'" aria-expanded="'+open+'"><span class="catic">'+p.ic+'</span><span class="catt"><b>'+esc(p.name)+'</b><small>'+p.n+' purchase'+(p.n===1?'':'s')+' · '+Math.round(p.v/tot*100)+'%</small><i class="catbar"><i style="width:'+(p.v/top.v*100).toFixed(1)+'%;background:'+p.c+'"></i></i></span><span class="cata">'+money(p.v)+'</span></button>'+
    (open?'<div class="catlist">'+p.items.sort((a,b)=>b.t-a.t).map(s=>'<button class="txrow" data-txe="'+s.i+'"><span class="txt"><b>'+esc(s.note||catName(s.cat,s.kind))+'</b><small>'+sdate(s.t)+(s.pending?' · Pending':'')+'</small></span><span class="txa">−'+money(+s.amt)+'</span></button>').join('')+'</div>':'')+'</div>'}).join('')}
const _renderTx=renderTx;
renderTx=function(){_renderTx();txSegSync();const v=document.getElementById('txv');if(v)v.classList.toggle('catmode',TXV==='cat');if(TXV==='cat')renderCats()};
document.addEventListener('click',e=>{const v=e.target.closest&&e.target.closest('[data-txview]');if(v){TXV=v.dataset.txview;TXCX=null;renderTx();return}
  const c=e.target.closest&&e.target.closest('[data-txcx]');if(c){TXCX=TXCX===c.dataset.txcx?null:c.dataset.txcx;renderTx();return}},true);
document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('.catlist [data-txe]');if(r&&TXV==='cat'){TXV='list'}},true);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-tx7]'))TXV='cat'},true);
document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('#menu [data-nav=tx]');if(n){TXV='cat';TXCX=null}},true);
