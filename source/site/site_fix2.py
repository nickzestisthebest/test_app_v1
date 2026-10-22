# Second QA pass: cross-browser hardening and chart/dashboard polish.
# Runs after site_fix.py. Every replacement asserts it matched exactly once.
import re
f = 'bonsai_site.html'; s = open(f).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:100], s.count(a)); s = s.replace(a, b)
def cut(start, end):
    """return the exact text from start up to and including end (both must be unique)"""
    assert s.count(start) == 1, start[:80]
    i = s.index(start); j = s.index(end, i) + len(end); return s[i:j]

# =====================================================================
# HTML: bento cards
# =====================================================================
# Better together: layout moves from an inline style (which never collapsed on phones) to CSS
rep('<div class="card c-f" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center">', '<div class="card c-f">')

# Subscriptions: name and tag share one cell so the tag can wrap under a long name
rep('<span class="ic">N</span>Netflix<b>', '<span class="ic">N</span><span class="nm">Netflix</span><b>')
rep('<span class="ic">A</span>Adobe Creative Cloud<em class="tag">Not used</em><b>', '<span class="ic">A</span><span class="nm">Adobe Creative Cloud<em class="tag">Not used</em></span><b>')
rep('<span class="ic">H</span>Hulu<em class="tag up">Price went up</em><b>', '<span class="ic">H</span><span class="nm">Hulu<em class="tag up">Price went up</em></span><b>')
rep('<span class="ic">F</span>Fitzone Gym<em class="tag">Not used</em><b>', '<span class="ic">F</span><span class="nm">Fitzone Gym<em class="tag">Not used</em></span><b>')

# Bills calendar: real October 2026 layout (the 1st is a Thursday), labelled for screen readers
rep('<div class="demo calw">', '<div class="demo calw" role="img" aria-label="October bill calendar: bills due on the 2nd, 5th, 12th, 15th and 20th, paydays on the 9th and 23rd">')
rep("let cal='';for(let d=1;d<=28;d++)cal+=", "let cal='<span class=\"x\"></span>'.repeat(3);for(let d=1;d<=31;d++)cal+=")

# Debt chart: a plot area that JS draws at its real pixel size (the static SVG stays as a no-JS fallback)
old_svg = cut('<div class="demo dchart"><svg viewBox="0 0 312 136"', '</svg>')
fallback = old_svg.replace('<div class="demo dchart">', '').replace(' role="img" aria-label="Debt falling from $6,100 in October to $0 in February 2027"', ' aria-hidden="true"')
rep(old_svg, '<div class="demo dchart"><div class="dplot" id="dplot" role="img" aria-label="Debt falling from $6,100 in October to $0 in February 2027">' + fallback + '</div>')

# Ask card: same sample answer as the Ask Sprout section (one consistent sample account), plus a compose bar
ANS = '<b>It is tight.</b> You will have about $70 for fun before payday, so $80 goes about $10 over. Try $60, or plan it for after payday.'
rep('<div class="bub ai" id="chat-ai"><span class="typing"><i></i><i></i><i></i></span></div></div>',
    '<div class="bub ai" id="chat-ai">' + ANS + '</div><div class="cin" aria-hidden="true"><span>Ask anything about your money…</span><i>↑</i></div></div>')
rep("if(t.id==='chat-ai')setTimeout(()=>{t.innerHTML='Yes. You have <b>$118</b> left for fun before payday, so $80 still leaves $38. Rent is already covered.'},RM?0:1400);",
    "if(t.id==='chat-ai'&&ANIM){const a=t.innerHTML;t.innerHTML='<span class=\"typing\"><i></i><i></i><i></i></span>';setTimeout(()=>{t.innerHTML=a},1400)}")

# Budget score: bigger ring with label, each signal shows its value, bars capped in width
old_hsc = cut('<div class="demo hsc">', '<span>Habits</span><i><u style="width:100%"></u></i></div></div></div>')
bars = ''.join('<div><span>%s</span><em>%d</em><i><u style="--w:%d%%"></u></i></div>' % (n, v, v) for n, v in (('Spending', 92), ('Saving', 84), ('Debt', 88), ('Habits', 100)))
rep(old_hsc, '<div class="demo hsc"><div class="hring" role="img" aria-label="Budget score 90 out of 100, Strong"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="trk" cx="32" cy="32" r="27"/><circle class="arc" cx="32" cy="32" r="27" transform="rotate(-90 32 32)"/></svg><div class="hrv"><b>90</b><span>Strong</span></div></div>'
    '<div class="hbars">' + bars + '</div></div>')

