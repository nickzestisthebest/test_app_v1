import shutil
shutil.copy('bonsai_site.html','bonsai_site.pre_easy.html')
s=open('bonsai_site.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
LEAF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21v-8" stroke="#1f7a42" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M12 13c0-4 3-7 8-7 0 5-3 8-8 8z" fill="#2fae5a"/><path d="M12 15c0-3-2.5-5.5-7-5.5 0 4 2.5 6.5 7 6.5z" fill="#2fae5a" opacity=".55"/></svg>'
# ---------- meta ----------
i=s.index('<meta name="description"');j=s.index('>',i)+1
s=s[:i]+'<meta name="description" content="Budgeting made easy. Sprout tells you exactly what you can spend today and answers money questions in plain English.">'+s[j:]
# ---------- nav ----------
rep('<li><a href="#grow">Grow</a></li>','<li><a href="#ask">Ask Sprout</a></li>')
# ---------- hero ----------
i=s.index('<section class="hero"');j=s.index('</section>',i)+len('</section>')
hero='''<section class="hero" data-bg="--bg">
  <div class="wrap">
    <div>
      <span class="eyebrow">Budgeting, made easy</span>
      <h1 style="margin-top:14px">Money made <em>easy.</em></h1>
      <p class="lede">No spreadsheets. No math. No guilt. Sprout tells you exactly what you can spend today, and answers any money question in plain English.</p>
      <div class="ctas"><a class="btn pri" href="#join">Join the waitlist</a><a class="btn ghost" href="#ask">Try asking Sprout</a></div>
      <p class="tiny">Set up in 3 minutes. Free to start. Coming to iPhone and Android.</p>
    </div>
    <div class="phone" aria-label="Sprout app home screen">
      <div class="notch"></div>
      <div class="scr">
        <div class="app">
          <div class="top">'''+LEAF+'''Sprout<span class="chip"><svg viewBox="0 0 24 24"><path d="M12 22v-9" stroke="#2fae5a" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M12 14c0-5 3.5-9 9-9 0 6-3.5 9.5-9 9z" fill="#2fae5a"/></svg><span id="h-streak">64</span></span></div>
          <div style="font-size:11px;font-weight:800;color:#1f7a42">Good morning, Jordan</div>
          <div class="tile" style="padding:14px"><div class="k">You can spend today</div><div class="big" id="h-safe">$42.74</div><div class="sm">Rent and bills are already covered.</div><div class="mbar" style="margin-top:8px"><i id="h-bar" style="width:36%"></i></div></div>
          <div class="tile"><div class="k">Left to spend</div>
            <div class="lrow"><span>🛒 Groceries</span><b>$64 this week</b></div>
            <div class="lrow"><span>🍜 Eating out</span><b>$28 this week</b></div>
            <div class="lrow"><span>🎟️ Fun</span><b>$15 today</b></div>
          </div>
          <div class="tile ptask"><div class="pq">Can I afford $80 for dinner Friday?</div><div class="pa"><b>Yes.</b> You’ll still have $38 for fun before payday.</div></div>
          <div class="ptabs" aria-hidden="true"><span class="on"><svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/></svg>Home</span><span><svg viewBox="0 0 24 24"><path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7l12-3v3M16 13.5h1.5"/></svg>Finances</span><span class="fab"><i>+</i></span><span><svg viewBox="0 0 24 24"><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6"/></svg>Community</span></div>
        </div>
      </div>
    </div>
  </div>
</section>'''
s=s[:i]+hero+s[j:]
# ---------- marquee ----------
i=s.index('<div class="marquee"');j=s.index('</div></div>',i)+len('</div></div>')
items=['No spreadsheets','No math','No guilt','Know what you can spend','Ask anything','Bills covered first','A real debt-free date']
mq=''.join(t+'<b>·</b>' for t in items)
s=s[:i]+'<div class="marquee" aria-hidden="true"><div>'+mq+mq+'</div></div>'+s[j:]
# ---------- new sections: spend + ask (right after the marquee) ----------
k=s.index('</div></div>',s.index('<div class="marquee"'))+len('</div></div>')
new='''
<section class="sec spend" data-bg="--bg" id="spend">
  <div class="wrap">
    <div>
      <span class="eyebrow">One number a day</span>
      <h2 style="margin:12px 0 18px">Know exactly what you can spend.</h2>
      <p class="lede">Sprout does the math every morning. Bills, debt payments and savings come out first. What is left is yours to spend, split into the things you actually buy.</p>
      <ul class="ticks"><li>Today’s number updates as you spend</li><li>Groceries, eating out, gas and fun each get their own amount</li><li>Spend less today and tomorrow gets more</li></ul>
    </div>
    <div class="spcard" id="spcard">
      <div class="k">You can spend today</div>
      <div class="spbig" id="sp-big">$42.74</div>
      <div class="sm" style="color:var(--muted)">After rent, your phone bill and your card payment</div>
      <div class="sprows">
        <div class="sprow"><span class="e">🛒</span><div><b>Groceries</b><i><u style="--w:58%"></u></i></div><em>$64<small>this week</small></em></div>
        <div class="sprow"><span class="e">🍜</span><div><b>Eating out</b><i><u style="--w:35%"></u></i></div><em>$28<small>this week</small></em></div>
        <div class="sprow"><span class="e">⛽</span><div><b>Gas</b><i><u style="--w:72%"></u></i></div><em>$40<small>this week</small></em></div>
        <div class="sprow"><span class="e">🎟️</span><div><b>Fun</b><i><u style="--w:45%"></u></i></div><em>$15<small>today</small></em></div>
      </div>
      <div class="spok">✓ Rent, phone and car loan are already set aside</div>
    </div>
  </div>
</section>

<section class="sec askx" data-bg="--bg2" id="ask">
  <div class="wrap">
    <div>
      <span class="eyebrow">Ask Sprout</span>
      <h2 style="margin:12px 0 18px">Just ask.</h2>
      <p class="lede">Ask the way you would ask a friend. Sprout answers from your real numbers, in plain English. Tap a question to see.</p>
      <div class="qs" id="qs" role="list"></div>
    </div>
    <div class="chatbox" aria-live="polite">
      <div class="chh">'''+LEAF+'''<b>Ask Sprout</b><span>Answers from your numbers</span></div>
      <div class="chlog" id="chlog"></div>
      <div class="chin"><span id="chin-t">Ask anything about your money…</span><i>↑</i></div>
      <p class="chnote">Example answers for a sample account.</p>
    </div>
  </div>
</section>
'''
s=s[:k]+new+s[k:]
# ---------- copy tweaks elsewhere ----------
rep('<h3>Spend with confidence</h3><p>Every morning you get one number: what is safe to spend today, after bills and debt are covered. Spend less, and tomorrow gets more.</p>','<h3>Spend without the guesswork</h3><p>Every morning you get one number: what you can spend today, after bills and debt are covered. Spend less, and tomorrow gets more.</p>')
rep('<h2 style="margin-top:12px">All your money, finally on your side.</h2>','<h2 style="margin-top:12px">Everything else, handled.</h2>')
rep('<h2 style="font-size:clamp(40px,6vw,84px)">Plant it today.</h2>','<h2 style="font-size:clamp(40px,6vw,84px)">Budgeting shouldn’t be hard.</h2>')
rep('Get early access when Sprout launches on the App Store and Google Play.','Plant it today. Get early access when Sprout launches on the App Store and Google Play.')
rep("$('#h-tree').innerHTML=","if($('#h-tree'))$('#h-tree').innerHTML=")
# ---------- css ----------
css='''
.lrow{display:flex;align-items:center;gap:6px;font-size:12px;margin-top:6px}.lrow b{margin-left:auto;color:#1f7a42}
.ptask{display:flex;flex-direction:column;gap:6px;padding:10px 12px}
.pq{align-self:flex-end;background:#1f7a42;color:#fff;border-radius:14px 14px 4px 14px;padding:6px 10px;font-size:11.5px;font-weight:700;max-width:90%}
.pa{background:#e3f4e9;border-radius:14px 14px 14px 4px;padding:6px 10px;font-size:11.5px;max-width:92%}
.spend .wrap,.askx .wrap{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
@media (max-width:860px){.spend .wrap,.askx .wrap{grid-template-columns:1fr;gap:34px}}
.ticks{list-style:none;padding:0;margin:24px 0 0;display:flex;flex-direction:column;gap:10px;font-weight:600}
.ticks li{display:flex;gap:10px;align-items:flex-start}.ticks li::before{content:"✓";flex:none;width:24px;height:24px;border-radius:50%;background:var(--bg2);color:var(--accent2);display:grid;place-items:center;font-size:13px;font-weight:800}
.spcard{background:var(--card);border-radius:32px;padding:28px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:6px}
.spcard .k{color:var(--muted)}
.spbig{font-family:var(--f-display);font-size:clamp(56px,7vw,84px);font-weight:600;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.sprows{display:flex;flex-direction:column;gap:14px;margin-top:18px}
.sprow{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center}
.sprow .e{width:40px;height:40px;border-radius:12px;background:var(--bg2);display:grid;place-items:center;font-size:19px}
.sprow b{font-size:15.5px}.sprow i{display:block;height:7px;border-radius:99px;background:var(--bg2);overflow:hidden;margin-top:6px}
.sprow u{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#8fd3a7,var(--accent));transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.spcard.on .sprow u{width:var(--w)}
.sprow em{font-style:normal;font-family:var(--f-display);font-size:24px;font-weight:600;text-align:right;line-height:1.05}.sprow em small{display:block;font-family:var(--f-body);font-size:12px;font-weight:700;color:var(--muted)}
.spok{margin-top:16px;padding:12px 14px;border-radius:16px;background:var(--bg2);font-size:14.5px;font-weight:700;color:var(--accent2)}
.qs{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.qs button{font:inherit;font-size:15px;font-weight:700;border:0;cursor:pointer;border-radius:999px;padding:10px 16px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);transition:background .2s,color .2s,transform .15s;text-align:left}
.qs button:hover{transform:translateY(-1px)}.qs button.on{background:var(--accent2);color:#fff;box-shadow:none}
:root[data-theme="dark"] .qs button.on{color:#06140b}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .qs button.on{color:#06140b}}
.chatbox{background:var(--card);border-radius:32px;padding:20px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:12px;min-height:420px}
.chh{display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)}.chh svg{width:28px;height:28px}.chh span{margin-left:auto;font-size:13px;color:var(--muted);font-weight:600}
.chlog{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;min-height:260px}
.chlog .bub{max-width:88%;font-size:16px}
.chlog .bub.ai b{color:var(--accent2)}
.chin{display:flex;align-items:center;gap:10px;border-radius:999px;padding:10px 10px 10px 18px;box-shadow:inset 0 0 0 1px var(--line);color:var(--muted);font-size:15px}
.chin i{margin-left:auto;width:34px;height:34px;border-radius:50%;background:var(--accent2);color:#fff;display:grid;place-items:center;font-style:normal;font-weight:800}
.chnote{margin:0;font-size:12.5px;color:var(--muted);text-align:center}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
# ---------- js ----------
js='''
// ----- spend card + ask demo -----
const spc=$('#spcard');const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){spc.classList.add('on');countTo($('#sp-big'),42.74,1200,v=>money(v));io2.disconnect()}}),{threshold:.35});io2.observe(spc);
const QA=[['How much can I spend today?','<b>$42.74.</b> That’s $27 for basics like groceries and gas, and $15 for fun. Rent and your phone bill are already covered.'],
 ['Can I afford $80 for dinner Friday?','<b>Yes.</b> You’ll have $118 for fun before payday, so $80 still leaves $38.'],
 ['How much will I have on payday?','About <b>$640</b> in checking on Oct 16, after rent, your phone bill and your card payment.'],
 ['How much do I need to save for a $1,200 trip in March?','<b>$80 a paycheck</b> gets you there by March 6. Want me to set that aside for you?'],
 ['How much can I spend on groceries this week?','<b>$64 left</b> of your $110 grocery budget this week. That’s about $16 a day.'],
 ['When will I be debt-free?','<b>February 2027</b> at your current pace. Adding $50 a month moves it to December 2026.']];
const qs=$('#qs'),log=$('#chlog');let qi=0,qt=null,auto=true;
qs.innerHTML=QA.map((q,i)=>'<button type="button" role="listitem" data-q="'+i+'">'+q[0]+'</button>').join('');
function ask(i){qi=i;$$('#qs button').forEach((b,j)=>b.classList.toggle('on',j===i));clearTimeout(qt);
  log.innerHTML='<div class="bub me">'+QA[i][0]+'</div><div class="bub ai"><span class="typing"><i></i><i></i><i></i></span></div>';
  qt=setTimeout(()=>{log.lastChild.innerHTML=QA[i][1];if(auto)qt=setTimeout(()=>ask((qi+1)%QA.length),5200)},RM?0:900)}
qs.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;auto=false;ask(+b.dataset.q)});
const io3=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){ask(0);io3.disconnect()}}),{threshold:.3});io3.observe($('#ask'));
'''
k=s.rindex('})();');s=s[:k]+js+s[k:]
open('bonsai_site.html','w').write(s)
print('ok')
