import re
f='bonsai_site.html';s=open(f).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a));s=s.replace(a,b)
I={'groc':['#74d497','#2f9e58','M4 9.5h16l-1.7 8.7a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L4 9.5zM8.5 9.5 12 4l3.5 5.5M9.5 13.5v2.5M14.5 13.5v2.5'],
 'dine':['#7fd6c2','#2a9a84','M5 9.5h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5zM16 10.5h1.4a2.4 2.4 0 0 1 0 4.8H16M8.5 3.5c-.8 1 .8 1.8 0 3M12 3.5c-.8 1 .8 1.8 0 3'],
 'gas':['#86c9de','#3a8cab','M5 17v-4.5L7 7.5h10l2 5V17M4.5 17h15M7 17v2M17 17v2M7.5 13.5h.01M16.5 13.5h.01M6.2 11h11.6']}
ic=lambda k:'<span class="cico" style="--ca:%s;--cb:%s" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="%s"/></svg></span>'%tuple(I[k])
rep('<span class="e">🛒</span>',ic('groc'));rep('<span class="e">🍜</span>',ic('dine'));rep('<span class="e">⛽</span>',ic('gas'))
rep('left to spend this month and the growing plant','today’s plan, left to spend this month and bills due')
# subscriptions card
rep('''<p>Sprout spots every repeating charge and flags the ones you stopped using. One tap to cancel.</p>''','''<p>Sprout finds repeating charges on its own, warns you when a price goes up and flags the ones you don’t use. Plus can cancel them for you.</p>''')
rep('''<div class="sub cut"><span class="ic">A</span>Adobe Creative Cloud<b>$22.99</b></div>''','''<div class="sub cut"><span class="ic">A</span>Adobe Creative Cloud<em class="tag">Not used</em><b>$22.99</b></div>''')
rep('''<div class="sub"><span class="ic">S</span>Spotify<b>$11.99</b></div>''','''<div class="sub"><span class="ic">H</span>Hulu<em class="tag up">Price went up</em><b>$17.99</b></div>''')
rep('''<span class="ic">G</span>Gym you never visit<b>$30.00</b>''','''<span class="ic">F</span>Fitzone Gym<em class="tag">Not used</em><b>$30.00</b>''')
rep('''<div class="saved">You'd save $635 a year</div>''','''<div class="saved">About $636 a year you could free up</div><small class="est">Estimate based on your charges. Actual savings vary.</small>''')
# new bento cards after Ask
new='''
      <div class="card c-h"><h3>A budget score that means something.</h3><p>Ten signals, weighted by what matters most, with the one change that would help the most.</p>
        <div class="demo hsc"><svg viewBox="0 0 64 64" class="hring" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg2)" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="147 164" transform="rotate(-90 32 32)"/><text x="32" y="38" text-anchor="middle">90</text></svg>
          <div class="hbars"><div><span>Spending</span><i><u style="width:92%"></u></i></div><div><span>Saving</span><i><u style="width:84%"></u></i></div><div><span>Debt</span><i><u style="width:88%"></u></i></div><div><span>Habits</span><i><u style="width:100%"></u></i></div></div></div></div>
      <div class="card c-i"><h3>Every savings goal in one place.</h3><p>Track your savings accounts and goals. Your money stays at your bank.</p>
        <div class="demo"><div class="svg1"><b>Emergency fund</b><span>$3,200 of $5,000</span><i><u style="width:64%"></u></i></div><div class="svg1"><b>Trip to Denver</b><span>$840 of $1,200</span><i><u style="width:70%"></u></i></div></div></div>
      <div class="card c-j"><h3>Give a month, get a month.</h3><p>Invite a friend with your code. When they join, you both get a month of Plus free.</p>
        <div class="demo refd"><span class="code">SPRT-7K2QXM</span><span class="refnote">Up to 12 free months a year. Terms apply.</span></div></div>'''