# Savings goals: icon, name, amount, percent and a full-width track
SHIELD = '<path d="M12 3.5l7 2.8v5.2c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>'
PLANE = '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
def goal(name, amt, pct, ca, cb, icon):
    return ('<div class="goal"><span class="cico" style="--ca:%s;--cb:%s" aria-hidden="true"><svg viewBox="0 0 24 24">%s</svg></span>'
            '<div class="gm"><b>%s</b><small>%s</small></div><em>%d%%</em><i><u style="--w:%d%%"></u></i></div>') % (ca, cb, icon, name, amt, pct, pct)
rep('<div class="demo"><div class="svg1"><b>Emergency fund</b><span>$3,200 of $5,000</span><i><u style="width:64%"></u></i></div><div class="svg1"><b>Trip to Denver</b><span>$840 of $1,200</span><i><u style="width:70%"></u></i></div></div>',
    '<div class="demo goals">' + goal('Emergency fund', '$3,200 of $5,000', 64, '#74d497', '#2f9e58', SHIELD) + goal('Trip to Denver', '$840 of $1,200', 70, '#86c9de', '#3a8cab', PLANE) + '</div>')

# Referral: a ticket for the code and what happens when a friend joins
rep('<div class="demo refd"><span class="code">SPRT-7K2QXM</span><span class="refnote">Up to 12 free months a year. Terms apply.</span></div>',
    '<div class="demo refd"><div class="tkt"><small>Your invite code</small><span class="code">SPRT-7K2QXM</span></div>'
    '<div class="refev"><span class="av" style="background:#d0604d">M</span><span><b>maya.pays</b> joined with your code</span><em>+1 month</em></div>'
    '<span class="refnote">Up to 12 free months a year. Terms apply.</span></div>')

# Press and hold: the pressed bill lifts and a context menu opens under it
rep('<div class="holdm" aria-label="Example press-and-hold menu for a bill"><div class="h"><b>Phone</b>$65.00 due Oct 12</div><div class="i">Mark paid</div><div class="i">Can this wait?</div><div class="i">See all bills</div></div>',
    '<div class="hold" role="img" aria-label="Example press-and-hold menu for the Phone bill: Mark paid, Can this wait?, See all bills">'
    '<div class="hold-prev"><span class="cico" style="--ca:#86c9de;--cb:#3a8cab" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18h2"/></svg></span><div><b>Phone</b><small>Due Oct 12</small></div><em>$65.00</em></div>'
    '<div class="hold-menu"><div>Mark paid<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><div>Can this wait?<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></div><div>See all bills<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg></div></div></div>')

# League: header and rank numbers
rep('<div class="league" id="league"><div><span class="av" style="background:#d0604d">M</span>maya.pays<b>7</b></div><div class="me"><span class="av" style="background:#174f2f">Y</span>You<b>6</b></div><div><span class="av" style="background:#5b7fb8">S</span>sam.steady<b>6</b></div><div><span class="av" style="background:#c9892b">D</span>dee.dollars<b>5</b></div></div>',
    '<div class="league" id="league"><p class="lhd"><span>This week’s league</span><span>Green days</span></p><div><i class="rk">1</i><span class="av" style="background:#d0604d">M</span>maya.pays<b>7</b></div><div class="me"><i class="rk">2</i><span class="av" style="background:#174f2f">Y</span>You<b>6</b></div><div><i class="rk">3</i><span class="av" style="background:#5b7fb8">S</span>sam.steady<b>6</b></div><div><i class="rk">4</i><span class="av" style="background:#c9892b">D</span>dee.dollars<b>5</b></div></div>')

