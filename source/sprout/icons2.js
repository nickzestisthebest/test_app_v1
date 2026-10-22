// ===================== Category icons: more of them, drawn like the rest, and picked for you from the name =====================
const ICN={};
{
const c=(x,y,r)=>'M'+(x-r)+' '+y+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0';
Object.assign(CICO,{
 paw:['#f7c9a6','#d98545',c(6.5,10.5,1.6)+c(10,7,1.7)+c(14,7,1.7)+c(17.5,10.5,1.6)+'M12 12.5c-2.6 0-5.5 3.2-5.5 5.4 0 1.4 1.1 2.1 2.6 2.1 1.1 0 1.8-.6 2.9-.6s1.8.6 2.9.6c1.5 0 2.6-.7 2.6-2.1 0-2.2-2.9-5.4-5.5-5.4z'],
 dumbbell:['#a9d8f0','#3b8bbf','M3.5 9.5v5M6.5 7.5v9M17.5 7.5v9M20.5 9.5v5M6.5 12h11'],
 plane:['#a6d4f5','#3d86c6','M21 15.5 13.5 11V5.5a1.5 1.5 0 0 0-3 0V11L3 15.5v2l7.5-2.3V19l-2 1.5V22l3.5-1 3.5 1v-1.5l-2-1.5v-3.8l7.5 2.3z'],
 car:['#9fd2e0','#3a8cab','M4.5 15.5V12l2-5h11l2 5v3.5zM4.5 12h15'+c(8,15.5,1.8)+c(16,15.5,1.8)],
 fuel:['#9fd7cf','#2f8f84','M5.5 20V5.5A1.5 1.5 0 0 1 7 4h6a1.5 1.5 0 0 1 1.5 1.5V20M4 20h12M5.5 10h9M14.5 9h2a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 0 3 0V8l-2.5-2.5'],
 bus:['#b3d6f2','#4c86c0','M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v11.5h-15V6A1.5 1.5 0 0 1 6 4.5zM4.5 12h15M8 17.5V20M16 17.5V20M7.5 15h.01M16.5 15h.01'],
 bike:['#bfe3c2','#4f9a58',c(6,16,3.5)+c(18,16,3.5)+'M6 16l4-7h6l2 7M10 9l2.5 7M9 6.5h2.5'],
 tooth:['#cfe4f7','#5b8fc4','M12 6.2C10.6 4.8 8.8 4 7.2 4.5 4.6 5.3 4.4 8.6 5.6 11.3c.8 1.8 1.1 3.8 1.4 6 .2 1.6.7 2.7 1.6 2.7 1.2 0 1.4-1.6 1.8-3.4.3-1.3.8-2.1 1.6-2.1s1.3.8 1.6 2.1c.4 1.8.6 3.4 1.8 3.4.9 0 1.4-1.1 1.6-2.7.3-2.2.6-4.2 1.4-6 1.2-2.7 1-6-1.6-6.8-1.6-.5-3.4.3-4.8 1.7z'],
 cross:['#f6b3a9','#d2604f','M9.5 4.5h5v5h5v5h-5v5h-5v-5h-5v-5h5z'],
 pill:['#f4c0d2','#c9567f','M10.6 4.9a4 4 0 0 1 5.7 0l2.8 2.8a4 4 0 0 1 0 5.7l-5.7 5.7a4 4 0 0 1-5.7 0l-2.8-2.8a4 4 0 0 1 0-5.7zM7.8 7.8l8.5 8.5'],
 gift:['#f3b6c8','#cc5a82','M4.5 10h15v3.5h-15zM5.5 13.5h13V20h-13zM12 10v10M12 10c-1-2.8-4.5-4.6-5.5-2.5S9 10 12 10zM12 10c1-2.8 4.5-4.6 5.5-2.5S15 10 12 10z'],
 stroller:['#f6cfa6','#d48a3c','M5 6h6.5v6H19a7 7 0 0 1-14 0zM11.5 12V4.5a7 7 0 0 1 7 7.5'+c(8,19.5,1.5)+c(16,19.5,1.5)],
 cap:['#c6c6f2','#6a66c8','M2.5 9.5 12 5l9.5 4.5L12 14zM6.5 11.5v4c1.5 1.6 3.4 2.5 5.5 2.5s4-.9 5.5-2.5v-4M21.5 9.5v5'],
 book:['#d5c4ee','#7e5fbf','M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5zM5 18.5A1.5 1.5 0 0 0 6.5 20H19M9 8h6'],
 cup:['#e4cbb0','#a26a3b','M5.5 9h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5zM15.5 10h1.5a2.5 2.5 0 0 1 0 5h-1.6M8 3.5c-.6.9.6 1.6 0 2.6M11 3.5c-.6.9.6 1.6 0 2.6'],
 glass:['#f3d48f','#c58f1f','M6.5 4.5h11l-1.5 15.5h-8zM7 9h10'],
 heart:['#f7b7bf','#d65a6a','M12 19.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z'],
 house:['#b9e2c4','#3f9a5f','M4.5 11 12 4.5l7.5 6.5M6.5 9.5v10h11v-10M10 19.5v-5h4v5'],
 wrench:['#c9d3dc','#66798b','M14.5 4.5a4.5 4.5 0 0 0-4.2 6.1L4.5 16.4a2.1 2.1 0 0 0 3 3l5.8-5.8a4.5 4.5 0 0 0 6.1-4.2l-2.6 2.6-2.8-.4-.4-2.8z'],
 key:['#f2d79a','#c3922a',c(8,12,3.5)+'M11.5 12h9M17.5 12v3M20.5 12v2.5'],
 bolt:['#f8e08e','#d1a314','M13 3.5 5.5 13.5H12l-1 7 7.5-10H12z'],
 drop:['#a9dcf2','#3592c0','M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5z'],
 wifi:['#b4d9ef','#4189b8','M3.5 9.5a12 12 0 0 1 17 0M6.5 12.5a7.8 7.8 0 0 1 11 0M9.5 15.5a3.5 3.5 0 0 1 5 0M12 18.5h.01'],
 phone:['#bcd2f0','#4f78b8','M8.5 3.5h7A1.5 1.5 0 0 1 17 5v14a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19V5a1.5 1.5 0 0 1 1.5-1.5zM11 17.5h2'],
 shield:['#bfdccb','#4a8f68','M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6z'],
 play:['#c7c2f0','#6b5fc4','M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5zM10.5 9.5v5l4-2.5z'],
 music:['#e2bff0','#9a54b8','M9 17.5V6l10-2v11.5M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 15.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z'],
 game:['#c3c9f2','#5560c4','M7.5 8.5h9a4 4 0 0 1 3.9 4.9l-.8 3.6a2 2 0 0 1-3.5.8L14.5 16h-5l-1.6 1.8a2 2 0 0 1-3.5-.8l-.8-3.6a4 4 0 0 1 3.9-4.9zM8.5 11v3M7 12.5h3M15.5 12h.01M17 13.5h.01'],
 sparkle:['#f5c3df','#cc5c99','M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2L5 10.5l5.2-1.8zM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z'],
 scissors:['#d6cbe9','#7d68ad',c(6.5,7,2.5)+c(6.5,17,2.5)+'M8.6 8.4 19.5 17M8.6 15.6 19.5 7'],
 shirt:['#c4e3a0','#5f9a2d','M9 4.5 4.5 7 6 11l2-.8v9.3h8v-9.3l2 .8L19.5 7 15 4.5c-.5 1.3-1.6 2-3 2s-2.5-.7-3-2z'],
 briefcase:['#d9c9b5','#8a6a45','M4 8h16v11H4zM9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M4 13h16'],
 piggy:['#f7c2c9','#d06b7a','M5.5 11.5a6.5 5.5 0 0 1 11.8-3.2l2.7-.8-.6 3.1a5 5 0 0 1 .6 2.4c0 1.6-.8 3-2 4V19h-2.5v-1.3a7 7 0 0 1-3 .1V19H10v-1.8a5.5 5.5 0 0 1-3-2.7H5v-3zM14.5 9.5h.01'],
 tag:['#cfe0d6','#6f9580','M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.7 6.7a1.4 1.4 0 0 1-2 0zM8 8h.01'],
 umbrella:['#b9d6ef','#4a7fb5','M3.5 12a8.5 8.5 0 0 1 17 0zM12 12v6a2 2 0 0 0 4 0'],
 ticket:['#f8d77f','#dd9f2b','M4 7.5h16v3a1.5 1.5 0 0 0 0 3v3H4v-3a1.5 1.5 0 0 0 0-3zM14 7.5v9'],
 paint:['#f5cdb0','#cf7a3e','M12 4a8 8 0 0 0 0 16c1.1 0 1.5-.8 1.5-1.6 0-1.3-1-1.4-1-2.4 0-.8.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4C20 6.9 16.4 4 12 4zM8 11h.01M10.5 7.5h.01M15 8h.01'],
 camera:['#c8d4de','#5b7387','M4.5 8h3L9 5.5h6L16.5 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'+c(12,13,3.3)],
 pl:['#d6c8f0','#7a62bf','M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8.5 4v3.5M15.5 4v3.5M8 14h2M12 14h2M8 17h2'],
 bank:['#c5d8cc','#56806a','M4 9.5 12 5l8 4.5M5.5 9.5v8M9.5 9.5v8M14.5 9.5v8M18.5 9.5v8M4 19.5h16'],
 chart:['#b6e3c8','#2f9a5e','M4 19.5h16M6.5 16l4-5 3 3 5-6.5M15 7.5h3.5V11'],
 card:['#c9d6ea','#5872a3','M3.5 6.5h17v11h-17zM3.5 10h17M7 14.5h3']});
// what a category's name (or its stores) is about, most specific first
ICN.K=[['pl',/pay ?later|klarna|affirm|afterpay|installment/],['tooth',/dent|tooth|teeth|ortho|braces/],['pill',/pharmac|\bmeds?\b|medicine|prescription|\brx\b|\bcvs\b|walgreens|vitamin|supplement/],
 ['cross',/medical|doctor|health|hospital|clinic|urgent|copay|therap|vision|optom|\blabs?\b|dermat|chiro/],['paw',/\bpets?\b|\bdogs?\b|\bcats?\b|pupp|kitten|\bvet\b|veterin|petco|petsmart|chewy|groom|kennel|litter/],
 ['dumbbell',/\bgym\b|fitness|workout|yoga|pilates|crossfit|\bsports?\b|training|onelife|peloton|athlet|climbing/],['plane',/travel|\btrips?\b|vacation|flight|airline|hotel|airbnb|getaway/],
 ['scissors',/haircut|barber/],['sparkle',/beauty|\bhair\b|nails?|salon|\bspa\b|makeup|cosmetic|skin ?care|ulta|sephora|lash|brows|self ?care/],
 ['stroller',/\bkids?\b|child|baby|babies|daycare|diaper|toddler|nanny|babysit/],['cap',/school|tuition|college|class|course|education|student|universit|textbook/],['book',/\bbooks?\b|kindle|reading|audible|library/],
 ['gift',/gifts?|birthday|christmas|presents?|wedding|shower|anniversar/],['cup',/coffee|\bcafe|starbucks|dunkin|\btea\b|boba/],['glass',/\bbars?\b|drinks|alcohol|liquor|beer|wine|brewer|cocktail|nightlife/],
 ['heart',/donat|charit|church|tithe|giving|nonprofit|offering|date night|dating/],['key',/\brent\b|mortgage|housing|landlord|apartment/],['wrench',/repair|maintenance|\btools?\b|hardware|home depot|lowe'?s|handyman|plumb/],
 ['house',/\bhome\b|house|furniture|decor|ikea|wayfair|garden/],['bolt',/electric|\bpower\b|utilit|energy/],['drop',/water|sewer/],['wifi',/internet|wi-?fi|cable|broadband/],
 ['phone',/phone|\bcell\b|mobile|wireless|t-?mobile|verizon|at&t/],['shield',/insurance|geico|progressive|state farm|allstate|warranty|protection/],['car',/\bcars?\b|\bauto\b|vehicle|oil change|tires?|\bdmv\b|registration|car wash/],
 ['fuel',/\bgas\b|fuel|gasoline/],['bus',/transit|\bbus\b|train|subway|metro|commut|marta|uber|lyft|rides?\b|parking|toll/],['bike',/bike|cycling|scooter/],
 ['play',/stream|netflix|hulu|disney|\btv\b|movies?|youtube/],['music',/music|spotify|concert|vinyl|instrument/],['game',/games?|gaming|xbox|playstation|nintendo|steam|twitch/],
 ['shirt',/cloth|apparel|shoes?|sneaker|fashion|nike|adidas|outfit|wardrobe|zara/],['briefcase',/\bwork\b|business|office|career|freelanc|clients?/],
 ['piggy',/saving|emergency fund|rainy day/],['chart',/stocks?|crypto|brokerage|invest/],['camera',/photo|camera/],['paint',/hobb|craft|\bart\b|\barts\b|paint/],['ticket',/events?|tickets?|\bshows?\b|theat|festival|amusement|\bfun\b|entertain/],
 ['groc',/grocer|food shopping|supermarket|costco|aldi|kroger|publix|walmart/],['dine',/dining|eat(ing)? out|restaurant|takeout|delivery|lunch|dinner|\bfood\b/],
 ['shop',/shopping|amazon|target|\bstuff\b|online/],['subs',/subscriptions?|memberships?/],['card',/credit card|\bdebt\b|loan/],['bank',/\bbank\b|fees?\b/]];
ICN.LIST=['tag','paw','dumbbell','plane','car','fuel','bus','bike','tooth','cross','pill','gift','stroller','cap','book','cup','glass','heart','house','wrench','key','bolt','drop','wifi','phone','shield','play','music','game','sparkle','scissors','shirt','briefcase','piggy','chart','umbrella','ticket','paint','camera','groc','dine','shop','subs','pl','card'];
// typos are fine: "Groceires", "Pet stuf"
ICN.norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9&' -]/g,' ');
ICN.auto=(name,words)=>{const n=ICN.norm(name),w=ICN.norm(words);for(const k of ICN.K)if(k[1].test(n))return k[0];
  // close spellings of the name
  try{if(typeof FZ!=='undefined'){const f=FZ.fix(n);if(f!==n)for(const k of ICN.K)if(k[1].test(f))return k[0]}}catch(e){}
  for(const k of ICN.K)if(w&&k[1].test(w))return k[0];return 'tag'};
ICN.of=id=>{try{const b=B2.g(),cu=b.custom.find(x=>x.id===id);if(cu)return cu.icon&&CICO[cu.icon]?cu.icon:ICN.auto(cu.name,cu.words)}catch(e){}return null};
{const _ci=catIcon;catIcon=function(k,cls){const s=String(k||''),id=s.indexOf('b:')===0?s.slice(2):s,ic2=ICN.of(id);return _ci.call(this,ic2||k,cls)}}
// the picker on the new-category and category screens
ICN.pick=null;
ICN.btn=(key)=>'<div class="f b2if"><span>Icon</span><div class="b2irow"><button type="button" class="b2icon" data-b2icon aria-label="Change icon">'+catIcon(key)+'</button><small class="xhint" id="b2-ihint">'+(ICN.pick?'Your pick':'Picked from the name. Tap to change.')+'</small></div><div class="b2igrid" hidden>'+ICN.LIST.map(k=>'<button type="button" class="b2iopt'+(k===key?' on':'')+'" data-b2iopt="'+k+'" aria-label="'+k+'">'+catIcon(k)+'</button>').join('')+'</div></div>';
{const _bn=PAGES.budnew;PAGES.budnew=function(){ICN.pick=null;const h=_bn.apply(this,arguments);return h.replace('<div class="f"><span>What kind of spending is it?</span>',ICN.btn('tag')+'<div class="f"><span>What kind of spending is it?</span>')}}
{const _bc=PAGES.budcat;PAGES.budcat=function(id){const h=_bc.apply(this,arguments);if(!B2.isCustom(id))return h;const cu=B2.g().custom.find(c=>c.id===id);ICN.pick=cu&&cu.icon?cu.icon:null;return h.replace('<div class="f"><span>What kind of spending is it?</span>',ICN.btn(ICN.of(id)||'tag')+'<div class="f"><span>What kind of spending is it?</span>')}}
ICN.live=()=>{if(ICN.pick)return;const n=document.getElementById('b2-name'),w=document.getElementById('b2-words'),b=document.querySelector('[data-b2icon]');if(!n||!b)return;const k=ICN.auto(n.value,w?w.value:'');b.innerHTML=catIcon(k);b.dataset.k=k;
  document.querySelectorAll('[data-b2iopt]').forEach(o=>o.classList.toggle('on',o.dataset.b2iopt===k))};
document.addEventListener('input',e=>{const t=e.target;if(t&&(t.id==='b2-name'||t.id==='b2-words'))ICN.live()});
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  if(t.closest('[data-b2icon]')){const g=document.querySelector('.b2igrid');if(g)g.hidden=!g.hidden;return}
  const o=t.closest('[data-b2iopt]');if(o){ICN.pick=o.dataset.b2iopt;const b=document.querySelector('[data-b2icon]');if(b){b.innerHTML=catIcon(ICN.pick);b.dataset.k=ICN.pick}document.querySelectorAll('[data-b2iopt]').forEach(x=>x.classList.toggle('on',x===o));const h=document.getElementById('b2-ihint');if(h)h.textContent='Your pick';const g=document.querySelector('.b2igrid');if(g)g.hidden=true;return}},false);
// remember the icon when the category is saved (the save itself happens in the budgets code)
document.addEventListener('click',e=>{const sv=e.target.closest&&e.target.closest('[data-b2save]');if(!sv)return;const n=document.getElementById('b2-name'),bt=document.querySelector('[data-b2icon]'),name=n?String(n.value||'').trim():'',id=sv.dataset.b2save;if(!name)return;
  const icon=ICN.pick||(bt&&bt.dataset.k)||ICN.auto(name,(document.getElementById('b2-words')||{}).value||''),manual=!!ICN.pick;
  setTimeout(()=>{try{const b=B2.g(),cu=id==='new'?b.custom.slice().reverse().find(c=>c.name===name.slice(0,28)):b.custom.find(c=>c.id===id);if(!cu)return;if(manual||!cu.icon||id==='new')cu.icon=icon;queueSave()}catch(_){}},0)},true);
}
