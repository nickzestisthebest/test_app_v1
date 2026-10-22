s=open('bonsai_site.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
sec='''
<section class="sec snap" data-bg="--bg2" id="snap">
  <div class="wrap">
    <div>
      <span class="eyebrow">Screenshot logging</span>
      <h2 style="margin:12px 0 18px">Snap it. Done.</h2>
      <p class="lede">Paid a friend on Cash App? Grabbed tacos? Just send Sprout the screenshot. It reads the amount, the date and who you paid, sorts it for you, and you are back to your day.</p>
      <div class="works"><span>Receipts</span><span>Cash App</span><span>Venmo</span><span>Zelle</span><span>PayPal</span><span>Bank and card apps</span></div>
      <div class="mrgbox">
        <h3>Never counted twice.</h3>
        <p>Your Cash App says “To Alex R.” Your bank says “CASH APP*ALEX R.” Same $25, two different names. Sprout knows they are the same money and counts it once, automatically. Nothing for you to sort out.</p>
        <div class="mrg" aria-hidden="true">
          <div class="mc a"><i>C</i><div><b>To Alex R.</b><small>Cash App screenshot</small></div><em>$25.00</em></div>
          <div class="mc b"><i>▣</i><div><b>CASH APP*ALEX R</b><small>Checking, a day later</small></div><em>$25.00</em></div>
          <div class="mc m"><i>✓</i><div><b>Alex R. · Concert tickets</b><small>Counted once · matched to Checking</small></div><em>$25.00</em></div>
        </div>
        <ul class="ticks"><li>Tips and fees too: a $31.40 receipt that posts as $37.05 is still one dinner</li><li>Moving money into Cash App or Venmo is not counted as spending</li><li>Got one wrong? One tap on “Not the same” splits it</li></ul>
      </div>
    </div>
    <div class="phone snapphone" aria-hidden="true"><div class="notch"></div><div class="scr"><div class="adem" data-demo="scan" data-loop="1" role="img" aria-label="Animated demo: scanning a Cash App screenshot, adding it, and the bank copy being matched automatically"></div></div></div>
  </div>
</section>
'''
k=s.index('<section class="sec askx"')
s=s[:k]+sec+'\n'+s[k:]
rep('<li><a href="#ask">Ask Sprout</a></li>','<li><a href="#snap">Screenshots</a></li><li><a href="#ask">Ask Sprout</a></li>')
css='''
.snap .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
@media (max-width:860px){.snap .wrap{grid-template-columns:1fr;gap:34px}.snapphone{margin:0 auto}}
.works{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.works span{font-size:14px;font-weight:700;color:var(--accent2);background:var(--card);border-radius:99px;padding:7px 13px;box-shadow:inset 0 0 0 1px var(--line)}
.mrgbox{margin-top:30px;background:var(--card);border-radius:28px;padding:24px;box-shadow:var(--shadow)}
.mrgbox h3{font-size:26px;margin-bottom:8px}.mrgbox>p{margin:0;color:var(--muted);font-size:16px;line-height:1.5}
.mrg{position:relative;height:150px;margin:20px 0 6px}
.mc{position:absolute;left:0;right:0;display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;background:var(--card2);border-radius:16px;padding:11px 14px;box-shadow:inset 0 0 0 1px var(--line);font-size:14.5px}
.mc i{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-style:normal;font-weight:800;background:var(--bg2);color:var(--accent2)}
.mc b{display:block}.mc small{color:var(--muted);font-weight:600;font-size:12.5px}.mc em{font-style:normal;font-weight:800}
.mc.a{top:0}.mc.b{top:82px}.mc.m{top:41px;opacity:0;background:color-mix(in srgb,var(--accent) 12%,var(--card));box-shadow:inset 0 0 0 1.5px var(--accent)}.mc.m i{background:var(--accent);color:#fff}
.snap.on .mc.a{animation:mca 7s cubic-bezier(.6,0,.3,1) infinite}.snap.on .mc.b{animation:mcb 7s cubic-bezier(.6,0,.3,1) infinite}.snap.on .mc.m{animation:mcm 7s cubic-bezier(.6,0,.3,1) infinite}
@keyframes mca{0%,28%{transform:none;opacity:1}46%{transform:translateY(41px) scale(.97);opacity:0}86%{transform:translateY(41px);opacity:0}100%{transform:none;opacity:1}}
@keyframes mcb{0%,28%{transform:none;opacity:1}46%{transform:translateY(-41px) scale(.97);opacity:0}86%{transform:translateY(-41px);opacity:0}100%{transform:none;opacity:1}}
@keyframes mcm{0%,38%{opacity:0;transform:scale(.96)}50%,84%{opacity:1;transform:none}96%,100%{opacity:0;transform:scale(.96)}}
.snapphone{width:300px;justify-self:center}
@media (prefers-reduced-motion:reduce){.snap.on .mc.a,.snap.on .mc.b{animation:none}.snap .mc.m{opacity:0}}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
js='''
// ----- snap section: start the merge animation when visible -----
{const sn=document.getElementById('snap');if(sn){const so=new IntersectionObserver(es=>es.forEach(e=>sn.classList.toggle('on',e.isIntersecting)),{threshold:.2});so.observe(sn)}}
'''
k=s.rindex('})();');s=s[:k]+js+s[k:]
open('bonsai_site.html','w').write(s);print('ok')
