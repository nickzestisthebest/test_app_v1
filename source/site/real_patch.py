import re
s=open('bonsai_site.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
def shot(n,alt,eager=False):return '<img class="shot" src="img/'+n+'.jpg" alt="'+alt+'"'+('' if eager else ' loading="lazy"')+' width="600" height="1298">'
# ---------- hero phone: real Home screen ----------
i=s.index('<div class="phone" aria-label="Sprout app home screen">');j=s.index('</section>',i)
s=s[:i]+'<div class="phone" aria-label="Sprout app home screen"><div class="notch"></div><div class="scr">'+shot('home','Sprout Home screen: safe to spend today, green day streak and the growing plant',True)+'</div></div>\n  </div>\n'+s[j:]
# ---------- how it works: real screens ----------
i=s.index('<div class="phone" aria-label="Sprout setup on a phone">');j=s.index('</section>',i)
story='''<div class="phone" aria-label="Sprout screens">
      <div class="notch"></div>
      <div class="scr">
        <div class="app shotapp" data-screen="0">'''+shot('accts','Connected accounts, read-only')+'''</div>
        <div class="app shotapp" data-screen="1" style="opacity:0;transform:translateY(16px)">'''+shot('finances','Finances tab with net worth, checking and paycheck')+'''</div>
        <div class="app shotapp" data-screen="2" style="opacity:0;transform:translateY(16px)">'''+shot('left','Safe to spend today and left to spend this month')+'''</div>
      </div>
    </div>
  </div>
'''
s=s[:i]+story+s[j:]
# remove the old animated number hooks for the story screen (now a screenshot)
s=s.replace("if(st===2){countTo($('#s-safe'),42.74,900,v=>money(v));$('#s-bar').style.width='36%'}","")
s=s.replace("$('#s-safe').textContent='$42.74';$('#s-bar').style.width='36%';","")
s=s.replace("countTo($('#h-safe'),42.74,1400,v=>money(v));","")
# ---------- spend card: same names and numbers as the app ----------
i=s.index('<div class="spcard" id="spcard">');j=s.index('</section>',i)
spc='''<div class="spcard" id="spcard">
      <div class="k">Safe to spend today</div>
      <div class="spbig" id="sp-big">$27.49</div>
      <div class="sm" style="color:var(--muted)">Basics $14 · Fun $14 · your phone bill is already covered</div>
      <div class="k" style="margin-top:20px">Left to spend this month</div>
      <div class="sprows" style="margin-top:8px">
        <div class="sprow"><span class="e">🛒</span><div><b>Groceries</b><i><u style="--w:60%"></u></i></div><em>$181<small>of $300</small></em></div>
        <div class="sprow"><span class="e">🍜</span><div><b>Dining and coffee</b><i><u style="--w:67%"></u></i></div><em>$80<small>of $120</small></em></div>
        <div class="sprow"><span class="e">⛽</span><div><b>Gas and transit</b><i><u style="--w:27%"></u></i></div><em>$32<small>of $120</small></em></div>
      </div>
      <div class="spok">✓ Bills, debt payments and savings come out first</div>
    </div>
  </div>
'''
s=s[:i]+spc+s[j:]
s=s.replace("countTo($('#sp-big'),42.74,1200,v=>money(v))","countTo($('#sp-big'),27.49,1200,v=>money(v))")
rep('<ul class="ticks"><li>Today’s number updates as you spend</li><li>Groceries, eating out, gas and fun each get their own amount</li><li>Spend less today and tomorrow gets more</li></ul>',
    '<ul class="ticks"><li>Today’s number updates as you spend</li><li>Groceries, dining, gas and more each show what is left this month</li><li>Spend less today and tomorrow gets more</li></ul>')
# ---------- ask: answers match the sample account in the screenshots; bubbles styled like the app ----------
i=s.index('const QA=[');j=s.index('];',i)+2
s=s[:i]+'''const QA=[['How much can I spend today?','<b>$27.49 today.</b> That is $14 for basics like groceries and gas, and $14 for fun. Your phone bill due today is already covered.'],
 ['Can I afford $80 for dinner Friday?','<b>It is tight.</b> You will have about $70 for fun before payday on Oct 17, so $80 goes about $10 over. Try $60, or plan it for after payday.'],
 ['How much will I have on payday?','About <b>$11,100</b> on Oct 17. Checking dips to about $8,000 the day before, then your $3,100 paycheck lands.'],
 ['How much should I save for a $1,200 trip?','<b>$100 a paycheck</b> gets you there in 12 paychecks, about six months. Want me to set that aside?'],
 ['How much can I spend on groceries this week?','<b>About $45.</b> You have $181 left of your $300 grocery budget this month, with about four weeks to go.'],
 ['When will I be debt-free?','<b>February 2027</b> at your current pace. You have paid off 58% so far.']];'''+s[j:]
s=s.replace('.chlog .bub.ai b{color:var(--accent2)}','.chlog .bub.ai{background:none;padding:2px 2px 0;max-width:100%}.chlog .bub.ai b{color:var(--ink)}.chlog .bub.me{background:var(--accent);border-radius:20px;border-bottom-right-radius:6px}')
# ---------- tour gallery ----------
TOUR=[('home','Home','Your number for today, your streak and your plant.'),
      ('left','Safe to spend','What you can spend today, and what is left this month.'),
      ('plant','Your plant','Grows with every dollar you pay off or save.'),
      ('ask','Ask Sprout','Ask anything. Answers come from your numbers.'),
      ('finances','Finances','Net worth, checking, paycheck and debt in one place.'),
      ('networth','Net worth','See where you have been and where you are headed.'),
      ('tx','Transactions','Every purchase, sorted into simple categories.'),
      ('budgets','Budgets','Set a limit and Sprout keeps track for you.'),
      ('subs','Subscriptions','Find what you forgot about. Cancel in a tap.'),
      ('calendar','Bill calendar','Every bill and payday, never a surprise.'),
      ('credit','Credit score','Watch it climb and see what moved it.'),
      ('streak','Green day streak','Stay under your number and keep it going.'),
      ('community','Community','Ask for help, share wins, cheer people on.'),
      ('chat','Messages','Find an accountability buddy.'),
      ('leagues','Leagues','Weekly leagues ranked by green days, not dollars.')]
cards=''.join('<figure class="tcard">'+'<div class="phone sm"><div class="notch"></div><div class="scr">'+shot(n,t+' screen')+'</div></div><figcaption><b>'+t+'</b><span>'+d+'</span></figcaption></figure>' for n,t,d in TOUR)
tour='''
<section class="sec tour" data-bg="--bg" id="tour">
  <div class="wrap">
    <div class="center"><span class="eyebrow">Take a look inside</span><h2 style="margin-top:12px">Simple on the outside. Smart underneath.</h2>
      <p class="lede" style="margin-top:16px">Real screens from the Sprout app. Swipe through.</p></div>
  </div>
  <div class="trail" id="trail" tabindex="0" aria-label="App screens, scroll sideways">'''+cards+'''</div>
  <div class="wrap tnav"><button type="button" class="tbtn" data-t="-1" aria-label="Previous screens">‹</button><button type="button" class="tbtn" data-t="1" aria-label="Next screens">›</button></div>
</section>
'''
k=s.index('<section class="story" id="how"')
s=s[:k]+tour+'\n'+s[k:]
rep('<li><a href="#ask">Ask Sprout</a></li>','<li><a href="#tour">Tour</a></li><li><a href="#ask">Ask Sprout</a></li>')
rep('<li><a href="#features">Features</a></li>','')
# ---------- css + js ----------
css='''
.phone .scr .shot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.shotapp{padding:0!important}
.phone .notch{z-index:4}
.trail{display:flex;gap:28px;overflow-x:auto;scroll-snap-type:x mandatory;padding:46px max(24px,calc((100vw - 1160px)/2 + 24px)) 20px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.trail::-webkit-scrollbar{display:none}
.tcard{flex:none;scroll-snap-align:center;margin:0;display:flex;flex-direction:column;align-items:center;gap:16px;width:240px}
.phone.sm{width:240px;border-radius:38px;padding:9px}.phone.sm .scr{border-radius:30px}.phone.sm .notch{width:74px;height:20px;top:9px}
.tcard figcaption{text-align:center;display:flex;flex-direction:column;gap:4px}.tcard b{font-size:18px}.tcard span{font-size:14.5px;color:var(--muted);line-height:1.4}
.tnav{display:flex;justify-content:center;gap:12px;margin-top:8px}
.tbtn{width:46px;height:46px;border-radius:50%;border:0;background:var(--card);box-shadow:var(--shadow);font-size:26px;line-height:1;cursor:pointer;color:var(--ink)}
@media (max-width:600px){.tcard{width:210px}.phone.sm{width:210px}.trail{gap:18px}}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
js='''
// ----- tour arrows -----
document.querySelectorAll('.tbtn').forEach(b=>b.addEventListener('click',()=>{const t=document.getElementById('trail');t.scrollBy({left:(+b.dataset.t)*Math.min(t.clientWidth*.8,804),behavior:RM?'auto':'smooth'})}));
'''
k=s.rindex('})();');s=s[:k]+js+s[k:]
open('bonsai_site.html','w').write(s)
print('ok', s.count('class="shot"'))