# =====================================================================
# HTML: other sections
# =====================================================================
rep('<div class="num" id="sk-num">48</div>', '<div class="skn"><div class="num" id="sk-num">48</div><span>days</span></div>')
# Ask section: buttons keep button semantics (role=listitem replaced them), live region only announces after a tap
rep('<div class="qs" id="qs" role="list"></div>', '<div class="qs" id="qs" role="group" aria-label="Example questions"></div>')
rep('<div class="chatbox" aria-live="polite">', '<div class="chatbox">')
rep('<div class="chlog" id="chlog"></div>', '<div class="chlog" id="chlog" aria-live="off"></div>')
rep('<div class="hlcaps" aria-live="polite">', '<div class="hlcaps" aria-live="off">')
rep('<button type="button" class="hlpill', '<button type="button" role="tab" class="hlpill', 5)
# Pricing: every plan ends with a clear next step
rep('<li>Streaks, your growing sprout and Community</li></ul></div>', '<li>Streaks, your growing sprout and Community</li></ul><a class="btn ghost pcta" href="#join">Join the waitlist</a></div>')
rep('<li>Streak rewards: earn Plus credit</li></ul></div>', '<li>Streak rewards: earn Plus credit</li></ul><a class="btn pcta pcta2" href="#join">Join the waitlist</a></div>')
rep('<div class="plan plus"><h3>Sprout Plus</h3>', '<div class="plan plus"><div class="ph"><h3>Sprout Plus</h3><span class="pbadge">7-day free trial</span></div>')

# =====================================================================
# JS
# =====================================================================
# IntersectionObserver guard (very old browsers would otherwise stop the whole script), animation flag, matchMedia helper
rep("<script>\n(()=>{\nconst RM=matchMedia('(prefers-reduced-motion: reduce)').matches;",
    "<script>\nif(!('IntersectionObserver' in window)){window.IntersectionObserver=function(cb){this.observe=t=>setTimeout(()=>cb([{isIntersecting:true,intersectionRatio:1,target:t}],this),60);this.unobserve=this.disconnect=()=>{}};window.IntersectionObserver.fake=true}\n"
    "(()=>{\nconst RM=matchMedia('(prefers-reduced-motion: reduce)').matches;\n"
    "// animation polish only: content is fully visible without this class\n"
    "const ANIM=!RM&&!IntersectionObserver.fake;if(ANIM)document.documentElement.classList.add('anim');\n"
    "const onMQ=(q,fn)=>{const m=matchMedia(q);if(m.addEventListener)m.addEventListener('change',fn);else if(m.addListener)m.addListener(fn)};")
# Safari 13 has no MediaQueryList.addEventListener; the old call threw and stopped everything after it
rep("matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{BGC={};lastBg='';onScroll()});",
    "onMQ('(prefers-color-scheme: dark)',()=>{BGC={};lastBg='';onScroll()});")

# setGrow: only touch the five plant layers when the stage actually changes
rep("let lastScore=-1;function setGrow(p){", "let lastScore=-1,lastSt=-1;function setGrow(p){")
rep("""  svgs.forEach((s,i)=>{s.style.opacity=i===st?1:0;s.style.transform=i===st?'scale(1)':'scale(.92)'});
  $('#g-score').textContent=money(score,0);$('#g-name').textContent=STAGES[st][0];$$('#g-stages i').forEach((e,i)=>e.classList.toggle('on',i<=st))}""",
    """  $('#g-score').textContent=money(score,0);if(st===lastSt)return;lastSt=st;
  svgs.forEach((s,i)=>{s.style.opacity=i===st?1:0;s.style.transform=i===st?'scale(1)':'scale(.92)'});
  $('#g-name').textContent=STAGES[st][0];$$('#g-stages i').forEach((e,i)=>e.classList.toggle('on',i<=st))}""")

