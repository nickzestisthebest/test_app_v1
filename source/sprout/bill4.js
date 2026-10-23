// ===================== Bills 4: one "Repeats" choice everywhere, and repeats Sprout finds that fit a month =====================
// Monthly (pick the day), Every 2 weeks, Weekly, Yearly, or Custom (every N days, weeks or months).
const REP={};
{
const r2=MX.r2,ordn=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');
// what a bill costs in a month, whatever its schedule
REP.mo=b=>{const x=+b.amt||0;if(b.type==='monthly')return x/Math.max(1,+b.months||1);return x*30.44/Math.max(1,+b.every||30)};
REP.kind=b=>{if(b.type==='monthly'){const m=+b.months||1;return m===1?'monthly':m===12?'yearly':'custom'}const e=+b.every||14;return e===14?'2w':e===7?'weekly':'custom'};
REP.text=b=>{if(b.type==='monthly'){const m=+b.months||1,an=b.anchor&&isDate(b.anchor)?new Date(pd(b.anchor)):null;if(m===1)return 'Monthly on the '+ordn(+b.day||1);if(m===12&&an)return 'Yearly on '+new Date(Date.UTC(2000,an.getUTCMonth(),+b.day||1)).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'});return 'Every '+m+' months on the '+ordn(+b.day||1)}
  const e=+b.every||14;return e===7?'Weekly':e===14?'Every 2 weeks':e%7===0?'Every '+(e/7)+' weeks':'Every '+e+' days'};
F2.billLine=b=>money(+b.amt)+' · '+REP.text(b);
// the editor
PAGES.ybill=w=>{const b=w==='new'?{name:'',amt:'',type:'monthly',day:1}:(state.bills||[])[+w];if(!b)return '<p class="xhint">That bill is gone.</p>';const k=REP.kind(b),T=realDay();
  const nextOf=()=>{try{const L=(rows&&rows.items||[]).filter(x=>x.name===b.name&&x.t>=T).sort((a,c)=>a.t-c.t);return L[0]?L[0].t:null}catch(e){return null}},nx=nextOf();
  const cu=b.type==='monthly'?{n:+b.months||1,u:'months'}:((+b.every||14)%7===0?{n:(+b.every||14)/7,u:'weeks'}:{n:+b.every||14,u:'days'});
  const an=b.anchor&&isDate(b.anchor)?b.anchor:(b.first&&isDate(b.first)?b.first:fd(T));
  return '<div class="xf b2form rep4">'+(b.auto?'<p class="xhint" style="margin:0">Sprout found this in your bank history. Change anything that’s off.</p>':'')+
   '<label class="f">Name<input id="yb-n" maxlength="40" value="'+esc(b.name)+'" placeholder="Like Rent or Phone"></label><label class="f">Amount<div class="pre4"><span>$</span><input id="yb-a" type="text" inputmode="decimal" value="'+(b.amt===''?'':r2(b.amt))+'" placeholder="0"></div></label>'+
   '<div class="f"><span>Repeats</span><div class="wchips" id="rep4">'+[['monthly','Monthly'],['2w','Every 2 weeks'],['weekly','Weekly'],['yearly','Yearly'],['custom','Custom']].map(o=>'<button type="button" class="wchip'+(k===o[0]?' on':'')+'" data-rep4="'+o[0]+'">'+o[1]+'</button>').join('')+'</div></div>'+
   '<div class="rep4g" data-show="monthly custom-months"><label class="f">On day<input id="yb-d" type="text" inputmode="numeric" value="'+(+b.day||1)+'" aria-label="Day of the month"></label><small class="xhint">31 means the last day in shorter months.</small></div>'+
   '<div class="rep4g" data-show="yearly"><label class="f">On<input id="rep4-y" type="date" value="'+esc(an)+'"></label></div>'+
   '<div class="rep4g" data-show="custom"><div class="rep4c"><span>Every</span><input id="rep4-n" type="text" inputmode="numeric" value="'+cu.n+'" aria-label="How many"><select id="rep4-u" aria-label="Unit">'+['days','weeks','months'].map(u=>'<option'+(cu.u===u?' selected':'')+'>'+u+'</option>').join('')+'</select></div></div>'+
   '<div class="rep4g" data-show="2w weekly custom-days custom-weeks"><label class="f">Next one<input id="yb-f" type="date" value="'+(b.first||(nx?fd(nx):fd(T)))+'"></label></div>'+
   '<p class="xhint rep4sum" id="rep4-sum"></p>'+
   '<button type="button" class="btn" data-yp="savebill" data-w="'+esc(w)+'">Save</button>'+(w!=='new'?'<button type="button" class="btn x" data-yp="delbill" data-w="'+esc(w)+'">Delete this bill</button>':'')+'</div>'};
REP.cur=()=>{const on=document.querySelector('#rep4 .wchip.on');return on?on.dataset.rep4:'monthly'};
REP.sync=()=>{const k=REP.cur(),u=(document.getElementById('rep4-u')||{}).value||'days',tag=k==='custom'?'custom-'+u:k;document.querySelectorAll('.rep4g').forEach(g=>{const s=g.dataset.show.split(' ');g.hidden=!(s.indexOf(k)>=0||s.indexOf(tag)>=0)});
  const el=document.getElementById('rep4-sum');if(el){const b=REP.read();el.textContent=b?'Repeats: '+REP.text(b)+(b.type==='monthly'&&(+b.months||1)>1?' · about '+money(REP.mo(Object.assign({amt:parseAmt((document.getElementById('yb-a')||{}).value)||0},b)))+' a month':''):''}};
REP.read=()=>{const k=REP.cur(),num=id=>Math.round(parseFloat(((document.getElementById(id)||{}).value||'').replace(/[^0-9.]/g,''))||0),first=(document.getElementById('yb-f')||{}).value||fd(realDay());
  if(k==='monthly')return{type:'monthly',day:Math.min(31,Math.max(1,num('yb-d')||1)),months:1};
  if(k==='yearly'){const y=(document.getElementById('rep4-y')||{}).value;if(!isDate(y))return null;return{type:'monthly',day:new Date(pd(y)).getUTCDate(),months:12,anchor:y}}
  if(k==='2w')return{type:'every',every:14,first};if(k==='weekly')return{type:'every',every:7,first};
  const n=Math.max(1,num('rep4-n')||1),u=(document.getElementById('rep4-u')||{}).value||'days';if(u==='months')return{type:'monthly',day:Math.min(31,Math.max(1,num('yb-d')||1)),months:n,anchor:fd(realDay())};return{type:'every',every:u==='weeks'?n*7:n,first}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rep4]');if(!b)return;e.preventDefault();b.parentNode.querySelectorAll('.wchip').forEach(x=>x.classList.toggle('on',x===b));REP.sync()});
document.addEventListener('input',e=>{if(e.target&&e.target.closest&&e.target.closest('.rep4'))REP.sync()});document.addEventListener('change',e=>{if(e.target&&e.target.closest&&e.target.closest('.rep4'))REP.sync()});
{const _xr=xRender;xRender=function(){const r=_xr.apply(this,arguments);try{if(document.querySelector('.rep4'))REP.sync()}catch(e){}return r}}
// saving uses the Repeats choice
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-yp=savebill]');if(!b||!document.querySelector('.rep4'))return;e.preventDefault();e.stopImmediatePropagation();const w=b.dataset.w;
  const n=String((document.getElementById('yb-n')||{}).value||'').trim().slice(0,40),amt=parseAmt((document.getElementById('yb-a')||{}).value);if(!n){toast('Give it a name');return}if(!(amt>0)){toast('Enter the amount');return}
  const r=REP.read();if(!r){toast('Pick the date');return}const o=w==='new'?{}:Object.assign({},state.bills[+w]);['type','day','every','first','months','anchor','auto'].forEach(k=>delete o[k]);const nb=Object.assign(o,{name:n,amt:r2(amt)},r);
  state.bills=state.bills||[];if(w==='new')state.bills.push(nb);else state.bills[+w]=nb;try{editors()}catch(_){}plan();queueSave();toast('Saved · '+REP.text(nb));xBack()},true);
