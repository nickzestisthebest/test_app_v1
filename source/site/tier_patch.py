import re
f='bonsai_site.html';s=open(f).read()
free=['Daily safe-to-spend number and plan','Paycheck and bill planner, bill calendar','Budgets and your debt-free date','Subscription finder with price alerts','Budget score and your top tip','Savings tracker and net worth','Smart alerts: double charges, fees, price hikes','10 screenshot scans a month','2 linked accounts','Streaks, your growing sprout and Community']
plus=['Everything in Free','Cancel subscriptions for you','Lower my bills (we ask your providers)','Ask Sprout anything, plus unlimited scans','Every account linked and synced','Full Budget score: all 10 signals','Credit score and tips','Plan with a partner','Streak rewards: earn Plus credit']
lis=lambda L:'<ul>'+''.join('<li>'+x+'</li>' for x in L)+'</ul>'
m=re.search(r'(<div class="plan"><h3>Free</h3>.*?)<ul>.*?</ul>',s,re.S);assert m
s=s[:m.start()]+m.group(1)+lis(free)+s[m.end():]
m=re.search(r'(<div class="plan plus"><h3>Sprout Plus</h3>.*?)<ul>.*?</ul>',s,re.S);assert m
s=s[:m.start()]+m.group(1)+lis(plus)+s[m.end():]
a='<h2 style="margin-top:12px">Free to grow. Plus to grow faster.</h2>'
assert a in s
s=s.replace('<div class="pm">Forever</div>','<div class="pm">Forever. Everything you need to stay on track.</div>')
assert 'id="price-note">About $4.17 a month</div>' in s
s=s.replace('Try Plus free for 7 days. Cancel anytime before the trial ends.','Free covers your whole daily plan. Plus does the work for you. Try it free for 7 days.')
assert '—' not in s
open(f,'w').write(s);print('tiers ok')

# Ask Sprout is a Plus feature
a='<p class="lede">Ask the way you would ask a friend. Sprout answers from your real numbers, in plain English. Tap a question to see.</p>'
if a in s:s=s.replace(a,'<p class="lede">Ask the way you would ask a friend. Sprout answers from your real numbers, in plain English. Tap a question to see.</p><p class="lede" style="margin-top:-6px;font-size:15px">Included with Sprout Plus.</p>')
a='<div class="card c-e"><h3>Ask Sprout anything.</h3><p>Real answers from your real numbers.</p>'
if a in s:s=s.replace(a,'<div class="card c-e"><h3>Ask Sprout anything.</h3><p>Real answers from your real numbers. Included with Plus.</p>')
open(f,'w').write(s)
