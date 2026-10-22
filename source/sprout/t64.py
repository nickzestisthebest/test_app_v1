# Ask on the phone: 100 messy questions (typos, slang, shorthand). Target: at least 9 in 10 answered without the AI.
import os, csv, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.getcwd() + '/v2_test.html'
rows = list(csv.DictReader(open('../csvin/tx.csv')))
Q = [
 # today / daily number
 'how much can i spend today', 'how much can i spemd today', 'what can i spend 2day', 'am i broke', 'how broke am i', 'whats left for today', 'daily number?', 'how much do i have left to spend',
 'how much money do i have', 'whats my balance', 'how much is in my checking', 'how much cash do i have rn',
 # afford
 'can i afford $80 on friday', 'can i aford 60 bucks', 'can i afford a $200 jacket', 'can i buy airpods for 179', 'can i spend 40 tonight', 'is 25 ok for lunch today', 'could i afford 300 next week',
 'when can i afford a $1,200 trip', 'when could i buy a 2000 laptop', 'how long to save for a $5000 vacation', 'i want to buy a car for 25000 how long', 'when can i afford a house down payment of 40k',
 'can i afford a $120/mo gym', 'can i afford 15 a month for spotify', 'could i swing $300 a month car payment',
 # bills / upcoming
 'what bills are due before payday', 'whats due this week', 'what bils r due', 'whats coming up', 'upcoming payments', 'what do i owe this month', 'when is rent due', 'any bills tmrw',
 'what payments are coming up next week', 'whats due before my next check',
 # payday / income
 'when do i get paid', 'when is my next payday', 'next check?', 'when is payday', 'how much do i make a month', 'how much did i get paid last month', 'whens my next paycheck',
 # spending
 'how much did i spend this month', 'how much did i spnd this mnth', 'how much did i spend last month', 'how much have i spent this week', 'where did my money go', 'where does my money go',
 'what did i spend the most on', 'biggest purchases this month', 'how much did i spend on groceries', 'how much did i spend on gorceries this month', 'how much did i spend at kroger', 'how much on doordash last month',
 'how much did i spend on dining', 'how much on gas this month', 'how much did i spend on shopping last month', 'spending on coffee', 'how much did i spend in september', 'how much did i spend on amazon',
 'compare this month to last month', 'am i spending more than last month',
 # budgets
 'am i on track with my budgets', 'how am i doing', 'hows my budget', 'how am i doing on groceries', 'am i over budget', 'how much is left in my dining budget', 'which budget am i over',
 # subscriptions
 'what subscriptions do i have', 'what subs am i paying for', 'how much do i spend on subscriptions', 'any subscriptions i dont use', 'did netflix go up', 'cancel spotify',
 # debt
 'how much do i owe', 'what do i owe', 'how much debt do i have', 'whats my credit card balance', 'how much do i owe on pay later', 'klarna balance', 'what affirm payments are left', 'when is my next klarna payment',
 'when will i be debt free', 'which debt should i pay first',
 # net worth / savings
 'whats my net worth', 'whats my net wroth', 'how much am i worth', 'how much is in my 401k', 'how much do i have in savings', 'how much in my retirement',
 # credit
 'whats my credit score', 'what is my utilization', 'how many hard inquiries do i have', 'whats on my credit report',
 # goals
 'how are my goals doing', 'how much have i saved for my goal',
 # misc
 'show me my money calendar', 'how much did i spend on fees',
]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-debug','1')")
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.evaluate(open('nick_seed.js').read(), rows); pg.wait_for_timeout(500)
    pg.evaluate("(()=>{__S.RC.usePay(__S.RC.pay());state.bills.push({name:'Rent',amt:1200,type:'monthly',day:1});state.goals=[{name:'Emergency fund',amt:1000}];__T.ev('plan()')})()")
    res = pg.evaluate("""(Q)=>Q.map(q=>{let r=null;try{r=__T.ev('BR.answer')(q)}catch(e){return [q,'ERR '+e.message,0]}
      if(!r)return [q,'(none: would go to the AI)',0];if(r.guess)return [q,'(asked: did you mean...)',1];return [q,String(r.reply||'').slice(0,110).replace(/\\n/g,' '),2]})""", Q)
    b.close()
loc = [r for r in res if r[2] == 2]; gs = [r for r in res if r[2] == 1]; ai = [r for r in res if r[2] == 0]
for r in res: print(('OK   ' if r[2] == 2 else 'ASK  ' if r[2] == 1 else 'AI   ') + r[0] + '  ->  ' + r[1])
print('\nanswered on the phone:', len(loc), '/', len(Q), ' asked what they meant:', len(gs), ' would use AI:', len(ai), ' errors:', errs[:3])