// repeats Sprout finds: gaps that fit whole months (one or two months apart) are monthly, not "every 52 days"
{const _bo=RC.billOf;RC.billOf=s=>{const b=_bo(s);try{const per=+s.per||0,months=per/30.44,near=Math.round(months);if(b.type==='every'&&(/phone|mobile|wireless|verizon|at&t|t-mobile|tmobile|sprint|electric|power|water|gas co|internet|xfinity|comcast|spectrum|insurance|rent|mortgage|loan/i.test(s.name+' '+(s.raw||''))||(near>=1&&Math.abs(months-near)<0.25))){return{name:b.name,amt:b.amt,type:'monthly',day:s.day||new Date(s.next||realDay()).getUTCDate(),months:1,src:b.src,auto:1}}}catch(e){}return b}}
// older bills saved as "every N days" where N fits a month are shown and planned as monthly
REP.fix=()=>{try{(state.bills||[]).forEach(b=>{if(b.type==='every'&&b.auto&&/phone|mobile|wireless|t-mobile|tmobile|verizon|at&t/i.test(b.name)){const f=isDate(b.first)?pd(b.first):realDay();b.type='monthly';b.day=new Date(f).getUTCDate();b.months=1;delete b.every;delete b.first}})}catch(e){}};
{const _plan=plan;plan=function(){REP.fix();return _plan.apply(this,arguments)}}
try{if(window.__S)window.__S.REP=REP}catch(e){}
}
