import re
f='bonsai_site.html';s=open(f).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)

# ---------- 1) Spending donut: bigger, centered total, clean legend with percents ----------
rep('''<div class="demo cats" id="cats">
          <svg viewBox="0 0 42 42" aria-label="Spending by category"><circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--bg2)" stroke-width="6"/></svg>
          <div class="legend" id="cats-legend"></div>
        </div>''','''<div class="demo cats" id="cats">
          <div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="Spending by category this month: Groceries $250, Getting around $176, Dining $109, Going out $62, Shopping $38"></svg><div class="dc"><b id="cats-tot">$635</b><span>this month</span></div></div>
          <div class="legend" id="cats-legend"></div>
        </div>''')
old_cats=re.search(r"const CATS=\[.*?\n\$\('#cats svg'\)\.insertAdjacentHTML\('beforeend',ring\);\$\('#cats-legend'\)\.innerHTML=.*?\.join\(''\);",s,re.S).group(0)
new_cats='''const CATS=[['Groceries',250,'#2f9e58'],['Getting around',176,'#3a8cab'],['Dining',109,'#2a9a84'],['Going out',62,'#dd9f2b'],['Shopping',38,'#8cc152']];
const tot=CATS.reduce((a,c)=>a+c[1],0);{const R=46,C=2*Math.PI*R,gap=2.2;let acc=0,ring='<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="var(--bg2)" stroke-width="16"/>';
CATS.forEach(c=>{const len=c[1]/tot*C;ring+='<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="'+c[2]+'" stroke-width="16" stroke-dasharray="'+Math.max(0,len-gap).toFixed(2)+' '+(C-len+gap).toFixed(2)+'" stroke-dashoffset="'+(-acc).toFixed(2)+'" transform="rotate(-90 60 60)"/>';acc+=len});
$('#cats svg').innerHTML=ring;$('#cats-tot').textContent=money(tot,0);
$('#cats-legend').innerHTML=CATS.map(c=>'<span><i class="dot" style="background:'+c[2]+'"></i><em>'+c[0]+'</em><small>'+Math.round(c[1]/tot*100)+'%</small><b>'+money(c[1],0)+'</b></span>').join('')}'''
s=s.replace(old_cats,new_cats)
rep("""  if(t.id==='cats')t.querySelectorAll('.ring').forEach((r,i)=>setTimeout(()=>r.setAttribute('stroke-dasharray',r.dataset.d+' '+(100-r.dataset.d)),RM?0:i*140));""","""  if(t.id==='cats')t.classList.add('on');""")

# ---------- 2) Debt chart: true proportions, area fill, gridlines, month labels ----------
debt_old=re.search(r'<div class="demo"><svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-label="Debt falling over time">.*?</div></div>',s,re.S).group(0)
# balances Oct to Feb (matches the app demo: $6,100 now, debt-free Feb 2027)
pts=[(0,6100),(1,4950),(2,3650),(3,2000),(4,0)]
X=lambda i:40+i*65;Y=lambda v:16+(6100-v)/6100*96
P=[(X(i),Y(v)) for i,v in pts]
# Catmull-Rom to Bezier: one smooth, steadily falling curve
d='M%.1f %.1f'%P[0]
for k in range(len(P)-1):
    p0=P[k-1] if k>0 else P[k];p1=P[k];p2=P[k+1];p3=P[k+2] if k+2<len(P) else P[k+1]
    c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6);c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
    d+=' C%.1f %.1f %.1f %.1f %.1f %.1f'%(c1+c2+p2)
area=d+' L%.1f 112 L%.1f 112 Z'%(X(4),X(0))
grid=''.join('<line x1="40" x2="300" y1="%.1f" y2="%.1f"/>'%(Y(v),Y(v)) for v in (6100,3050,0))
ylab=''.join('<text x="30" y="%.1f" text-anchor="end">%s</text>'%(Y(v)+3.5,t) for v,t in ((6100,'$6k'),(3050,'$3k'),(0,'$0')))
xlab=''.join('<text x="%.1f" y="130" text-anchor="middle">%s</text>'%(X(i),m) for i,m in enumerate(['Oct','Nov','Dec','Jan','Feb']))
debt_new='''<div class="demo dchart"><svg viewBox="0 0 312 136" role="img" aria-label="Debt falling from $6,100 in October to $0 in February 2027">
<defs><linearGradient id="dgf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fae5a" stop-opacity=".28"/><stop offset="1" stop-color="#2fae5a" stop-opacity="0"/></linearGradient></defs>
<g class="dgrid">'''+grid+'''</g><g class="dlab">'''+ylab+xlab+'''</g>
<path class="darea" d="'''+area+'''" fill="url(#dgf)"/>
<path class="line" d="'''+d+'''" pathLength="1" fill="none" stroke="#2fae5a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle class="dstart" cx="%.1f" cy="%.1f" r="4.5"/><circle class="dend" cx="%.1f" cy="%.1f" r="6"/></svg>
<div class="dfoot"><span><b>$6,100</b> today</span><span class="dpill">Debt-free Feb 2027</span></div></div>'''%(X(0),Y(6100),X(4),Y(0))
s=s.replace(debt_old,debt_new)
rep('<p>Extra money goes to your highest rate first. Watch the line fall.</p>','<p>Extra money goes to your highest rate first, so the line keeps falling faster.</p>')

