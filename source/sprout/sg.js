// ===================== Smart budget suggestions: only when the pattern is strong, one at a time, never a popup =====================
// "You've spent about $X a month on Pets for the last 3 months. Want a Pets budget?" Shown in Insights, at most about once a week.
// A "No thanks" keeps that suggestion away for 90 days, and Settings can turn them all off.
const SG={};
{
const r2=x=>Math.round((+x||0)*100)/100,DY=MS,r5=x=>Math.max(5,Math.ceil(x/5)*5);
SG.g=()=>{const g=LG.st();g.sg=g.sg||{};g.sg.no=g.sg.no||{};return g.sg};
// spending themes Sprout can offer as their own budget, with the stores that usually belong to them
SG.TH=[['pets','Pets','basic',/petco|petsmart|chewy|\bvet\b|veterin|banfield|bark ?box|pet supplies|\bpet\b/i],['medical','Medical','basic',/cvs|walgreens|rite aid|pharmac|dental|dentist|orthodont|doctor|clinic|hospital|urgent care|labcorp|quest diag|optomet|vision center|medical|\bhealth\b|copay/i],
 ['kids','Kids','basic',/daycare|child ?care|carter'?s|buy buy baby|toys ?r|kid|baby|diaper/i],['fitness','Fitness','fun',/\bgym\b|fitness|yoga|pilates|crossfit|orangetheory|onelife|peloton|climbing|athletic club/i],
 ['personal','Personal care','basic',/salon|barber|great clips|supercuts|sport clips|\bnails?\b|\bspa\b|ulta|sephora|beauty|lash|brow/i],['travel','Travel','fun',/airline|delta air|united air|american air|southwest|spirit air|frontier air|jetblue|hotel|marriott|hilton|hyatt|airbnb|vrbo|expedia|booking\.com|hertz|enterprise rent|avis/i],
 ['car','Car','basic',/autozone|o'?reilly|advance auto|jiffy lube|valvoline|pep boys|firestone|discount tire|car ?wash|meineke|midas|\bdmv\b|tag office/i],['home','Home','basic',/home depot|lowe'?s|ikea|wayfair|bed bath|homegoods|ace hardware|menards|at home store/i],
 ['coffee','Coffee','fun',/starbucks|dunkin|coffee|\bcafe\b|dutch bros|peet'?s|tim hortons/i],['delivery','Food delivery','fun',/doordash|uber ?eats|grubhub|postmates|instacart|gopuff/i],
 ['entertain','Entertainment','fun',/\bamc\b|regal|cinemark|ticketmaster|stubhub|seatgeek|topgolf|bowling|dave ?& ?buster|steam|playstation|xbox|nintendo|concert|museum/i],
 ['gifts','Gifts','fun',/gift|hallmark|1-800-flowers|edible arrangement|flowers/i],['education','Education','basic',/tuition|college|universit|coursera|udemy|chegg|textbook|school/i],['gas','Gas','basic',/shell|chevron|exxon|mobil\b|\bbp\b|quiktrip|\bqt\b|racetrac|wawa|sheetz|murphy usa|speedway|circle k|kroger fuel|costco gas|marathon|valero|sunoco|citgo/i]];
SG.full=n=>{const T=realDay(),d=new Date(T),out=[];for(let k=n;k>=1;k--)out.push(fd(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-k,1)).slice(0,7));return out};
SG.off=()=>!!SG.g().off;
// everything Sprout could suggest right now, strongest first
SG.all=()=>{if(LG.demo()||!state.setup)return [];B2.sync();const R=SP.rows(),M=SG.full(3),M4=SG.full(4),have=new Set(R.map(r=>r.m));if(M.filter(m=>have.has(m)).length<3)return [];
  const inM=R.filter(r=>M.indexOf(r.m)>=0),tot=inM.reduce((a,r)=>a+r.amt,0)/3,out=[],b=B2.g(),mean=a=>a.reduce((x,y)=>x+y,0)/a.length,cv=a=>{const m=mean(a);return m>0?Math.sqrt(mean(a.map(v=>(v-m)*(v-m))))/m:9};
  // a theme you spend on steadily that has no budget of its own
  SG.TH.forEach(th=>{const name=th[1];if(BCATS.some(c=>c[1].toLowerCase()===name.toLowerCase()||(B2.isCustom(c[0])&&th[3].test(c[1]))))return;if(th[0]==='gas'&&BCATS.some(c=>c[0]==='gas'))return;
    const rows=R.filter(r=>r.amt>0&&th[3].test(r.note)&&M4.indexOf(r.m)>=0);const by=M.map(m=>r2(rows.filter(r=>r.m===m).reduce((a,r)=>a+r.amt,0)));
    const hits=M4.filter(m=>rows.some(r=>r.m===m)).length;if(hits<3||by.some(v=>v<=0))return;const avg=mean(by);
    if(avg<40||avg<tot*0.03||cv(by)>0.35||rows.length<4)return;
    const stores=[...new Set(rows.map(r=>(mkey(r.note)||'').split(' ')[0]).filter(w=>w&&w.length>=3))].slice(0,8);
    out.push({id:'new:'+th[0],type:'new',th,name,kind:th[2],amt:r5(avg),by,months:M,n:rows.length,rows:rows.map(r=>r.s),stores,score:avg*(1-cv(by)),
      short:'About '+money0(avg)+' a month on '+name.toLowerCase()+'. Want a budget for it?'})});
  // a budget you go over every month, or one with lots of room
  BCATS.forEach(c=>{const l=budLim(c);if(!(l>0)||c[0]==='oth')return;const by=M.map(m=>r2(R.filter(r=>r.m===m&&r.cat===c[0]).reduce((a,r)=>a+r.amt,0))),avg=mean(by);
    if(by.every(v=>v>l*1.1&&v-l>=20)&&cv(by)<=0.4)out.push({id:'up:'+c[0]+':'+Math.round(l),type:'up',cat:c,amt:r5(avg),by,months:M,score:(avg-l)*1.2,short:'You’ve gone over '+c[1]+' 3 months in a row. Raise it to '+money0(r5(avg))+'?'});
    else if(by.every(v=>v>0&&v<l*0.5)&&l-avg>=50&&cv(by)<=0.5)out.push({id:'down:'+c[0]+':'+Math.round(l),type:'down',cat:c,amt:r5(Math.max(avg*1.15,avg+10)),by,months:M,score:(l-avg)*0.6,short:c[1]+' has room: about '+money0(avg)+' of '+money0(l)+' a month.'})});
  const no=SG.g().no,T=Date.now();return out.filter(s=>!(no[s.id]&&T-no[s.id]<90*DY)).sort((a,b)=>b.score-a.score)};
// the one to show now: none if they're off, or one was shown in the last week and is still waiting
SG.next=()=>{if(SG.off())return null;let L=[];try{L=SG.all()}catch(e){}if(!L.length)return null;const g=SG.g(),T=Date.now(),cur=L.find(s=>s.id===g.cur);
  if(cur)return cur;if(g.at&&T-g.at<7*DY)return null;return L[0]};
SG.seen=s=>{const g=SG.g();if(g.cur!==s.id){g.cur=s.id;g.at=Date.now();queueSave()}};
SG.card=()=>{const s=SG.next();if(!s)return '';SG.seen(s);
  const bars='<div class="sgbars">'+s.by.map((v,i)=>'<span><i style="height:'+Math.max(6,Math.round(v/Math.max(...s.by,1)*100))+'%"></i><small>'+SP.monthLabel(s.months[i])+'</small><b>'+money0(v)+'</b></span>').join('')+'</div>';
  const t=s.type==='new'?'You spend about '+money0(s.by.reduce((a,b)=>a+b,0)/3)+' a month on '+s.name.toLowerCase():s.type==='up'?'You’ve gone over '+s.cat[1]+' 3 months in a row':s.cat[1]+' has room to spare';
  const d=s.type==='new'?'Want a '+s.name+' budget of '+money0(s.amt)+'? '+s.n+' past purchase'+(s.n>1?'s':'')+' would move into it'+(s.stores.length?', from places like '+s.stores.slice(0,3).map(w=>w[0].toUpperCase()+w.slice(1)).join(', '):'')+'.':s.type==='up'?'Your budget is '+money0(budLim(s.cat))+'. Raising it to '+money0(s.amt)+' matches what you really spend, so your daily number stays honest.':'You usually spend well under '+money0(budLim(s.cat))+'. Lowering it to '+money0(s.amt)+' frees up money in your plan.';
  return '<div class="xcard sgcard"><span class="sgk">'+ic('spark')+'Suggestion</span><b>'+esc(t)+'</b>'+bars+'<p>'+esc(d)+'</p><div class="b2gapb"><button type="button" class="sbtn" data-sg="go" data-v="'+esc(s.id)+'">'+(s.type==='new'?'Preview':'Use '+money0(s.amt))+'</button><button type="button" class="sbtn alt" data-sg="no" data-v="'+esc(s.id)+'">No thanks</button></div></div>'};
TITLES.sgprev='New budget';
PAGES.sgprev=id=>{const s=SG.all().find(x=>x.id===id);if(!s)return '<p class="xhint">This suggestion isn’t available anymore.</p>';const R=s.rows.slice().sort((a,b)=>a.d<b.d?1:-1);
  return '<div class="xhero"><span class="k">'+esc(s.name)+'</span><b>'+money0(s.amt)+'<small style="font-size:16px"> a month</small></b><span class="d">Based on '+s.by.map((v,i)=>SP.monthLabel(s.months[i])+' '+money0(v)).join(', ')+'</span></div>'+
   '<div class="xcard"><h3>These move into '+esc(s.name)+'</h3><p class="xhint" style="margin:0 0 8px">Only which budget they count toward changes. What you spent, your cash flow and Safe to spend stay exactly the same.</p>'+R.slice(0,30).map(x=>'<div class="b2tx"><div><b>'+esc(x.note||'Purchase')+'</b><small>'+sdate(pd(x.d))+' · now in '+esc((BCATS.find(c=>c[0]===B2.catOf(x))||[0,'Everything else'])[1])+'</small></div><span class="b2ta">−'+money(+x.amt)+'</span></div>').join('')+(R.length>30?'<p class="xhint">And '+(R.length-30)+' more</p>':'')+'</div>'+
   '<button type="button" class="btn" data-sg="make" data-v="'+esc(s.id)+'">Create '+esc(s.name)+' budget</button><button type="button" class="btn alt" data-sg="no" data-v="'+esc(s.id)+'">No thanks</button>'};
SG.apply=s=>{const x=X(),b=B2.g();
  if(s.type==='new'){const nid='c'+Date.now().toString(36);b.custom.push({id:nid,name:s.name,limit:s.amt,kind:s.kind,words:s.stores.join(', '),icon:ICN.auto(s.name,s.stores.join(' '))});x.bud[nid]=s.amt;b.kind[nid]=s.kind;
    // purchases you moved yourself stay where you put them
    B2.sync();B2.push();queueSave();const g=SG.g();g.cur=null;g.at=Date.now();
    toastAct('Added a '+s.name+' budget. '+s.n+' purchase'+(s.n>1?'s':'')+' moved in.','Undo',()=>{b.custom=b.custom.filter(c=>c.id!==nid);delete x.bud[nid];delete b.kind[nid];B2.sync();B2.push();queueSave();if(typeof xRender==='function')xRender();try{renderTx()}catch(e){}});return}
  const prev=x.bud[s.cat[0]];x.bud[s.cat[0]]=s.amt;B2.push();queueSave();const g=SG.g();g.cur=null;g.at=Date.now();
  toastAct(s.cat[1]+' is now '+money0(s.amt)+' a month','Undo',()=>{if(prev==null)delete x.bud[s.cat[0]];else x.bud[s.cat[0]]=prev;B2.push();queueSave();try{renderTx()}catch(e){}})};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sg]');if(!b)return;e.preventDefault();const a=b.dataset.sg,id=b.dataset.v,s=SG.all().find(x=>x.id===id),g=SG.g();
  if(a==='no'){g.no[id]=Date.now();g.cur=null;g.at=Date.now();queueSave();toast('Okay. Sprout won’t suggest that again for a while.');if(document.getElementById('sh-x')&&!document.getElementById('sh-x').hidden&&XP.page==='sgprev')closeSheets();try{renderTx()}catch(_){}try{pgRender()}catch(_){}return}
  if(!s)return;if(a==='go'){if(s.type==='new')xOpen('sgprev',id);else{SG.apply(s);try{renderTx()}catch(_){}}return}
  if(a==='make'){SG.apply(s);closeSheets();try{renderTx()}catch(_){}}});
try{if(window.__S)window.__S.SG=SG}catch(e){}
}