anchor='<div class="bub ai" id="chat-ai"><span class="typing"><i></i><i></i><i></i></span></div></div></div>'
rep(anchor,anchor+new)
rep('''message other members and cheer each other on.</p>''','''message other members and cheer each other on. Clear guidelines keep it kind, filters stop account numbers and money requests, and you can report or block anyone.</p>''')
# privacy
rep('''<span>Face ID and passcode lock on the app.</span></div>''','''<span>Face ID and passcode lock on the app.</span></div>
        <div><svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>Sign in with Apple, Google or email. Strong passwords required.</span></div>''')
# pricing
rep('''Keep your streak and Plus pays you back in credit at every milestone.''','''Try Plus free for 7 days. Cancel anytime before the trial ends.''')
rep('''<li>Green-day streaks and your growing sprout</li><li>Community</li></ul>''','''<li>Subscription finder with price alerts</li><li>Budget score</li><li>Savings tracker</li><li>Green-day streaks and your growing sprout</li><li>Community</li></ul>''')
rep('''<li>Bill negotiation</li>''','''<li>Lower my bills (we ask your providers)</li>''')
rep('''<li>Share with a partner</li><li>Earn your subscription back with streak rewards</li></ul></div>
    </div>''','''<li>Plan with a partner</li><li>Streak rewards: earn Plus credit at milestones</li><li>Give a month, get a month when friends join</li></ul></div>
    </div>
    <p class="pfine">7-day free trial, then $49.99 a year or $6.99 a month. Renews automatically until you cancel. Cancel at least 24 hours before the trial ends to avoid a charge. Savings Sprout shows are estimates, not guarantees. Streak rewards and referral months are Plus credit. Terms apply.</p>''')
rep('''<span>Sprout is a planning tool, not financial advice.</span>''','''<span>Sprout is a planning tool, not financial advice. Savings figures are estimates, not guarantees.</span>''')
css='''
/* current app: icons, new cards, fine print */
.cico{--ca:#74d497;--cb:#2f9e58;width:40px;height:40px;flex:none;border-radius:31%;display:grid;place-items:center;background:linear-gradient(150deg,var(--ca),var(--cb));box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 3px 8px color-mix(in srgb,var(--cb) 30%,transparent)}
.cico svg{width:58%;height:58%;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sub .tag{font-style:normal;font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:#fff1d6;color:#9a6512;white-space:nowrap}
.sub .tag.up{background:#fde3df;color:#b4473a}
.est,.refnote{font-size:12px;color:var(--muted)}
.c-h,.c-i,.c-j{grid-column:span 2}
@media (max-width:900px){.c-h,.c-i,.c-j{grid-column:span 6}}
.hsc{flex-direction:row;align-items:center;gap:16px}
.hring{width:84px;height:84px;flex:none}.hring text{font-family:var(--f-display);font-size:19px;font-weight:600;fill:var(--ink)}
.hbars{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0}
.hbars div{display:grid;grid-template-columns:62px 1fr;gap:8px;align-items:center;font-size:12.5px;font-weight:700;color:var(--muted)}
.hbars i,.svg1 i{display:block;height:7px;border-radius:99px;background:var(--bg2);overflow:hidden}
.hbars u,.svg1 u{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8fd3a7,var(--accent))}
.svg1{display:grid;grid-template-columns:1fr auto;gap:6px 10px;font-size:14px}.svg1 span{color:var(--muted);font-size:13px}.svg1 i{grid-column:1/-1}
.svg1+.svg1{margin-top:8px}
.refd{align-items:flex-start}
.refd .code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:18px;letter-spacing:.06em;padding:10px 14px;border-radius:14px;background:var(--bg2);color:var(--accent2)}
.pfine{max-width:640px;margin:22px auto 0;font-size:12.5px;color:var(--muted);line-height:1.5}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
assert '—' not in s, 'em dash'
open(f,'w').write(s);print('ok')
