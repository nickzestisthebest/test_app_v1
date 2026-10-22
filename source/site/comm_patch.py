s=open('bonsai_site.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
POSTS=[('lena.l','#d0604d','Question','1h','I’m 24 with $8k on two credit cards and honestly embarrassed to even say it. Where do I start?',
        [('maya.pays','#c9892b','No shame here. I started at $11k. List both cards, pay the minimum on each, and put anything extra on the one with the higher interest rate.'),
         ('dee.dollars','#5b7fb8','Small wins first. Try staying under your daily number for one week and see how it feels.')],48),
       ('sam.steady','#3f9f8f','Question','3h','Is it normal to feel anxious every time I open my bank app?',
        [('priya.saves','#9b6fb0','Totally normal. Checking a little every morning made it way less scary for me. The surprises stopped.')],61),
       ('rosa.r','#7aa93a','Question','5h','How do you handle friends who always want to go out when you’re on a budget?',
        [('omar.budgets','#2f8f5a','I suggest the plan first. Potluck, a walk, game night. The people who matter don’t mind.')],37),
       ('jon.grows','#5b7fb8','Win','1d','Paid off my car loan 7 months early. I almost quit twice. Thank you all for the pep talks. 🌱',[],212)]
def av(n,c):return '<span class="av" style="background:'+c+'">'+n[0].upper()+'</span>'
cards=''
for who,col,tag,t,txt,reps,ch in POSTS:
    cards+='<article class="cpost"><div class="cph">'+av(who,col)+'<div><b>'+who+'</b><small>'+t+' ago</small></div><span class="ctag'+(' win' if tag=='Win' else '')+'">'+tag+'</span></div><p>'+txt+'</p>'
    cards+=''.join('<div class="crep">'+av(r[0],r[1])+'<div><b>'+r[0]+'</b><p>'+r[2]+'</p></div></div>' for r in reps)
    cards+='<div class="cfoot"><span>🌱 '+str(ch)+' cheers</span>'+(('<span>'+str(len(reps))+' repl'+('y' if len(reps)==1 else 'ies')+'</span>') if reps else '')+'</div></article>'
sec='''
<section class="sec together" data-bg="--bg3" id="community">
  <div class="wrap">
    <div class="center"><span class="eyebrow">Community</span><h2 style="margin-top:12px">You don’t have to do this alone.</h2>
      <p class="lede" style="margin-top:16px">Money is stressful, and almost everyone is figuring it out as they go. Ask anything, share a win, or just read how others got through it. No judgment, and no dollar amounts unless you choose to share them.</p></div>
    <div class="cfeed">'''+cards+'''</div>
    <div class="cguide"><span>💬 Ask anything, no question is too basic</span><span>🤝 Kind by default, moderated</span><span>🔒 Never share account numbers</span><span>🌱 Members share experiences, not professional advice</span></div>
    <p class="cnote">Example posts shown for illustration. Community tips come from members sharing their own experience and are not financial, legal or tax advice.</p>
  </div>
</section>
'''
k=s.index('<section class="sec" data-bg="--bg" id="features">')
s=s[:k]+sec+'\n'+s[k:]
rep('<li><a href="#features">Features</a></li>','<li><a href="#community">Community</a></li><li><a href="#features">Features</a></li>')
css='''
.cfeed{columns:2 340px;column-gap:18px;margin-top:46px}
.cpost{break-inside:avoid;background:var(--card);border-radius:24px;padding:20px;box-shadow:var(--shadow);margin:0 0 18px;display:flex;flex-direction:column;gap:12px}
.cph{display:flex;align-items:center;gap:10px}.cph>div{display:flex;flex-direction:column;line-height:1.25}.cph small{color:var(--muted);font-size:13px}
.cpost .av{width:34px;height:34px;font-size:14px;flex:none}
.ctag{margin-left:auto;font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px;background:var(--bg2);color:var(--accent2)}.ctag.win{background:#fbecc9;color:#8a5a12}
.cpost>p{margin:0;font-size:17px;line-height:1.5}
.crep{display:flex;gap:10px;padding:12px;border-radius:16px;background:var(--card2);box-shadow:inset 0 0 0 1px var(--line)}.crep .av{width:28px;height:28px;font-size:12px}
.crep b{font-size:14px}.crep p{margin:2px 0 0;font-size:15px;line-height:1.45;color:var(--muted)}
.cfoot{display:flex;gap:16px;font-size:13.5px;font-weight:700;color:var(--muted)}
.cguide{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:10px}
.cguide span{background:var(--card);border-radius:99px;padding:9px 16px;font-size:14px;font-weight:700;box-shadow:inset 0 0 0 1px var(--line)}
.cnote{text-align:center;font-size:13px;color:var(--muted);margin:18px auto 0;max-width:62ch}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
open('bonsai_site.html','w').write(s)
print('ok')