# ---------- 3) Bills calendar: month title, weekday row, legend ----------
rep('<div class="demo"><div class="cal" id="cal"></div></div>','<div class="demo calw"><div class="calh"><b>October</b><span><i class="lg b"></i>Bill<i class="lg p"></i>Payday</span></div><div class="calwk"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div class="cal" id="cal"></div></div>')

css='''
/* ---------- charts, redone ---------- */
.cats{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;padding:18px}
.donut{position:relative;width:148px;height:148px}
.donut svg{width:100%;height:100%;display:block;transform-origin:50% 50%}
.cats.on .donut svg{animation:donutIn 1s cubic-bezier(.2,.8,.2,1) both}
@keyframes donutIn{from{transform:rotate(-120deg) scale(.86);opacity:0}to{transform:none;opacity:1}}
.dc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
.dc b{font-family:var(--f-display);font-size:26px;font-weight:600;letter-spacing:-.01em}
.dc span{font-size:11.5px;color:var(--muted);font-weight:700;margin-top:2px}
.legend{gap:9px;font-size:14px}
.legend span{display:grid;grid-template-columns:10px 1fr auto auto;gap:9px;align-items:center}
.legend em{font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.legend small{font-size:12px;color:var(--muted);font-weight:700;min-width:30px;text-align:right}
.legend b{min-width:42px;text-align:right;font-variant-numeric:tabular-nums}
.dot{width:10px;height:10px;border-radius:3px}
@media (max-width:420px){.cats{grid-template-columns:1fr;justify-items:center}.legend{width:100%}}
.dchart{padding:14px 14px 12px}
.dchart svg{width:100%;height:auto;display:block;overflow:visible}
.dgrid line{stroke:var(--line);stroke-width:1;stroke-dasharray:3 4}
.dlab text{font-family:var(--f-body);font-size:10.5px;font-weight:700;fill:var(--muted)}
.dchart .line{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1)}
.debt.on .dchart .line{stroke-dashoffset:0}
.darea{opacity:0;transition:opacity 1s ease .9s}.debt.on .darea{opacity:1}
.dstart{fill:#fff;stroke:#2fae5a;stroke-width:2.5}
.dend{fill:#1f7a42;stroke:#fff;stroke-width:2.5;opacity:0;transition:opacity .4s ease 1.6s}.debt.on .dend{opacity:1}
.dfoot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px;font-size:13.5px;color:var(--muted)}
.dfoot b{color:var(--ink);font-variant-numeric:tabular-nums}
.dpill{background:var(--accent2);color:#fff;font-weight:800;font-size:12.5px;padding:5px 11px;border-radius:99px;white-space:nowrap}
.calw{padding:14px}
.calh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px}
.calh b{font-size:15px}.calh span{display:flex;align-items:center;gap:6px;color:var(--muted);font-weight:700;font-size:12px}
.lg{width:7px;height:7px;border-radius:50%;display:inline-block;margin-left:6px}.lg.b{background:var(--amber)}.lg.p{background:var(--accent)}
.calwk{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px;text-align:center;font-size:10.5px;font-weight:800;color:var(--muted);letter-spacing:.04em}
.cal span{border-radius:9px;font-variant-numeric:tabular-nums}
.cal span.t{box-shadow:0 4px 10px -4px rgba(31,122,66,.6)}
/* ---------- smoother in every browser ---------- */
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
.blob{filter:none!important;will-change:auto!important;background:radial-gradient(closest-side,var(--mint),rgba(168,230,193,0) 100%)!important;opacity:.7}
.blob.b2{opacity:.5}.blob.b3{opacity:.45}
@supports (height:100svh){.story .stick,.grow .stick{height:calc(100svh - 60px)}}
@media (prefers-reduced-motion:reduce){.blob{animation:none!important}.cats.on .donut svg{animation:none}}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]

# ---------- scroll engine: no style reads per frame, only update what changed ----------
rep("const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();",
    "let BGC={};const cssv=n=>(n in BGC)?BGC[n]:(BGC[n]=getComputedStyle(document.documentElement).getPropertyValue(n).trim());")
rep("matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{lastBg='';onScroll()});",
    "matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{BGC={};lastBg='';onScroll()});")
rep("new MutationObserver(()=>{lastBg='';onScroll()})","new MutationObserver(()=>{BGC={};lastBg='';onScroll()})")
rep("function setGrow(p){const score=Math.round(Math.pow(p,1.6)*18500);",
    "let lastScore=-1;function setGrow(p){const score=Math.round(Math.pow(p,1.6)*18500/25)*25;if(score===lastScore)return;lastScore=score;")
# pause the background drift while the tab is hidden (saves battery, avoids catch-up jumps)
rep("let tick=false;addEventListener('scroll'","document.addEventListener('visibilitychange',()=>{document.querySelectorAll('.blob').forEach(b=>b.style.animationPlayState=document.hidden?'paused':'running')});\nlet tick=false;addEventListener('scroll'")
rep('''<svg viewBox="0 0 24 24"><path d="M12 22v-9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M12 14c0-5 3.5-9 9-9 0 6-3.5 9.5-9 9z" fill="#fff"/></svg>''','''<svg viewBox="0 0 24 24"><path d="M12 22v-9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M12 16c0-3.5-2.5-6.5-8-6.5 0 4.5 3 7 8 6.5z" fill="#a6e2bb"/><path d="M12 14c0-5 3.5-9 9-9 0 6-3.5 9.5-9 9z" fill="#e6f6ec"/></svg>''')
assert '—' not in s
open(f,'w').write(s);print('site fix ok')