# Scroll engine: read every position first, then write; deep sections paint their own background
old_scroll = cut('function onScroll(){const vh=innerHeight,mid=vh*.8;', "setGrow(clamp(-g.top/(g.height-vh),0,1))}\n}")
rep(old_scroll, """const BD=$('#backdrop'),PROG=$('#story-prog'),STEPS=$$('.step'),SCREENS=$$('[data-screen]');let wideMode=null;
function applyMode(){const w=innerWidth>860;if(w===wideMode)return;wideMode=w;lastStep=-1;lastSt=-1;lastScore=-1;
  if(!w){SCREENS.forEach(e=>{e.style.opacity=e.dataset.screen==='2'?1:0;e.style.transform='none'});setGrow(.75)}}
function onScroll(){const vh=innerHeight,mid=vh*.55,wide=innerWidth>860;
  // reads first (no forced layout between them)
  let cur=null;for(let k=0;k<secs.length;k++){const sc=secs[k];if(sc.dataset.bg==='--deep')continue;const r=sc.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid){cur=sc;break}}
  const sr=wide?story.getBoundingClientRect():null,gr=wide?grow.getBoundingClientRect():null;
  // then writes. Dark sections draw their own background, so the backdrop keeps the last light color and dark text never sits on dark green
  if(cur){const bg=cssv(cur.dataset.bg);if(bg!==lastBg){BD.style.backgroundColor=bg;lastBg=bg}}
  if(wide){const p=clamp(-sr.top/(sr.height-vh),0,1),st=Math.min(2,Math.floor(p*3));PROG.style.transform='scaleX('+p.toFixed(4)+')';
    if(st!==lastStep){lastStep=st;STEPS.forEach((e,i)=>e.classList.toggle('on',i===st));SCREENS.forEach((e,i)=>{e.style.opacity=i===st?1:0;e.style.transform=i===st?'none':'translateY('+(i<st?-16:16)+'px)'})}
    setGrow(clamp(-gr.top/(gr.height-vh),0,1))}
}""")
rep("addEventListener('resize',onScroll);", "addEventListener('resize',()=>{applyMode();onScroll()});")
rep("if(innerWidth<=860){$$('[data-screen]').forEach(e=>{e.style.opacity=e.dataset.screen==='2'?1:0;e.style.transform='none'});setGrow(.75)}\nonScroll();", "applyMode();onScroll();")

# Ask Sprout: a running thread (no empty box), pauses off screen and in background tabs
old_ask = cut("const qs=$('#qs'),log=$('#chlog');", "io3.observe($('#ask'));")
rep(old_ask, """const qs=$('#qs'),log=$('#chlog');let qi=0,qt=null,auto=!RM,pend=null,askVis=false,askOn=false;
qs.innerHTML=QA.map((q,i)=>'<button type="button" aria-pressed="false" data-q="'+i+'">'+q[0]+'</button>').join('');
log.innerHTML='<div class="bub ai hi">Hi Jordan. Ask me anything about your money, or tap a question.</div><div class="bub me">'+QA[5][0]+'</div><div class="bub ai">'+QA[5][1]+'</div>';
const bub=(c,h)=>{const d=document.createElement('div');d.className='bub '+c;d.innerHTML=h;log.appendChild(d);return d};
function nextAsk(ms){clearTimeout(qt);qt=null;if(auto&&askVis&&!document.hidden)qt=setTimeout(()=>ask((qi+1)%QA.length),ms)}
function ask(i){qi=i;askOn=true;$$('#qs button').forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-pressed',j===i?'true':'false')});clearTimeout(qt);qt=null;if(pend)pend();
  bub('me',QA[i][0]);const a=bub('ai','<span class="typing"><i></i><i></i><i></i></span>');while(log.children.length>7)log.removeChild(log.firstChild);
  pend=()=>{pend=null;a.innerHTML=QA[i][1]};qt=setTimeout(()=>{if(pend)pend();nextAsk(5200)},RM?0:900)}
function pauseAsk(){clearTimeout(qt);qt=null;if(pend)pend()}
qs.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;auto=false;log.setAttribute('aria-live','polite');ask(+b.dataset.q)});
const io3=new IntersectionObserver(es=>es.forEach(e=>{askVis=e.isIntersecting;if(askVis&&!document.hidden){if(!askOn)ask(0);else if(!qt)nextAsk(1600)}else pauseAsk()}),{threshold:.15});io3.observe($('.chatbox'));""")

# Highlights: captions are announced only after a tap, demos never start in a background tab
rep("document.querySelectorAll('.hlpill').forEach(p=>p.addEventListener('click',()=>gShow(+p.dataset.i,gVis)));",
    "document.querySelectorAll('.hlpill').forEach(p=>p.addEventListener('click',()=>{$('.hlcaps').setAttribute('aria-live','polite');gShow(+p.dataset.i,gVis)}));")
rep("const L=loops.find(d=>d.el===e.target);if(L){if(e.isIntersecting)L.play(true);else L.stop()}\n  else{gVis=e.isIntersecting;if(e.isIntersecting)gShow(gi,true);",
    "const L=loops.find(d=>d.el===e.target);if(L){L.inView=e.isIntersecting;if(e.isIntersecting&&!document.hidden)L.play(true);else L.stop()}\n  else{gVis=e.isIntersecting;if(e.isIntersecting&&!document.hidden)gShow(gi,true);")
