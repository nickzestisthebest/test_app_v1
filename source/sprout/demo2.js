// ---------- example: a thriving user ----------
function thrivingState(){const s=clone(DEFAULTS),t=todayStr,T=pd(t),D=n=>fd(T-n*MS);
  Object.assign(s,{name:'Jordan',demo:true,setup:true,cash:12480,cashAt:Date.now(),asOf:t,pay:3100,payFreq:'biweekly',firstPay:addDays(t,5),cushion:8000,everyday:700,discReduced:600,discTarget:600,savings:600,saved:1300,
   goals:[{name:'Emergency fund',amt:10000},{name:'Japan trip',amt:3000}],
   bills:[{name:'Rent',type:'monthly',day:1,from:t,amt:1450},{name:'Phone',type:'monthly',day:12,from:t,amt:65},{name:'Car insurance',type:'monthly',day:20,from:t,amt:118},{name:'Internet',type:'monthly',day:8,from:t,amt:55},{name:'Gym',type:'monthly',day:4,from:t,amt:30},{name:'Spotify',type:'monthly',day:5,from:t,amt:11.99}],
   debts:[{name:'Car loan',bal:6100,apr:5.9,min:285,day:15,extra:true,skippable:false}],sched:[],startDebt:14600});
  const sp=[],add=(n,amt,cat,note)=>sp.push({d:D(n),amt,cat,note,at:T-n*MS+43200000});
  for(let w=0;w<5;w++){add(2+w*7,58+w*3,'Everyday','Kroger');add(4+w*7,44,'Everyday','Shell gas');add(1+w*7,14.2,'Personal','Chipotle');add(5+w*7,5.75,'Personal','Coffee')}
  add(9,38,'Personal','Target');add(16,62,'Personal','Concert tickets');add(11,23,'Everyday','CVS');add(0,5.75,'Personal','Coffee');add(0,9.5,'Everyday','Lunch');
  sp.forEach(x=>{if(x.d<D(0)||x.d===D(0))s.spend.push(x)});
  s.checkin={last:t,streak:64,best:64};
  const log={},days={},aw={};for(let i=1;i<=63;i++)log[D(i)]=i===22?'s':'g';for(let i=1;i<=8;i++)days[D(i)]={a:30,s:i===3?0:Math.round((12+i*1.7)*100)/100,ck:true};
  [3,7,14,30,60].forEach(m=>aw['1:'+m]=1);
  s.stk={log,days,aw,qw:{},savers:3,run:63,best:64,kept:186,keptAll:1486,banked:1300,sid:1,last:D(1),lg:{tier:3,wk:weekKey(),rank:2}};
  s.x2={subs:{adobe:{s:'cancelled',at:Date.now()-20*MS,redir:true},audible:{s:'cancelled',at:Date.now()-9*MS}},nego:{phone:{sv:12.5,at:Date.now()-30*MS}},bud:{groc:300,din:120},dis:{},notif:{},
   vault:{bal:2400,round:true,pay:true,pct:false,log:[{t:'Saved $25 on payday',d:fdate(T-5*MS),a:25},{t:'Round-ups this week',d:fdate(T-2*MS),a:6.4},{t:'Added to vault',d:fdate(T-12*MS),a:250}],al:{'Emergency fund':1800,'Japan trip':600}},
   soc:{like:{},save:{},cm:{},vote:{},ans:{},join:{g1:true,g2:true},chal:{},mute:{},posts:[{id:'u1',who:'Jordan',t:'2d',type:'progress',tag:'Debt',txt:'Credit card is gone and the car loan is next. 64 green days and counting.',card:{pct:58,stage:3,streak:62},lk:31,cm:[['maya.pays','That tree is huge now!']],mine:true}],qs:[]},
   plus:{on:1,bill:'yr'},rw:{bal:16,log:[]},house:null};
  s.link={on:1,at:Date.now(),sel:{checking:true,cards:true,loans:true,later:false},accts:[MOCK_ACCTS.checking,MOCK_ACCTS.cards,MOCK_ACCTS.loans],mock:{pending:[],bal:12480}};
  s.prefs=Object.assign({},state.prefs||{});return s}
function loadExample(kind){const keep=state.prefs||null;HIST=[];try{histSave()}catch(e){}state=kind==='thriving'?thrivingState():demoState();state.prefs=keep;if(kind==='thriving'){try{localStorage.setItem('sp-coach','1')}catch(_){}}editors();plan();queueSave();closeSheets();if(typeof closeWizard==='function')closeWizard();if(typeof goHome==='function')setTimeout(goHome,280);toast(kind==='thriving'?'Loaded a thriving example: Jordan, 64 green days and a full tree.':'Loaded the getting-started example.')}
PAGES.examples=()=>'<div class="xcard"><b>Thriving</b><small class="xhint">Jordan has $12,480 in checking, one loan left, a 64-day green streak and a full tree.</small><button class="btn" data-x="loadex" data-v="thriving">Load this example</button></div><div class="xcard"><b>Getting started</b><small class="xhint">Tight budget, a credit card and a car loan, just beginning to grow.</small><button class="btn alt" data-x="loadex" data-v="start">Load this example</button></div>'+demoNote('Loading an example replaces what is in this demo app.');
TITLES.examples='Example data';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=loadex]');if(!b)return;loadExample(b.dataset.v)});
