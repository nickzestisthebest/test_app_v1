# Money calendar gets its own section on the website, and the highlight captions match the redesigned app.
s=open('bonsai_site.html').read()
def rep(a,b):
    global s
    if b in s: return
    assert s.count(a)==1,(a[:70],s.count(a));s=s.replace(a,b)
i=s.index('<section class="sec snap"');j=s.index('</section>',i)+len('</section>')
phone=s[s.index('<div class="phone snapphone"',i):s.index('</div></div></div>',s.index('<div class="phone snapphone"',i))+len('</div></div></div>')]
cal=phone.replace('data-demo="scan" data-loop="1"','data-demo="calendar" data-loop="1"').replace('aria-label="Animated demo: scanning a Cash App screenshot, adding it, and the bank copy being matched automatically"','aria-label="Animated demo: the money calendar, a payday’s plan, and the balance view"')
sec='''

<section class="sec snap calx" data-bg="--bg" id="calendar">
  <div class="wrap">
    <div>
      <span class="eyebrow">Money calendar</span>
      <h2 style="margin:12px 0 18px">See every day before it happens.</h2>
      <p class="lede">Paydays, bills, card payments, pay-later installments and subscriptions on one calendar, with where checking should land at the end of each day. A tight week shows up in amber or red long before you get there.</p>
      <ul class="ticks"><li>Tap any day for its plan: what to pay, what goes to debt, and how much you can spend in each budget</li><li>Switch to Balance to see your checking day by day, green, amber or red</li><li>Ask “what if I spend $80 on Friday?” and see your lowest balance before you do it</li></ul>
    </div>
    '''+cal+'''
  </div>
</section>'''
if 'id="calendar"' not in s: s=s[:j]+sec+s[j:]
rep('<p>Every purchase sorted into simple categories, with budgets you can nudge in a tap.</p>','<p>Every purchase sorted into simple categories, with a fixed budget for each. Changing one never changes the others.</p>')
rep('<p>Find subscriptions you forgot, cancel them for you, and see every bill on a calendar.</p>','<p>Find subscriptions you forgot, see what your cards charge in interest, and cancel what you don’t use.</p>')
rep('<p>Net worth, checking, your paycheck and your debt, all on one calm screen.</p>','<p>Net worth, cash flow, debt and savings, each on its own clear screen, with a payoff plan that puts the highest rate first.</p>')
rep('<h3>A budget score that means something.</h3><p>Ten signals, weighted by what matters most, with the one change that would help the most.</p>','<h3>Money Pulse: five scores in one.</h3><p>Cash flow, debt, spending, saving and net worth, each with its own weight, so you can see exactly what moves it.</p>')
rep('aria-label="Budget score 90 out of 100, Strong"','aria-label="Money Pulse 86 out of 100, Strong"')
rep('<div class="hrv"><b>90</b><span>Strong</span></div>','<div class="hrv"><b>86</b><span>Strong</span></div>')
rep('<div class="hbars"><div><span>Spending</span><em>92</em><i><u style="--w:92%"></u></i></div><div><span>Saving</span><em>84</em><i><u style="--w:84%"></u></i></div><div><span>Debt</span><em>88</em><i><u style="--w:88%"></u></i></div><div><span>Habits</span><em>100</em><i><u style="--w:100%"></u></i></div></div>','<div class="hbars"><div><span>Cash flow</span><em>92</em><i><u style="--w:92%"></u></i></div><div><span>Debt</span><em>81</em><i><u style="--w:81%"></u></i></div><div><span>Spending</span><em>88</em><i><u style="--w:88%"></u></i></div><div><span>Saving</span><em>84</em><i><u style="--w:84%"></u></i></div><div><span>Net worth</span><em>80</em><i><u style="--w:80%"></u></i></div></div>')
rep('<b>It is tight.</b> You will have about $70 for fun before payday, so $80 goes about $10 over. Try $60, or plan it for after payday.','<b>It’s tight.</b> You’ll have about $70 for fun before payday, so $80 is about $10 over. $60 fits, or after payday on Oct 27.')
rep('<li>Budget score and your top tip</li>','<li>Money Pulse: five scores and what moves them</li>')
rep('<li>Full Budget score: all 10 signals</li>','<li>Weekly credit updates (when available)</li>')
open('bonsai_site.html','w').write(s)
print('ok', s.count('id="calendar"'))
