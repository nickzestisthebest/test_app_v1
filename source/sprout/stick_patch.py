import re
def apply(s, v2):
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:70],s.count(a))
        s=s.replace(a,b)
    old=re.search(r"function streakNow\(\)\{const ck=state\.checkin\|\|\{\},tk=fd\(realDay\(\)\),yk=fd\(realDay\(\)-MS\);return\(ck\.last===tk\|\|ck\.last===yk\)\?\(ck\.streak\|\|0\):0\}\n",s)
    assert old
    s=s.replace(old.group(0),'')
    js=open('x_stick.js').read()+('\n'+open('x_league.js').read() if v2 else '')
    rep('// ---------- boot ----------',js+'\n// ---------- boot ----------')
    rep('</style>\n',open('x_stick.css').read()+'</style>\n')
    rep("((ck.streak||0)>0?'<div class=\"streak\">Check-in streak: <b>'+ck.streak+' day'+(ck.streak>1?'s':'')+'</b></div>':'');","(streakNow()>0?'<div class=\"streak\">Green day streak: <b>'+streakNow()+' day'+(streakNow()>1?'s':'')+'</b></div>':'');")
    i=s.index("'<li>Check-in streak: <b>'");j=s.index("</li>",i)+5
    s=s[:i]+"(()=>{const d=stkToday()||{a:0,s:0},ok=d.s<=d.a+0.5;return '<li>'+(ok?'Today is locked in as a <b>green day</b>. Stay under '+money(Math.max(0,d.a-d.s))+' to keep it. Streak: <b>'+streakNow()+' day'+(streakNow()===1?'':'s')+'</b>.':'You are over today’s budget, so today won’t count as green'+(SK().savers>0?', but a streak saver will cover it.':'.'))+'</li>'})()+'"+s[j:]
    rep("n+' day check-in streak'","n+' day green streak'")
    rep("function overview(){","function overview(){stkTick();")
    if v2: rep("+syncChip()+homeAlert()+growthCard()+","+syncChip()+homeAlert()+stickCard()+growthCard()+")
    else: rep("+growthCard()+","+stickCard()+growthCard()+")
    rep("stk:","stk:",0) if "stk:" not in s else None
    return s
