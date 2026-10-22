import shutil
shutil.copy('bonsai_site.html','bonsai_site.bak.html')
s=open('bonsai_site.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
# ---- tree: bonsai -> growing sprout (matches the app) ----
i=s.index('// ----- bonsai drawings -----');j=s.index("const bonsai=st=>bonsaiSVG(st);")
s=s[:i]+'// ----- growing sprout (same drawing as the app) -----\n'+open('../sprout/leaf_gen.js').read()+'\n'+s[j:]
rep("const bonsai=st=>bonsaiSVG(st);","const bonsai=st=>leafPlant(st).replace('aria-label=\"Your plant\"','aria-label=\"Sprout plant, stage '+(st+1)+' of 5\"');")
rep('grows a bonsai as you stick to your budget','grows a plant as you stick to your budget')
rep('Stay under it, and watch your bonsai grow.','Stay under it, and watch your sprout grow.')
rep('Green-day streaks and your bonsai','Green-day streaks and your growing sprout')
rep('Every dollar paid off grows your tree.','Every dollar paid off helps it grow.')
rep('sticky stages pin a phone or a bonsai','sticky stages pin a phone or the plant')
rep('.bonsai-stage{width:min(420px,80vw);aspect-ratio:300/220;','.bonsai-stage{width:min(420px,80vw);aspect-ratio:300/224;')
# ---- hero phone: the new Home screen with the tab bar ----
rep('''          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="tile"><div class="k">Checking</div><b style="font-size:16px">$12,480</b></div>
            <div class="tile"><div class="k">Next payday</div><b style="font-size:16px">Fri, Oct 16</b></div>
          </div>''','''          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="tile"><div class="k">Green streak</div><b style="font-size:16px">64 days</b></div>
            <div class="tile"><div class="k">Today’s plan</div><b style="font-size:16px">1 of 3 done</b></div>
          </div>
          <div class="ptabs" aria-hidden="true"><span class="on"><svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/></svg>Home</span><span><svg viewBox="0 0 24 24"><path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7l12-3v3M16 13.5h1.5"/></svg>Finances</span><span class="fab"><i>+</i></span><span><svg viewBox="0 0 24 24"><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6"/></svg>Community</span></div>''')
css='''.ptabs{position:absolute;left:8px;right:8px;bottom:8px;display:flex;justify-content:space-around;align-items:center;background:rgba(255,255,255,.92);border-radius:22px;padding:7px 4px 6px;box-shadow:0 -1px 0 rgba(16,40,26,.06),0 6px 18px rgba(16,40,26,.08);font-size:9.5px;font-weight:700;color:#56705f}
.ptabs span{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:52px}
.ptabs svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ptabs .on{color:#1f7a42}
.ptabs .fab i{width:34px;height:34px;border-radius:50%;background:#2fae5a;color:#fff;display:grid;place-items:center;font-style:normal;font-size:22px;font-weight:500;margin-top:-16px;box-shadow:0 4px 12px rgba(47,174,90,.4)}
.c-g{grid-column:span 6;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center}
@media (max-width:900px){.c-g{grid-template-columns:1fr}}
.holdm{background:var(--card2);border-radius:20px;padding:8px;box-shadow:inset 0 0 0 1px var(--line);display:flex;flex-direction:column;max-width:340px;width:100%;justify-self:center}
.holdm .h{padding:8px 10px 6px;font-size:13px;color:var(--muted);font-weight:700}
.holdm .h b{display:block;color:var(--ink);font-size:16px}
.holdm .i{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;font-size:15px;font-weight:600}
.holdm .i::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--accent)}
.holdm .i:first-of-type{background:var(--bg2)}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
# ---- features: Finances tab + press and hold ----
rep('<span class="eyebrow">Everything in one place</span>','<span class="eyebrow">Your Finances tab</span>')
rep('''      <div class="card c-f" style=''','''      <div class="card c-g"><div><h3>Press and hold for shortcuts.</h3><p style="margin-top:10px">Hold a tab, a bill, a purchase or a post and you get only the 3 to 5 actions you'd most likely take next. Mark a bill paid, log your usual coffee or jump to your budgets.</p></div>
        <div class="holdm" aria-label="Example press-and-hold menu for a bill"><div class="h"><b>Phone</b>$65.00 due Oct 12</div><div class="i">Mark paid</div><div class="i">Can this wait?</div><div class="i">See all bills</div></div></div>
      <div class="card c-f" style=''')
open('bonsai_site.html','w').write(s)
print('ok')