# Screenshot merge: any visible part starts it (a 20% threshold could never be reached on a phone held sideways)
rep("sn.classList.toggle('on',e.isIntersecting)),{threshold:.2})", "sn.classList.toggle('on',e.isIntersecting)),{threshold:0})")

# New behaviour appended at the end of the main script
tail = r"""
// ----- debt chart, drawn at its real pixel size so labels stay the same size at every width -----
const DEBT=[6100,4950,3650,2000,0],DM=['Oct','Nov','Dec','Jan','Feb'],dplot=$('#dplot');let dSize='';
function drawDebt(){if(!dplot)return;const W=Math.round(dplot.clientWidth),H=Math.round(dplot.clientHeight);if(W<80||H<60||W+'x'+H===dSize)return;dSize=W+'x'+H;
  const L=36,R=8,T=10,B=24,pw=W-L-R,ph=H-T-B,TOP=6400,X=i=>L+i*pw/(DEBT.length-1),Y=v=>T+(1-v/TOP)*ph,f=n=>n.toFixed(1);
  const P=DEBT.map((v,i)=>[X(i),Y(v)]);let d='M'+f(P[0][0])+' '+f(P[0][1]);
  for(let k=0;k<P.length-1;k++){const p0=P[k-1]||P[k],p1=P[k],p2=P[k+1],p3=P[k+2]||P[k+1];
    d+=' C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1])}
  let g='',t='';[6000,4000,2000,0].forEach(v=>{const y=f(Y(v));g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/>';t+='<text x="'+(L-8)+'" y="'+f(Y(v)+3.5)+'" text-anchor="end">'+(v?'$'+(v/1000)+'k':'$0')+'</text>'});
  DM.forEach((m,i)=>{t+='<text x="'+f(X(i))+'" y="'+(H-6)+'" text-anchor="'+(i===0?'start':i===DM.length-1?'end':'middle')+'">'+m+'</text>'});
  dplot.innerHTML='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" aria-hidden="true" focusable="false"><defs><linearGradient id="dgf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fae5a" stop-opacity=".26"/><stop offset="1" stop-color="#2fae5a" stop-opacity="0"/></linearGradient></defs>'
    +'<g class="dgrid">'+g+'</g><g class="dlab">'+t+'</g><path class="darea" d="'+d+' L'+f(X(4))+' '+f(Y(0))+' L'+f(X(0))+' '+f(Y(0))+' Z" fill="url(#dgf2)"/>'
    +'<path class="line" d="'+d+'" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle class="dstart" cx="'+f(P[0][0])+'" cy="'+f(P[0][1])+'" r="4.5"/><circle class="dend" cx="'+f(P[4][0])+'" cy="'+f(P[4][1])+'" r="5.5"/></svg>';
  const ln=dplot.querySelector('.line');try{ln.style.setProperty('--L',(ln.getTotalLength()+4).toFixed(1)+'px')}catch(e){}}
drawDebt();
if(dplot){if('ResizeObserver' in window){let rq=0;new ResizeObserver(()=>{cancelAnimationFrame(rq);rq=requestAnimationFrame(drawDebt)}).observe(dplot)}else addEventListener('resize',drawDebt)}
// ----- reveal-on-view for the remaining dashboard cards (polish only) -----
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');rio.unobserve(e.target)}}),{threshold:.3});
$$('.c-h,.c-i,.c-j,.c-g').forEach(c=>rio.observe(c));
// ----- background tabs: stop demo timers, resume where they were when the tab comes back -----
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseAsk();demoEls.forEach(d=>d.stop())}
  else{if(askVis&&askOn)nextAsk(1600);if(!RM){loops.forEach(d=>{if(d.inView)d.play(true)});if(gVis)gShow(gi,true)}}});
"""
rep("so.observe(sn)}}\n})();\n</script>", "so.observe(sn)}}\n" + tail + "})();\n</script>")

# =====================================================================
# CSS
# =====================================================================
css = r'''
/* ---------- QA pass 2: tokens ---------- */
:root{--solid:#1f7a42;--navfb:rgba(242,250,245,.84);--mcfb:#e6f5eb}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--solid:#23864a;--navfb:rgba(11,21,16,.84);--mcfb:#193724}}
:root[data-theme="dark"]{--solid:#23864a;--navfb:rgba(11,21,16,.84);--mcfb:#193724}
/* solid green fills keep white text readable in dark mode too */
.bub.me,.chlog .bub.me,.league div.me,.cal span.t,.dpill,.mile.on,.chin i{background:var(--solid);color:#fff}
.plan.plus{background:linear-gradient(160deg,var(--solid),#174f2f)}

/* ---------- layout robustness ---------- */
section[id],main[id]{scroll-margin-top:calc(env(safe-area-inset-top,0px) + 60px)}
.backdrop{bottom:auto;height:100vh}
@supports (height:100lvh){.backdrop{height:100lvh}}
.nav ul a,.nav .btn{white-space:nowrap}
@media (max-width:1040px){.nav ul{gap:18px;font-size:14.5px}}
@media (max-width:920px){.nav ul{display:none}.nav .btn{margin-left:auto}}
.grow h2,.cta h2{line-height:1.04}
.prog i{width:100%;transform:scaleX(0);transform-origin:0 50%}
@media (max-width:860px){.story .prog{display:none}}
/* rounded phone screens clip their moving layers in Safari too */
.phone .scr,.hlcard{isolation:isolate}
.phone .scr{-webkit-transform:translateZ(0);transform:translateZ(0)}
/* community posts never split across columns */
.cpost{display:inline-flex;width:100%;vertical-align:top;-webkit-column-break-inside:avoid;page-break-inside:avoid;break-inside:avoid}
/* sticky stages fit short laptop screens (content used to run under the nav) */
@media (min-width:861px){
  .story .phone{width:min(300px,calc((100vh - 150px) * .4532))}
  .bonsai-stage{width:min(420px,80vw,max(200px,calc((100vh - 440px) * 1.34)))}
  .grow .stick h2{font-size:clamp(34px,min(4.8vw,6.6vh),64px)!important}
  .grow .score{font-size:clamp(46px,min(7vw,9.5vh),92px)}
}
@supports (height:100svh){@media (min-width:861px){
  .story .phone{width:min(300px,calc((100svh - 150px) * .4532))}
  .bonsai-stage{width:min(420px,80vw,max(200px,calc((100svh - 440px) * 1.34)))}
}}
@media (min-width:861px) and (max-height:860px){
  .story h2{font-size:clamp(30px,min(4vw,5.4vh),52px)!important;margin-bottom:22px!important}
  .steps{gap:16px}.step h3{font-size:clamp(22px,min(2.4vw,3.6vh),34px)}.step p{font-size:15.5px;line-height:1.5}.prog{margin-top:20px!important}
}
@media (min-width:861px) and (max-height:680px){.story .eyebrow{display:none}.step p{font-size:14.5px}.steps{gap:12px}}

/* ---------- bento grid: balanced rows at every width ---------- */
.card>.demo{flex:1 1 auto}
.c-f{grid-column:span 6;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center}
@media (max-width:900px){.c-f{grid-template-columns:1fr}}
.c-a .demo{justify-content:center}
@media (min-width:700px) and (max-width:1023px){
  .c-a,.c-b,.c-c,.c-d,.c-e,.c-h,.c-i,.c-j{grid-column:span 3}
  .c-g,.c-f{grid-template-columns:1fr 1fr}
}
@media (max-width:600px){.bento{gap:14px;margin-top:36px}.card{padding:20px;border-radius:24px}.card h3{font-size:24px}}

/* subscriptions */
.sub{gap:12px;min-height:36px}
.sub .nm{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;min-width:0;line-height:1.3}
.sub b{flex:none;font-variant-numeric:tabular-nums}

/* spending donut: legend sits beside the ring when there is room, under it when not */
.cats{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;align-content:center;justify-content:center;gap:16px 26px;padding:20px}
.donut{flex:none;width:150px;height:150px}
.legend{flex:1 1 210px;max-width:340px;width:auto}
@media (max-width:420px){.legend{width:auto}}

/* bills calendar */
.calw{justify-content:center}
.calw>*{width:100%;max-width:440px;margin-left:auto;margin-right:auto}
.cal span{aspect-ratio:auto;height:34px}
.cal span.x{background:none}

/* debt chart */
.dchart{padding:14px 14px 12px}
.dplot{position:relative;flex:1 1 auto;min-height:150px}
.dplot svg{position:absolute;top:0;left:0;width:100%;height:100%;display:block;overflow:visible}
.dlab text{font-size:11px}
/* beats the old ".debt path.line" rule, which hid the line until the observer fired */
.debt .dchart path.line{stroke:var(--accent);stroke-dasharray:none;stroke-dashoffset:0}
.darea{opacity:1}.dend{opacity:1}
.dstart{fill:var(--card);stroke:var(--accent)}
.dend{fill:var(--solid);stroke:var(--card)}
.anim .debt .dchart .line{stroke-dasharray:var(--L);stroke-dashoffset:var(--L);transition:stroke-dashoffset 1.7s cubic-bezier(.2,.8,.2,1)}
.anim .debt.on .dchart .line{stroke-dashoffset:0}
.anim .debt:not(.on) .darea,.anim .debt:not(.on) .dend{opacity:0}
.dfoot span:first-child{white-space:nowrap}

/* ask card */
.chat{gap:10px}
.chat .bub.ai{max-width:94%}
.chat .cin{margin-top:auto;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 14px;border-radius:99px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font-size:13.5px;color:var(--muted)}
.chat .cin span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.chat .cin i{margin-left:auto;flex:none;width:28px;height:28px;border-radius:50%;background:var(--solid);color:#fff;display:grid;place-items:center;font-style:normal;font-weight:800;font-size:14px}

/* budget score */
.hsc{flex-direction:row;flex-wrap:wrap;align-items:center;align-content:center;justify-content:center;gap:16px;padding:18px}
.hring{position:relative;width:84px;height:84px;flex:none}
.hring svg{width:100%;height:100%;display:block}
.hring .trk{fill:none;stroke:var(--bg2);stroke-width:7}
.hring .arc{fill:none;stroke:var(--accent);stroke-width:7;stroke-linecap:round;stroke-dasharray:169.65;stroke-dashoffset:16.97;transition:stroke-dashoffset 1.3s cubic-bezier(.2,.8,.2,1)}
.anim .c-h:not(.on) .hring .arc{stroke-dashoffset:169.65}
.hrv{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.hrv b{font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em}
.hrv span{font-size:11px;font-weight:800;color:var(--accent2);margin-top:4px;letter-spacing:.02em}
.hbars{flex:1 1 126px;max-width:300px;gap:10px}
.hbars div{display:grid;grid-template-columns:1fr auto;gap:4px 8px;align-items:baseline;font-size:13px;font-weight:700;color:var(--ink)}
.hbars em{font-style:normal;color:var(--muted);font-variant-numeric:tabular-nums;font-size:13px}
.hbars i{grid-column:1/-1;height:6px}

/* shared progress tracks (score, goals, spend card) */
.hbars u,.goal u,.sprow u{display:block;height:100%;width:var(--w);border-radius:99px;background:linear-gradient(90deg,#8fd3a7,var(--accent));transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.anim .c-h:not(.on) .hbars u,.anim .c-i:not(.on) .goal u,.anim .spcard:not(.on) .sprow u{width:0}

/* savings goals */
.goals{justify-content:center;gap:14px;padding:16px}
.goal{display:grid;grid-template-columns:40px 1fr auto;gap:6px 12px;align-items:center}
.goal+.goal{padding-top:14px;border-top:1px solid var(--line)}
.goal .gm{min-width:0}.goal .gm b{display:block;font-size:14.5px;line-height:1.3}.goal .gm small{font-size:12.5px;color:var(--muted);font-weight:600}
.goal em{font-style:normal;font-weight:800;font-size:14px;color:var(--accent2);font-variant-numeric:tabular-nums}
.goal i{grid-column:2/-1;display:block;height:7px;border-radius:99px;background:var(--bg2);overflow:hidden}

/* referral */
.refd{align-items:stretch;justify-content:center;gap:12px;padding:16px}
.tkt{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 12px;border-radius:16px;background:var(--card);border:1.5px dashed rgba(47,174,90,.45)}
.tkt small{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.tkt .code{background:none;padding:0;font-size:20px;letter-spacing:.08em}
.refev{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--muted)}
.refev b{color:var(--ink)}
.refev .av{width:28px;height:28px;font-size:12px;flex:none}
.refev em{margin-left:auto;font-style:normal;font-weight:800;font-size:12px;white-space:nowrap;padding:4px 9px;border-radius:99px;background:var(--bg2);color:var(--accent2)}
.refnote{text-align:center}

/* press and hold */
.hold{width:100%;max-width:360px;justify-self:center;display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:24px 22px;border-radius:22px;background:linear-gradient(160deg,var(--bg2),var(--card2));box-shadow:inset 0 0 0 1px var(--line)}
.hold-prev{width:100%;display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;background:var(--card);border-radius:16px;padding:11px 14px;box-shadow:0 14px 30px -14px rgba(16,40,26,.4),0 0 0 1px var(--line)}
.hold-prev b{display:block;font-size:15px;line-height:1.25}.hold-prev small{font-size:12.5px;color:var(--muted);font-weight:600}
.hold-prev em{font-style:normal;font-weight:800;font-variant-numeric:tabular-nums}
.hold-menu{width:78%;min-width:200px;background:var(--card);border-radius:14px;overflow:hidden;box-shadow:0 16px 36px -16px rgba(16,40,26,.45),0 0 0 1px var(--line);transform-origin:0 0;transition:transform .5s cubic-bezier(.2,.9,.25,1.2),opacity .3s ease}
.hold-menu div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;font-size:14.5px;font-weight:600}
.hold-menu div+div{border-top:1px solid var(--line)}
.hold-menu svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;color:var(--muted)}
.hold-menu div:first-child,.hold-menu div:first-child svg{color:var(--accent2)}
.anim .c-g:not(.on) .hold-menu{transform:scale(.9);opacity:0}

/* league */
.league{gap:6px}
.league .lhd{display:flex;justify-content:space-between;gap:12px;white-space:nowrap;margin:0 0 2px;padding:0 12px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.league i.rk{font-style:normal;width:14px;text-align:center;font-size:13px;font-weight:800;color:var(--muted);flex:none}
.league div.me i.rk{color:rgba(255,255,255,.75)}
.league div{padding:8px 12px}

/* spend card: bars line up whatever the amount */
.sprow{grid-template-columns:40px 1fr 74px}

/* streak */
.skn{display:flex;align-items:baseline;gap:10px}.skn span{font-size:18px;font-weight:700;color:var(--muted)}

/* ask section: a running thread that never jumps in height */
.chh b{white-space:nowrap}
.chh span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;font-size:12.5px}
.chatbox{min-height:0}
.chlog{flex:none;height:280px;min-height:0;overflow:hidden;justify-content:flex-end;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 64px);mask-image:linear-gradient(to bottom,transparent,#000 64px)}
.chlog .bub{flex:none}
.chlog .bub.hi{color:var(--muted)}

/* pricing */
.ph{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pbadge{font-size:12px;font-weight:800;padding:5px 11px;border-radius:99px;background:rgba(255,255,255,.18);color:#fff;white-space:nowrap}
.plan ul{margin-bottom:10px}
.plan .pcta{margin-top:auto;align-self:stretch}
.plan.plus .pcta{background:#fff;color:#174f2f;box-shadow:0 8px 20px -10px rgba(0,0,0,.45)}
.plan.plus .pcta:hover{transform:translateY(-1px)}

/* ---------- fallbacks for older Safari (no color-mix before 16.2, no aspect-ratio before 15, no inset before 14.1) ---------- */
@supports not (background:color-mix(in srgb,red 50%,blue)){
  .nav{background:var(--navfb)}
  .btn.pri{box-shadow:0 8px 24px rgba(47,174,90,.35)}
  .mc.m{background:var(--mcfb)}
  .cico{box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 3px 8px rgba(16,40,26,.18)}
}
@supports not (aspect-ratio:1/1){
  .phone,.hlphone{height:662px}
  .bonsai-stage{height:min(313px,59.7vw)}
  .lock{height:min(320px,70vw)}
  .adem .tapfx{height:0;padding-bottom:15%}
}
@supports not (aspect-ratio:1/1){@media (max-width:860px){.hlphone{height:min(640px,172vw)}}}
@supports not (inset:0){
  .app,.adem,.adem .dl,.phone .scr .shot,.dc,.hlcap,.lock .ring2,.bonsai-stage svg{top:0;right:0;bottom:0;left:0}
  .backdrop{top:0;left:0;right:0}
  .lock svg{top:28%;left:28%}
}
'''
i = s.index('</style>'); s = s[:i] + css + s[i:]
assert '—' not in s
open(f, 'w').write(s); print('site fix 2 ok')
