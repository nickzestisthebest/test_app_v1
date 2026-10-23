import os
# Home stays Home; Money -> Finances (big-picture cards moved there); press-and-hold menus trimmed to 3-5 items.
FIN_IC='M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7l12-3v3M16 13.5h1.5'
def apply(s):
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a))
        s=s.replace(a,b)
    def lp(start,new,lines=1):
        nonlocal s
        i=s.index(start);j=i
        for _ in range(lines): j=s.index('\n',j+1)
        s=s[:i]+new+s[j:]
    # --- tab bar ---
    rep('<path d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 2.8 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"/></svg>Money<span','<path d="'+FIN_IC+'"/></svg>Finances<span')
    # --- move Checking + paycheck/payday/bills/debt cards from Home into Finances ---
    rep("function overview(){","let WAL='';\nfunction overview(){")
    rep("   '<button class=\"ovcard wide\" data-goto=\".port\">","   (WAL='<button class=\"ovcard wide\" data-goto=\".port\">")
    rep("   '</div>'+\n   insightCard()+","   '</div>','')+\n   insightCard()+")
    # --- Finances page ---
    rep("<h1>Money</h1><small>Everything in one place</small>","<h1>Finances</h1><small>Your whole picture</small>")
    rep("(al?'<button class=\"xalert\" data-x=\"open\" data-v=\"alerts\">'+ic('bell')+'<span style=\"flex:1\">'+alerts()[0].t+'</span>›</button>':'')+\n  '<div class=\"xgrid\">'",
        "WAL+'<div class=\"xsec\">Tools</div>'+\n  '<div class=\"xgrid\">'")
    rep('</style>\n','#pg .ovcard{font:inherit;color:inherit;text-align:left;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .14s}#pg .ovcard:active{transform:scale(.98)}\n.xsec{font-size:13px;font-weight:700;color:var(--muted);margin:6px 4px -4px}\n</style>\n')
    # --- focus views opened from Finances go back to Finances ---
    rep("let FKEY=null;","let FKEY=null,FFROM=null;")
    rep("function openFocus(sel){let F=FOCUS[sel];FKEY=sel;","function openFocus(sel){FFROM=VIEW==='tab'&&TAB==='money'?'money':(VIEW==='focus'?FFROM:null);let F=FOCUS[sel];FKEY=sel;")
    rep("""fb.innerHTML='<button class="fback" data-home aria-label="Back to home">‹</button>""","""fb.innerHTML=(FFROM?'<button class="fback" data-tab="money" aria-label="Back to Finances">‹</button>':'<button class="fback" data-home aria-label="Back to home">‹</button>')+'""")
    rep("const on=n=>VIEW==='tab'?TAB===n:n==='home';","const on=n=>VIEW==='tab'||(VIEW==='focus'&&FFROM)?TAB===n:n==='home';")
    rep("function setTab(t){TAB=t;VIEW='tab';","function setTab(t){if(VIEW==='focus')clearFocus();TAB=t;VIEW='tab';")
    # --- translations ---
    rep("].forEach(r=>{BUILTIN.es[r[0]]=r[1];BUILTIN.zh[r[0]]=r[2]});",
        ",['Finances','Finanzas','理财'],['Your whole picture','Tu panorama completo','你的财务全貌'],['Tools','Herramientas','工具']].forEach(r=>{BUILTIN.es[r[0]]=r[1];BUILTIN.zh[r[0]]=r[2]});")
    # ===== press-and-hold: 3-5 items each =====
    # Finances tab (5): alerts first when there are any, then the most-used tools
    lp("lpReg('.tb[data-tab=money]'",
       "lpReg('.tb[data-tab=money]',()=>{const n=netWorth(),al=alerts().length,wx=v=>()=>{setTab('money');if(v==='calendar')CALS=null;xOpen(v)};"
       "const items=(al?[{ic:'bell',t:'Alerts',s:al+' to review',fn:wx('alerts')}]:[]).concat([{ic:'repeat',t:'Subscriptions',fn:wx('subs')},{ic:'pie',t:'Budgets',fn:wx('budgets')},{ic:'cal',t:'Bill calendar',fn:wx('calendar')},{ic:'trend',t:'Net worth',fn:wx('networth')},{ic:'gauge',t:'Credit score',fn:wx('credit')}]).slice(0,5);"
       "return{title:'Finances',sub:'Net worth '+money0(n.N),items}});\n"
       # Home tab (3-4)
       "lpReg('.tb[data-tab=home]',()=>{const ck=(state.checkin||{}).last===fd(realDay()),sp=(state.spend||[]).map(s=>Object.assign({t:pd(s.d)},s)),A=availAt(realToday(),sp);"
       "return{title:'Home',sub:money(Math.max(0,A.leftTotal))+' safe to spend today',items:(ck?[]:[{ic:'check',t:'Daily check-in',s:'Locks in today',fn:()=>{goHome();setTimeout(openCheckin,60)}}]).concat(["
       "{ic:'flag',t:'Today’s plan',fn:()=>{goHome();setTimeout(()=>openFocus('#guide'),30)}},"
       "{ic:'pie',t:'Spending this week',fn:()=>{TXF.when='week';TXF.type='all';openTx()}},"
       "{ic:'star',t:'Streak and rewards',fn:()=>{streakSheet();openSheet('sh-streak')}}])}});")
    # Streak chip (3-4): no dead "already checked in" row
    lp("lpReg('#hd-streak'",
       "lpReg('#hd-streak',()=>{const ck=(state.checkin||{}).last===fd(realDay()),d=typeof stkToday==='function'?stkToday():null;"
       "return{title:streakNow()+' day streak',sub:(ck?'Checked in today · ':'')+(d?(d.s>d.a+0.5?'Over today':money(Math.max(0,d.a-d.s))+' left today'):''),"
       "items:(ck?[]:[{sym:'✓',t:'Check in now',s:'Locks in today',fn:openCheckin}]).concat([{sym:'★',t:'Streak and rewards',fn:()=>{streakSheet();openSheet('sh-streak')}},"
       "{ic:'trophy',t:'Leagues',fn:()=>{SEG='leagues';setTab('community')}},{ic:'leaf',t:'Share my progress',fn:()=>{setTab('community');COMP.type='progress';COMP.att=true;xOpen('compose')}}])}});",2)
    # Bills (3): mark paid, ask, see all bills
    rep("  if(sampleFn)items.push({sym:'?',t:'Can this wait?'",
        "  items.push({ic:'cal',t:'See all bills',fn:()=>{setTab('money');CALS=null;xOpen('calendar')}});\n  if(sampleFn)items.splice(1,0,{sym:'?',t:'Can this wait?'")
    # Transactions (3-4): one move option, log again, edit, delete
    rep("const items=[];if(!inc){if(s.cat!=='Everyday')items.push({sym:'●',t:'Move to Basics',fn:mv('Everyday')});if(s.cat!=='Personal')items.push({sym:'★',t:'Move to Fun',fn:mv('Personal')});if(s.cat!=='Bill')items.push({sym:'≡',t:'It was a bill or payment',fn:mv('Bill')})}",
        "const items=[];if(!inc){if(s.cat==='Everyday')items.push({sym:'★',t:'Move to Fun',fn:mv('Personal')});else items.push({sym:'●',t:'Move to Basics',fn:mv('Everyday')})}")
    rep("  items.push({sym:'✎',t:'Edit details',fn:()=>{txEdit=i;renderTx()}});","  items.unshift({sym:'✎',t:'Edit details',fn:()=>{txEdit=i;renderTx()}});")
    # Community posts (3-4): drop Copy text
    rep(",{ic:'doc',t:'Copy text',fn:()=>{try{navigator.clipboard.writeText(p.txt);toast('Copied')}catch(_){toast('Couldn’t copy')}}}","")
    return s
_orig=apply
def apply(s):
    s=_orig(s)
    a="concat([{sym:'›',t:'See details',fn:()=>openFocus('#t-hero')}])"
    assert s.count(a)==1
    return s.replace(a,"concat([{ic:'pie',t:'Spending this week',fn:()=>{TXF.when='week';TXF.type='all';openTx()}},{sym:'›',t:'See details',fn:()=>openFocus('#t-hero')}])")
_orig2=apply
def apply(s):
    s=_orig2(s)
    a="'<button class=\"xhero\" data-x=\"open\" data-v=\"networth\" style=\"border:0;text-align:left;font:inherit;color:inherit;cursor:pointer\"><span class=\"k\">Net worth</span><b class=\"'+(n.N<0?'dn':'')+'\">'+money0(n.N)+'</b><span class=\"d\">'+money0(totalDebt())+' still owed · tap for the trend</span></button>'"
    assert s.count(a)==1,'nw hero'
    s=s.replace(a,"nwCard()")
    b='// ---------- boot ----------'
    assert s.count(b)==1
    s=s.replace(b,open('nw.js').read()+'\n'+b)
    i=s.index('</style>');s=s[:i]+open('nw.css').read()+s[i:]
    return s
_orig3=apply
def apply(s):
    s=_orig3(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # remove the hamburger button (drawer stays hidden in the DOM as the shared nav target)
    rep('    <button class="hamb" id="open-menu" aria-label="Open menu"><span></span><span></span><span></span></button>','')
    rep('See Spending insights in the menu.','See Spending insights in Finances.')
    # Finances: transactions + insights tiles first, update-numbers link under the overview cards
    rep("WAL+'<div class=\"xsec\">Tools</div>'+\n  '<div class=\"xgrid\">'+",
        "WAL+'<button class=\"nwupd\" data-x=\"nav\" data-v=\"edit\"><span class=\"nwut\">Update my numbers<small>Balance, paycheck, bills and debts</small></span><span>›</span></button>'+'<div class=\"xsec\">Tools</div>'+\n  '<div class=\"xgrid\">'+"
        "'<button class=\"xtile\" data-x=\"nav\" data-v=\"tx\"><span class=\"ico\">'+ic('money')+'</span><b>Transactions</b><small>Search, edit and sort</small></button>'+"
        "'<button class=\"xtile\" data-x=\"nav\" data-v=\"insights\"><span class=\"ico\">'+ic('trend')+'</span><b>Spending insights</b><small>Where your money goes</small></button>'+")
    # Settings: a "Your plan" group at the top
    rep("  sgroup('Preferences',[","  sgroup('Your plan',[srow('doc','Update my numbers','','data-x=\"nav\" data-v=\"edit\"'),srow('redo','Daily check-in',(state.checkin||{}).last===fd(realDay())?'Done today':'','data-x=\"nav\" data-v=\"checkin\"')])+\n  sgroup('Preferences',[")
    i=s.index('</style>');s=s[:i]+'.nwupd{display:flex;align-items:center;gap:10px;width:100%;border:0;font:inherit;color:inherit;text-align:left;cursor:pointer;background:var(--panel);border-radius:18px;padding:13px 16px;font-weight:700;font-size:15px}.nwut{flex:1;display:flex;flex-direction:column;gap:1px}.nwupd small{font-weight:600;color:var(--muted);font-size:12.5px}.nwupd>span:last-child{color:var(--muted);font-size:20px}.nwupd:active{transform:scale(.98)}\n'+s[i:]
    s=s.replace("['Tools','Herramientas','工具']]","['Tools','Herramientas','工具'],['Update my numbers','Actualizar mis números','更新我的数字'],['Your plan','Tu plan','你的计划']]")
    rep("if(!special.includes(n))setView('detail',document.getElementById('m-'+n)?'#m-'+n:null);","if(!special.includes(n)){if(document.getElementById('m-'+n))openFocus('#m-'+n);else setView('detail',null)}")
    return s
_orig4=apply
def apply(s):
    s=_orig4(s)
    import re
    i=s.index('function growthCard(){');j=s.index("</section>'}",i)+len("</section>'}")
    s=s[:i]+open('grow_card.js').read().strip()+s[j:]
    i=s.index('GROW=[[');j=s.index(']];',i)+3
    s=s[:i]+"GROW=[['Seed',0,'Just planted. Pay down a bill or save a little to start it growing.'],['Sprout',250,'A first green shoot. Every dollar you pay off or save helps.'],['Seedling',1000,'Roots are down. You are paying debt and saving on a steady rhythm.'],['Growing',5000,'Strong and leafy. Your money habits are paying off.'],['Thriving',15000,'Fully grown. You are building money faster than it can shrink.']];"+s[j:]
    i=s.index('</style>');s=s[:i]+open('grow_card.css').read()+s[i:]
    s=s.replace("'Total you have saved so far (counts toward your Sprout score)'","'Total you have saved so far (helps your plant grow)'")
    return s
_orig5=apply
def apply(s):
    s=_orig5(s)
    for a,b in [('plan, tree and streak','plan, plant and streak'),('The tree finally looks like a tree.','My plant is finally looking full.'),
                ('Your tree has something new.','Your plant has something new.'),('Bank it and grow my tree','Bank it and grow my plant'),(' and grow my tree',' and grow my plant'),
                ('That tree is huge now!','That plant is huge now!'),('green days and a full tree.','green days and a thriving plant.'),('green streak and a full tree.','green streak and a thriving plant.'),
                ('Low-spend week. Your tree approves.','Low-spend week. Your plant approves.'),('green days. Your tree is thriving.','green days. Your plant is thriving.')]:
        assert a in s,a
        s=s.replace(a,b)
    return s
_orig6=apply
def apply(s):
    s=_orig6(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    rep("const avt=n=>","let avt=n=>")
    rep("p.email=($('#pf-mail').value||'').trim();","p.email=($('#pf-mail').value||'').trim();if($('#pf-bio'))p.bio=($('#pf-bio').value||'').trim().slice(0,120);")
    # tappable members
    rep("avt(p.who)+'<div class=\"xt\"><b>'+esc(p.who)+'</b>","mlk(p.who,avt(p.who))+'<div class=\"xt\"><b>'+mlk(p.who,esc(p.who))+'</b>",2)
    rep("avt(c[0])+'<div class=\"bub\"><b>'+esc(c[0])+'</b>","mlk(c[0],avt(c[0]))+'<div class=\"bub\"><b>'+mlk(c[0],esc(c[0]))+'</b>")
    rep("avt(a[0])+'<b style=\"flex:1\">'+esc(a[0])+'</b>","mlk(a[0],avt(a[0]))+'<b style=\"flex:1\">'+mlk(a[0],esc(a[0]))+'</b>")
    rep("avt(z.me?(state.name||'You'):z.n)","(z.me?avt(state.name||'You'):mlk(z.n,avt(z.n)))")
    rep("avt(r[0])+'<div class=\"xt\"><b>'+(i+1)+'. '+esc(r[0])+'</b>","mlk(r[0],avt(r[0]))+'<div class=\"xt\"><b>'+(i+1)+'. '+mlk(r[0],esc(r[0]))+'</b>")
    # messages button in Community header + badge on the Community tab
    rep('<button class="sbtn" data-x="open" data-v="compose">+ Share</button></div>',"<div class=\"pgha\"><button class=\"sbtn alt dmbtn\" data-x=\"inbox\" aria-label=\"Messages\">'+ic('chat')+(dmUnread()?'<i class=\"dmc\">'+dmUnread()+'</i>':'')+'</button><button class=\"sbtn\" data-x=\"open\" data-v=\"compose\">+ Share</button></div></div>")
    rep('18 14a5 5 0 0 1 3 6"/></svg>Community</button>','18 14a5 5 0 0 1 3 6"/></svg>Community<span class="bdg" id="tb-dm" hidden>0</span></button>')
    rep("bd.hidden=!n}}","bd.hidden=!n}const bm=document.getElementById('tb-dm');if(bm&&typeof dmUnread==='function'){const k=dmUnread();bm.textContent=k;bm.hidden=!k}}")
    # press-and-hold: Messages in the Community tab menu; Message in a post's menu
    rep("{ic:'trophy',t:'Leagues',fn:()=>{SEG='leagues';setTab('community')}}]}));","{ic:'send',t:'Messages',s:dmUnread()?dmUnread()+' unread':'',fn:()=>{setTab('community');DMNEW=false;xOpen('inbox')}},{ic:'trophy',t:'Leagues',fn:()=>{SEG='leagues';setTab('community')}}]}));")
    rep("{ic:'chat',t:'Comment',fn:()=>xGo('comments',id)},","{ic:'chat',t:'Comment',fn:()=>xGo('comments',id)},].concat(p.mine?[]:[{ic:'send',t:'Message '+p.who,fn:()=>{DMNEW=false;xGo('chat',p.who)}}]).concat([")
    rep("toastAct('Hidden (demo)','Undo',()=>{delete X().soc.mute[p.who];afterChange()})}}])}});","toastAct('Hidden (demo)','Undo',()=>{delete X().soc.mute[p.who];afterChange()})}}]))}});")
    b='// ---------- boot ----------'
    s=s.replace(b,open('social2.js').read()+'\n'+b)
    i=s.index('</style>');s=s[:i]+open('social2.css').read()+s[i:]
    return s
_orig7=apply
def apply(s):
    s=_orig7(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    rep("const ex=['Can I afford $80 for dinner Friday?','I spent $14 on lunch','What\\u2019s due this week?','Does unspent money carry over?'];",
        "const ex=['How much can I spend today?','Can I afford $80 for dinner Friday?','How much will I have on payday?','How much should I save for a $1,200 trip?','How much can I spend on groceries this week?','I spent $14 on lunch'];")
    rep('placeholder="I spent $14 on lunch / does unspent money carry over?"','placeholder="Ask anything, like “Can I afford this?”"')
    rep("   dueSoonHTML()+(short?","   leftCard()+dueSoonHTML()+(short?")
    rep("<h1>Community</h1><small>Grow together</small>","<h1>Community</h1><small>You’re not in this alone</small>")
    rep("if(SEG==='feed')body=allPosts().map(postHTML).join('')","if(SEG==='feed')body=welcomeCard()+allPosts().map(postHTML).join('')")
    s=s.replace("['Tools','Herramientas','工具'],","['Tools','Herramientas','工具'],['You’re not in this alone','No estás solo en esto','你并不孤单'],['Left to spend this month','Te queda para gastar este mes','本月剩余可花'],",1)
    b='// ---------- boot ----------'
    s=s.replace(b,open('easy_app.js').read()+'\n'+b)
    i=s.index('</style>');s=s[:i]+open('easy_app.css').read()+s[i:]
    return s
_orig8=apply
def apply(s):
    s=_orig8(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    CAMI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'
    rep('<div class="sheet" id="sh-ask" hidden>','<div class="sheet" id="sh-scan" hidden>\n  <div class="scrim" data-close></div>\n  <div class="panel tall" role="dialog" aria-modal="true" aria-labelledby="sc-t">\n    <div class="grab"></div>\n    <div class="ph"><h2 id="sc-t">Scan a screenshot</h2><button type="button" class="lnk" data-close>Done</button></div>\n    <div id="sc-body"></div>\n  </div>\n</div>\n<div class="sheet" id="sh-ask" hidden>')
    rep('<form id="sp-form" class="spform" novalidate autocomplete="off">','<button type="button" class="scanbtn" data-scan>'+CAMI+'<span><b>Scan a screenshot</b><small>Receipts, Cash App, Venmo, Zelle or your bank app</small></span><em>›</em></button><div class="or">or type it in</div>\n    <form id="sp-form" class="spform" novalidate autocomplete="off">')
    i=s.index("const man=(state.spend||[]).find(");j=s.index(";",s.index("&&((r.a<0&&s.cat!=='Income')||(r.a>0&&s.cat==='Income')));",i))+1
    s=s[:i]+"const man=matchLogged(r);"+s[j:]
    rep("if(man){row.dup='Matches something you logged by hand';","if(man){row.dup='Same as something you already logged';")
    rep("if(r.attach&&!r.attach.tid){r.attach.tid=r.k;r.attach.acct=r.acct;att++;","if(r.attach&&!r.attach.tid){r.attach.tid=r.k;r.attach.acct=r.acct;r.attach.linked=1;r.attach.bank={m:r.m,a:Math.round(Math.abs(r.a)*100)/100};if(Math.abs(Math.abs(r.a)-+r.attach.amt)>0.01){r.attach.amt0=r.attach.amt;r.attach.amt=Math.round(Math.abs(r.a)*100)/100}att++;")
    rep("function categorize(r,acctKind,used){const m=r.m||'',rl=(state.rules||{})[mkey(m)];","function categorize(r,acctKind,used){const m=r.m||'',rl=(state.rules||{})[mkey(m)];if(r.a<0&&RX_WFUND.test(m))return{cat:'Skip'};")
    rep("M.bal=Math.round((M.bal+np.a)*100)/100;M.pending=keep;return out}","M.bal=Math.round((M.bal+np.a)*100)/100;M.pending=keep;demoBankCopies(D).forEach(r=>{out.push(r);M.bal=Math.round((M.bal+r.a)*100)/100});return out}")
    rep("toast(res.added||res.repl?'Synced: '+res.added+' new'+(res.repl?', '+res.repl+' pending now posted':''):'Already up to date')","toast(res.added||res.repl||res.att?'Synced: '+res.added+' new'+(res.repl?', '+res.repl+' pending now posted':'')+(res.att?', '+res.att+' matched to what you logged':''):'Already up to date')")
    rep("(s.pending?' · Pending':'')+(s.acct?' · '+esc(s.acct):'')","(s.pending?' · Pending':'')+(s.linked?' · <span class=\"txmatch\">Matched to '+esc(s.acct||'your bank')+'</span>':s.src==='shot'?' · From a screenshot':s.acct?' · '+esc(s.acct):'')")
    rep("<button class=\"btn x\" data-txdel=\"'+s.i+'\" style=\"margin-left:auto\">Delete</button>","'+(s.linked?'<button class=\"btn alt sm\" data-txsplit=\"'+s.i+'\" title=\"Your screenshot and this bank charge were matched as the same money\">Not the same</button>':'')+'<button class=\"btn x\" data-txdel=\"'+s.i+'\" style=\"margin-left:auto\">Delete</button>")
    rep("run:()=>{state.spend.push({d:d||fd(Math.max(pd(state.asOf),Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()))),amt:a.amount,cat,note:a.note||'',at:Date.now()})}","run:()=>{logOrLink({d:d||fd(Math.max(pd(state.asOf),Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()))),amt:a.amount,cat,note:a.note||'',at:Date.now()},{src:atts.length?'shot':'hand'})}")
    rep("items:U.map(u=>({sym:u.cat==='Personal'?'★':'●',t:u.note+' · '+money(u.amt),s:u.cat==='Personal'?'Fun':'Basics',fn:()=>lpAdd(u)})).concat([{sym:'+',t:'Something else',fn:()=>openSheet('sh-spend')}])",
        "items:U.slice(0,3).map(u=>({sym:u.cat==='Personal'?'★':'●',t:u.note+' · '+money(u.amt),s:u.cat==='Personal'?'Fun':'Basics',fn:()=>lpAdd(u)})).concat([{sym:'⌁',t:'Scan a screenshot',s:'Receipts, Cash App, Venmo',fn:scanOpen},{sym:'+',t:'Something else',fn:()=>openSheet('sh-spend')}])")
    b='// ---------- boot ----------'
    s=s.replace(b,open('scan.js').read()+'\n'+b)
    i=s.index('</style>');s=s[:i]+open('scan.css').read()+s[i:]
    return s
_orig9=apply
def apply(s):
    s=_orig9(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    INS='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>'
    BELL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0"/></svg>'
    rep('<button class="gearb" data-settings aria-label="Settings">','<div class="hdacts"><button class="gearb" data-x="nav" data-v="insights" aria-label="Spending insights" title="Spending insights">'+INS+'</button><button class="gearb hdbell" id="hd-bell" data-x="open" data-v="alerts" aria-label="Alerts" title="Alerts">'+BELL+'<i class="hdc" id="hd-bell-c" hidden>0</i></button><button class="gearb" data-settings aria-label="Settings">')
    i=s.index('<button class="gearb" data-settings aria-label="Settings">');j=s.index('</button>',i)+len('</button>')
    s=s[:j]+'</div>'+s[j:]
    # Finances page: no alerts pill, no Alerts or Spending insights tiles
    rep("<button class=\"sbtn alt\" data-x=\"open\" data-v=\"alerts\" aria-label=\"Alerts\">'+(al?al+' alert'+(al>1?'s':''):'No alerts')+'</button>","")
    rep("+tile('alerts','bell','Alerts',al?al+' to review':'All clear')","")
    rep("'<button class=\"xtile\" data-x=\"nav\" data-v=\"insights\"><span class=\"ico\">'+ic('trend')+'</span><b>Spending insights</b><small>Where your money goes</small></button>'+","")
    # badge moves from the Finances tab to the bell
    rep("const bd=document.getElementById('tb-bdg');if(bd){const n=alerts().length;bd.textContent=n;bd.hidden=!n}","const bd=document.getElementById('tb-bdg');if(bd)bd.hidden=true;const hb=document.getElementById('hd-bell-c');if(hb){const n=alerts().length;hb.textContent=n;hb.hidden=!n;const bb=document.getElementById('hd-bell');if(bb)bb.setAttribute('aria-label',n?n+' alerts':'Alerts')}")
    # Finances hold menu no longer leads with Alerts
    rep("const items=(al?[{ic:'bell',t:'Alerts',s:al+' to review',fn:wx('alerts')}]:[]).concat([","const items=([]).concat([")
    css='.hdacts{margin-left:auto;display:flex;gap:6px;align-items:center}.hdacts .gearb{margin-left:0!important;position:relative}\n.hdc{position:absolute;top:-4px;right:-5px;min-width:17px;height:17px;border-radius:99px;background:var(--bad);color:#fff;font-size:10.5px;font-weight:800;font-style:normal;display:grid;place-items:center;padding:0 4px;box-shadow:0 0 0 2px var(--bg,#e4f1e8)}\n@media (max-width:374px){.hdacts{gap:4px}.hdacts .gearb{width:38px!important;height:38px!important;border-radius:12px!important}.hdacts .gearb svg{width:20px;height:20px}header.top .brand h1{font-size:23px!important}header.top .brand{gap:6px!important}header.top .logo{width:38px!important;height:38px!important}.hdstreak{padding-left:9px!important;padding-right:9px!important}}\n'
    i=s.index('</style>');s=s[:i]+css+s[i:]
    return s
_orig10=apply
def apply(s):
    s=_orig10(s)
    b='// ---------- boot ----------'
    s=s.replace(b,open('lpdrag.js').read()+'\n'+b)
    css='.lpm-i.hl{background:color-mix(in srgb,var(--accent) 18%,var(--panel));transform:scale(1.015);transition:transform .12s ease,background .12s}\n.lpm-i.hl.bad{background:color-mix(in srgb,var(--bad) 10%,var(--panel))}\n.lpm-card,.lpm{touch-action:none}\n.lp-lift,html.lp-hold,html.lp-hold *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}\n'
    i=s.index('</style>');s=s[:i]+css+s[i:]
    return s
_orig11=apply
def apply(s):
    s=_orig11(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # per-account storage shim at the very top of the app script
    rep('<script>\n(function(){\n','<script>\n(function(){\n'+open('acct_shim.js').read())
    # cloud docs live under the account
    rep("const docPath=()=>'data/users/'+uid+'/state';","const docPath=()=>'data/users/'+uid+'/a_'+ACC+'_state';")
    rep("db.doc('data/users/'+uid+'/backup')","db.doc('data/users/'+uid+'/a_'+ACC+'_backup')",2)
    rep("const histDoc=()=>'data/users/'+uid+'/history';","const histDoc=()=>'data/users/'+uid+'/a_'+ACC+'_history';")
    # splash can be awaited more than once
    rep('async function splashDone(){','let SPLASHED=null;function splashDone(){return SPLASHED||(SPLASHED=splashRun())}\nasync function splashRun(){')
    # new boot: sign up or log in before anything else
    i=s.index('async function boot(){');j=s.index('function showLoadError(){',i)
    s=s[:i]+open('acct_boot.js').read()+s[j:]
    b='// ---------- boot ----------'
    s=s.replace(b,open('acct.js').read()+'\n'+b)
    # settings
    rep("case 'signout':toast('Signed out (demo). Your data stays saved.');break;","case 'signout':acctSignOut();break;")
    rep("<small>'+(plus?'Sprout Plus · demo trial':'Free plan')+'</small>","<small>'+esc((acctMe()||{}).email||'')+'</small><small>'+(plus?'Sprout Plus · demo trial':'Free plan')+'</small>")
    rep("sgroup('Preferences',[srow('moon'","sgroup('Account',[srow('users','Account details','','data-x=\"open\" data-v=\"acctinfo\"'),srow('lock',(acctMe()||{}).pwh?'Change password':'Add a password','','data-x=\"open\" data-v=\"pwchange\"'),srow('trash','Delete account','','data-x=\"open\" data-v=\"acctdel\"')])+sgroup('Preferences',[srow('moon'")
    rep("<label class=\"f\">Email (demo)<input id=\"pf-mail\" type=\"email\" value=\"'+esc(p.email||'')+'\" placeholder=\"you@example.com\"></label>","<label class=\"f\">Email<input id=\"pf-mail\" type=\"email\" readonly value=\"'+esc((acctMe()||{}).email||'')+'\"></label>")
    rep("demoNote('Your photo, name and bio show on your posts, comments and leagues. Your photo is stored with your Sprout data.')","demoNote('Your photo, name and bio show on your posts, comments and leagues. They’re saved to your account. Change your email or legal name in Account details.')")
    rep("p.email=($('#pf-mail').value||'').trim();","")
    i=s.index('</style>');s=s[:i]+open('acct.css').read()+s[i:]
    return s
_orig12=apply
def apply(s):
    s=_orig12(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # iPhone draws a dark highlight box over tapped buttons unless told not to
    rep("{sym:'⌁',t:'Scan a screenshot'","{ic:'cam',t:'Scan a screenshot'")
    rep("Object.assign(IC,{trash:","Object.assign(IC,{cam:'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',trash:")
    css='''html{-webkit-tap-highlight-color:transparent}
button,a,label,summary,[role=button],[data-x],[data-tab],.tb{-webkit-tap-highlight-color:transparent}
svg{-webkit-user-drag:none}
.tb svg,.gearb svg,.fab svg{pointer-events:none}
.tb.fab i{transition:transform .15s cubic-bezier(.2,.8,.2,1),box-shadow .15s}
.tb.fab:active i{transform:scale(.92)}
.tb:focus:not(:focus-visible){outline:none}
'''
    i=s.index('</style>');s=s[:i]+css+s[i:]
    return s
_orig13=apply
def apply(s):
    s=_orig13(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # two "do it for me" runs started close together no longer trip over each other
    rep("function runSteps(kind,id,labels,finish){NEGOT={kind,id,n:0};xRender();const tick=()=>{NEGOT.n++;",
        "function runSteps(kind,id,labels,finish){const me={kind,id,n:0};NEGOT=me;xRender();const tick=()=>{if(NEGOT!==me){finish();return}NEGOT.n++;")
    return s
_orig14=apply
def apply(s):
    s=_orig14(s)
    # The publisher replaces the page skeleton (and its first <style>) with its own,
    # so any CSS that landed in that block never reached the live app. Move it into
    # the app's own stylesheet, first, so the cascade is exactly what the tests see.
    R='[hidden]:not([hidden=until-found i]){display:none!important}'
    i=s.index('<style>');j=s.index('</style>',i);k=s.index(R,i)+len(R)
    assert k<=j
    extra=s[k:j]
    s=s[:k]+s[j:]
    t=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>')
    s=s[:t]+'\n'+extra+'\n'+s[t:]
    return s
_orig15=apply
def apply(s):
    s=_orig15(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('plus.js').read()+'\n'+b)
    rep("leftCard()+dueSoonHTML()+(short?","leftCard()+plusCard()+dueSoonHTML()+(short?")
    rep("sgroup('Your plan',[","plusSetCard()+sgroup('Your plan',[")
    rep("this milestone earns <b>'+money0(c)+'</b> back.","this milestone earns <b>'+money0(c)+'</b> in Plus credit (terms apply).")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>')
    i=s.index('</style>',i);s=s[:i]+open('plus.css').read()+s[i:]
    return s
_orig16=apply
def apply(s):
    s=_orig16(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    rep("stickCard()+growthCard()+","stickCard()+")
    b='// ---------- boot ----------'
    s=s.replace(b,open('home_order.js').read()+'\n'+b)
    css='#stk-body .stkplant{margin:0 0 4px;box-shadow:none;cursor:default}#stk-body .stkplant .gcv{border-radius:22px 22px 0 0}\n'
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+css+s[i:]
    return s
_orig17=apply
def apply(s):
    s=_orig17(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # health score: a thin ring with the number sitting cleanly inside and the label underneath
    rep("""'<div class="ovring" data-pk="ovh" data-p="'+hs+'"><b>'+hs+'</b><small>health</small></div></button>'""",
        """'<div class="ovscore '+(hs>=60?'ok':hs>=40?'mid':'low')+'" aria-label="Money health '+hs+' out of 100"><span class="ovsr"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="t" cx="32" cy="32" r="27"/><circle class="f" cx="32" cy="32" r="27" pathLength="100" style="stroke-dasharray:'+Math.max(1,Math.min(100,hs))+' 100"/></svg><b>'+hs+'</b></span><small>Health</small><em>'+(hs>=80?'Strong':hs>=60?'Good':hs>=40?'Fair':'Needs care')+'</em></div></button>'""")
    css='''.ovscore{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px}
.ovsr{position:relative;width:64px;height:64px;display:block}
.ovsr svg{width:64px;height:64px;transform:rotate(-90deg);display:block}
.ovsr circle{fill:none;stroke-width:6}
.ovsr .t{stroke:rgba(255,255,255,.75)}
.ovsr .f{stroke:var(--accent);stroke-linecap:round;animation:ovsc 1.1s cubic-bezier(.2,.8,.2,1) both}
.ovscore.mid .f{stroke:#e3a008}.ovscore.low .f{stroke:var(--bad)}
.ovsr b{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--f-body);font-size:19px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--ink)}
.ovscore small{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.02em;margin-top:4px;line-height:1}
.ovscore em{font-style:normal;font-size:12px;font-weight:800;color:var(--good);line-height:1.1}
.ovscore.mid em{color:#b26a00}.ovscore.low em{color:var(--bad)}
@keyframes ovsc{from{stroke-dasharray:0 100}}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .ovsr .t{stroke:rgba(255,255,255,.12)}}
html[data-theme=dark] .ovsr .t{stroke:rgba(255,255,255,.12)}
@media (prefers-reduced-motion:reduce){.ovsr .f{animation:none}}
'''
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+css+s[i:]
    return s
_orig18=apply
def apply(s):
    s=_orig18(s)
    b='// ---------- boot ----------'
    s=s.replace(b,open('health2.js').read()+'\n'+b)
    css='''.ovsr b{font-family:var(--f-big)!important;font-weight:600!important;font-size:23px!important;letter-spacing:-.02em!important;font-variation-settings:'SOFT' 100}
.hlever{margin:4px 0 2px;font-size:13.5px;line-height:1.45;color:var(--muted);background:var(--good-wash);border-radius:14px;padding:10px 12px}.hlever b{color:var(--good)}
.hpil{background:var(--panel);border-radius:18px;padding:12px 14px 4px;margin-top:10px}
.hpilh{display:flex;justify-content:space-between;align-items:baseline}.hpilh b{font-family:var(--f-big);font-size:18px;font-weight:600;font-variation-settings:'SOFT' 100}.hpilh span{font-size:13px;font-weight:800;color:var(--good);font-variant-numeric:tabular-nums}
.hpbar{height:7px!important;margin:6px 0 4px}
.hpil .hf{border-top:1px solid var(--line)}
.hnote{margin:12px 2px 0;font-size:12px;color:var(--muted);line-height:1.5}
'''
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+css+s[i:]
    return s
_orig19=apply
def apply(s):
    s=_orig19(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # net worth milestones: a progress bar to the next one and a tidy vertical timeline (no sideways scrolling)
    rep("""(next?'<div class="xcard"><h3>Milestones</h3><div class="nwms">'+reached.map(r=>'<div class="on"><b>'+kfmt(r[0])+'</b><small>'+(r[1]?'Reached '+r[1]:'Reached')+'</small></div>').join('')+'<div class="nx"><b>'+kfmt(next)+'</b><small>'+(mo?'About '+mo+' mo away':money0(next-n.N)+' to go')+'</small></div></div></div>':'')+""",
        """(next!=null?(()=>{const lo=prev.length?prev[prev.length-1]:Math.min(n.N,-(+state.startDebt||0)),pc=Math.max(3,Math.min(100,(n.N-lo)/Math.max(1,next-lo)*100));
      return '<div class="xcard nwmsc"><div class="nwmsh"><h3>Milestones</h3><span>'+reached.length+' reached</span></div>'+
       '<div class="nwnext"><div class="nwnt"><span>'+(next===0?'Next: break even':'Next milestone')+'</span><b>'+kfmt(next)+'</b></div><div class="nwnbar"><i style="width:'+pc.toFixed(0)+'%"></i></div><div class="nwnl"><span>'+money0(next-n.N)+' to go</span><span>'+(mo?'About '+mo+' month'+(mo>1?'s':'')+' at your pace':'Keep going')+'</span></div></div>'+
       (reached.length?'<ol class="nwtl">'+reached.map(r=>'<li class="on"><i></i><b>'+kfmt(r[0])+'</b><span>'+(r[1]?'Reached '+r[1]:'Reached')+'</span></li>').join('')+'<li class="nx"><i></i><b>'+kfmt(next)+'</b><span>'+(mo?'Around '+new Date(Date.now()+mo*30.4*864e5).toLocaleDateString(undefined,{month:'short',year:'numeric'}):'Up next')+'</span></li></ol>':'<p class="nwfirst">Your first milestone is breaking even: owning more than you owe. Every payment moves the bar.</p>')+'</div>'})():'')+""")
    css='''.nwmsh{display:flex;justify-content:space-between;align-items:baseline}.nwmsh h3{margin:0}.nwmsh span{font-size:12.5px;font-weight:700;color:var(--muted)}
.nwnext{background:var(--wash);border-radius:16px;padding:12px 14px;margin:10px 0 6px}
.nwnt{display:flex;justify-content:space-between;align-items:baseline}.nwnt span{font-size:13px;font-weight:700;color:var(--muted)}.nwnt b{font-family:var(--f-big);font-size:24px;font-weight:600;font-variation-settings:'SOFT' 100}
.nwnbar{height:8px;border-radius:99px;background:var(--panel);overflow:hidden;margin:8px 0 6px}.nwnbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8fd3a7,var(--accent));animation:nwgrow 1s cubic-bezier(.2,.8,.2,1) both}
.nwnl{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;font-weight:700;color:var(--muted)}.nwnl span:first-child{color:var(--good)}
.nwtl{list-style:none;margin:6px 0 0;padding:0 0 0 2px}
.nwtl li{position:relative;display:flex;align-items:baseline;gap:10px;padding:7px 0 7px 26px}
.nwtl li i{position:absolute;left:0;top:11px;width:14px;height:14px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--good-wash)}
.nwtl li.nx i{background:var(--panel);box-shadow:inset 0 0 0 2px var(--accent)}
.nwtl li:not(:last-child)::before{content:'';position:absolute;left:6px;top:24px;bottom:-11px;width:2px;background:color-mix(in srgb,var(--accent) 35%,var(--line))}
.nwtl li.on:nth-last-child(2)::before{background:linear-gradient(var(--accent),var(--line))}
.nwtl b{font-family:var(--f-big);font-size:18px;font-weight:600;min-width:58px;font-variation-settings:'SOFT' 100}.nwtl span{font-size:13px;font-weight:600;color:var(--muted)}
.nwtl li.nx b{color:var(--good)}
.nwfirst{margin:4px 2px 0;font-size:13px;color:var(--muted);line-height:1.45}
'''
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+css+s[i:]
    return s
_orig20=apply
def apply(s):
    s=_orig20(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('savings.js').read()+'\n'+b)
    rep("tile('vault','vault','Savings vault',money0(v.bal)+' saved (demo)')","tile('vault','vault','Savings',(SV().accts.length?money0(SV().bal)+' tracked':'Track your savings'))")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('savings.css').read()+s[i:]
    return s
_orig21=apply
def apply(s):
    s=_orig21(s)
    b='// ---------- boot ----------'
    s=s.replace(b,open('subdetect.js').read()+'\n'+b)
    return s
_orig22=apply
def apply(s):
    s=_orig22(s)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('density.css').read()+s[i:]
    return s
_orig23=apply
def apply(s):
    s=_orig23(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('icons.js').read()+'\n'+b)
    rep("""<span class="catic">'+p.ic+'</span>""","""<span class="catic hasico">'+catIcon(p.k)+'</span>""")
    rep("""<span class="lce">'+E[c[0]]+'</span>""","""<span class="lce hasico">'+catIcon(c[0],'sm')+'</span>""")
    rep("""<b style="flex:1;font-size:15px">'+c[1]+'</b>""","""<span class="budh">'+catIcon(c[0]==='oth'?'misc':c[0],'sm')+'<b style="font-size:15px">'+c[1]+'</b></span>""")
    rep("""(it.sym?'<i>'+it.sym+'</i>'""","""(it.sym?'<i>'+symIcon(it.sym)+'</i>'""")
    for e in ['🥬','🍵','🚲','🛍️','♻️','🍏','🎉','💵','🌱','🍀']:
        rep("'"+e+"'","''")
    rep("E={groc:'🛒',din:'🍜',gas:'⛽'}","E={}")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('icons.css').read()+s[i:]
    return s
_orig24=apply
def apply(s):
    s=_orig24(s)
    b='// ---------- boot ----------'
    s=s.replace(b,open('faceid.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('faceid.css').read()+s[i:]
    return s
_orig25=apply
def apply(s):
    s=_orig25(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('safety.js').read()+'\n'+b)
    rep("<h1>Community</h1><small>You’re not in this alone</small>","<h1>Community</h1><small>You’re not in this alone · <button class=\"lnk\" data-x=\"cguideopen\">Guidelines</button></small>")
    # legal page lists the community guidelines too
    rep("['est','How savings estimates work',''],","['est','How savings estimates work',''],['cguide','Community guidelines',''],")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('safety.css').read()+s[i:]
    return s
_orig26=apply
def apply(s):
    s=_orig26(s)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('density2.css').read()+s[i:]
    return s
_orig27=apply
def apply(s):
    s=_orig27(s)
    a="&family=Manrope:wght@400;500;600;700;800&display=swap"
    assert s.count(a)==1
    s=s.replace(a,"&family=Manrope:wght@400;500;600;700;800&family=Roboto:wght@500&display=swap")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('zen.css').read()+s[i:]
    return s
_orig28=apply
def apply(s):
    s=_orig28(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('referral.js').read()+'\n'+b)
    rep("const plusOn=()=>{const x=X();return !!(x.plus&&x.plus.on)};","const plusOn=()=>plusIs();")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('referral.css').read()+s[i:]
    return s
_orig29=apply
def apply(s):
    s=_orig29(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('postmenu.js').read()+'\n'+b)
    rep("sgroup('Account',[srow('users','Account details'","(modOK()?sgroup('Moderation',[srow('info','Review reports',(SR().reports.filter(r=>r.status==='open').length||'')+'','data-x=\"open\" data-v=\"modq\"')]):'')+sgroup('Account',[srow('users','Account details'")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('postmenu.css').read()+s[i:]
    return s
_orig30=apply
def apply(s):
    s=_orig30(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    rep("""</span><small>Health</small><em>'+(hs>=80?'Strong':hs>=60?'Good':hs>=40?'Fair':'Needs care')+'</em>""","""</span><span class="ovtx"><small>Budget score</small><em>'+(hs>=80?'Strong':hs>=60?'Good':hs>=40?'Fair':'Needs care')+'</em></span>""")
    rep('aria-label="Money health \'+hs+\' out of 100"','aria-label="Budget score \'+hs+\' out of 100"')
    rep('<span class="mt"><b>Money health</b>','<span class="mt"><b>Budget score</b>')
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('bscore.css').read()+s[i:]
    return s
_orig31=apply
def apply(s):
    s=_orig31(s)
    b='// ---------- boot ----------'
    s=s.replace(b,open('pull.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('pull.css').read()+s[i:]
    return s
_orig32=apply
def apply(s):
    s=_orig32(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    b='// ---------- boot ----------'
    s=s.replace(b,open('tiers.js').read()+'\n'+b)
    rep("<small>Preview paid plans. No charge in the demo.</small>","<small>See what’s free and what Plus adds</small>")
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('tiers.css').read()+s[i:]
    return s
_orig33=apply
def apply(s):
    s=_orig33(s)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('logo.css').read()+s[i:]
    j=s.index('<title>Sprout v2</title>\n<style>');s=s[:j]+open('icon_head.html').read()+s[j:]
    return s
_orig34=apply
def apply(s):
    s=_orig34(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # small sprouts in the brand green use the logo's three greens: dark stem, mid right leaf, light left leaf
    rep('''const LEAF=(n,c)=>'<svg class="'+(n||'')+'" viewBox="0 0 24 24" aria-hidden="true"'+(n?'':' width="26" height="26"')+'><path d="M12 22v-9" stroke="'+c+'" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M12 14c0-5 3.5-9 9-9 0 6-3.5 9.5-9 9z" fill="'+c+'"/><path d="M12 16c0-3.5-2.5-6.5-8-6.5 0 4.5 3 7 8 6.5z" fill="'+c+'" opacity=".6"/></svg>\'''',
        '''const LEAF=(n,c)=>{const g=c==='#2fae5a'||c==='#1f7a42'||c==='#27994f';const s=g?'#1f7a42':c,r=g?'#2fae5a':c,l=g?'#6fcf8f':c,o=g?'1':'.6';return '<svg class="'+(n||'')+'" viewBox="0 0 24 24" aria-hidden="true"'+(n?'':' width="26" height="26"')+'><path d="M12 22v-9" stroke="'+s+'" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M12 14c0-5 3.5-9 9-9 0 6-3.5 9.5-9 9z" fill="'+r+'"/><path d="M12 16c0-3.5-2.5-6.5-8-6.5 0 4.5 3 7 8 6.5z" fill="'+l+'" opacity="'+o+'"/></svg>'}''')
    return s

_orig35=apply
def apply(s):
    s=_orig35(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # bank data carries Plaid's id and category through the import pipeline
    rep("const r={d:r0.d,a:flip?-r0.a:r0.a,m:r0.m,p:!!r0.p};","const r={d:r0.d,a:flip?-r0.a:r0.a,m:r0.m,p:!!r0.p,pfc:r0.pfc,pfd:r0.pfd};")
    rep("const row={k,d:r.d,a:r.a,m:r.m,p:r.p,acct,kind,inc:true};","const row={k,d:r.d,a:r.a,m:r.m,p:r.p,acct,kind,inc:true,pid:r0.pid,pfc:r0.pfc,pfd:r0.pfd};")
    rep("HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.cat,p:r.p?1:0});","HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.cat,p:r.p?1:0,f:r.pfd||undefined});")
    rep("if(r.p)e.pending=true;if(r.kind==='card')e.card=true;","if(r.p)e.pending=true;if(r.kind==='card')e.card=true;if(r.pfd)e.pfd=r.pfd;")
    rep("const byAcct={};D.txns.forEach(t=>{(byAcct[t.acct]=byAcct[t.acct]||{kind:t.kind,rows:[]}).rows.push({d:t.d,a:t.a,m:t.m,p:t.p})});","const byAcct={};D.txns.forEach(t=>{(byAcct[t.acct]=byAcct[t.acct]||{kind:t.kind,rows:[]}).rows.push({d:t.d,a:t.a,m:t.m,p:t.p,pid:t.pid,pfc:t.pfc,pfd:t.pfd})});")
    # budgets use the bank's category when the store name alone doesn't say
    rep("const add=(m,a)=>{const hit=BCATS.find(c=>c[3]&&c[3].test(m||''));if(!hit&&BILLRX.test(m||''))return;out[(hit||BCATS[5])[0]]+=a};",
        "const add=(m,a,f)=>{const hit=BCATS.find(c=>c[3]&&c[3].test(m||''))||BR.pfdCat(f);if(!hit&&(BILLRX.test(m||'')||BR.pfdBill(f)))return;out[(hit||BCATS[5])[0]]+=a};")
    rep("if(h.c==='Bill'&&!BCATS[4][3].test(h.m))return;add(h.m,-h.a)});","if(h.c==='Bill'&&!BCATS[4][3].test(h.m)&&BR.pfdCat(h.f)!==BCATS[4])return;add(h.m,-h.a,h.f)});")
    rep("if(s.tid||String(s.d).slice(0,7)!==mk||s.cat==='Income'||s.cat==='Bill')return;add(s.note||'',+s.amt)});return out}","if(s.tid||String(s.d).slice(0,7)!==mk||s.cat==='Income'||s.cat==='Bill')return;add(s.note||'',+s.amt,s.pfd)});return out}")
    # demo-only content stays in demo mode once real banks are connected
    rep("const subDemoOn=()=>!!(state.demo||(state.link&&state.link.on));","const subDemoOn=()=>!!(state.demo||(state.link&&state.link.on&&!state.link.live));")
    rep("A.push({id:'dupe',t:'Possible duplicate charge',s:'Chipotle charged $14.20 twice on the same day. Tap to dispute (demo).',go:[]});","if(subDemoOn())A.push({id:'dupe',t:'Possible duplicate charge',s:'Chipotle charged $14.20 twice on the same day. Tap to dispute (demo).',go:[]});")
    rep("A.push({id:'hike',t:hike.name+' went up $2.00',","A.push({id:'hike',t:hike.name+' went up '+money(hike.hike||2),")
    rep("(state.link&&state.link.on?'Connected (demo)':'Your latest balance'","(state.link&&state.link.on?(state.link.live?'Synced from your bank':'Connected (demo)'):'Your latest balance'",2)
    rep("srow('link','Connected accounts',state.link&&state.link.on?'Demo':'','data-x=\"nav\" data-v=\"accts\"')",
        "(LIVE.on?srow('cloud','Bank sync and AI',liveOK()?({owner:'Plus',plus:'Plus',free:'Free'})[LIVE.st.tier]:'Set up','data-x=\"open\" data-v=\"server\"'):''),srow('link','Connected accounts',state.link&&state.link.on?(state.link.live?'Live':'Demo'):'','data-x=\"nav\" data-v=\"accts\"')")
    rep('<button class="btn" data-wact="connect">Connect my accounts (demo)</button>',"<button class=\"btn\" data-wact=\"connect\">'+(LIVE.on&&LIVE.st&&LIVE.st.ready?'Connect my bank':'Connect my accounts (demo)')+'</button>")
    b='// ---------- boot ----------'
    s=s.replace(b,open('brain.js').read()+'\n'+open('live.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('live.css').read()+s[i:]
    return s

_orig36=apply
def apply(s):
    s=_orig36(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # Ask can start Cancel for me and Lower my bills (the page checks what Sprout can do, and the person confirms)
    rep("""Use this whenever they ask if they can afford something or what happens if they spend or buy something. The page calculates the real effect and shows it, so keep "reply" to one short sentence and do not do the math yourself.\n""",
        """Use this whenever they ask if they can afford something or what happens if they spend or buy something. The page calculates the real effect and shows it, so keep "reply" to one short sentence and do not do the math yourself.\n{"type":"cancel_subscription","name":"the service as they said it"}  Use this when they ask Sprout to cancel, stop or get rid of a subscription or membership. The page checks what Sprout can cancel and asks them to confirm, so keep "reply" to one short sentence.\n{"type":"lower_bill","name":"the bill as they said it"}  Use this when they ask Sprout to lower or negotiate a bill.\n""")
    rep("case 'runcancel':runSteps('cancel',v,3,()=>{x.subs[v]={s:'cancelled',at:Date.now()};","case 'runcancel':runSteps('cancel',v,3,()=>{x.subs[v]=Object.assign({},x.subs[v],{s:'cancelled',at:Date.now()});")
    rep("turn.wifs=wifs;turn.items=","turn.wifs=wifs;turn.btns=Array.isArray(res&&res.buttons)?res.buttons.slice(0,6):null;turn.items=")
    rep("'\">'+para(c.ai)+(c.wifs||[]).map(whatIfCard).join('');","'\">'+para(c.ai)+(c.wifs||[]).map(whatIfCard).join('')+askBtns(c.btns);")
    rep("try{sampleFn=await claude.use('sample')}catch(e){sampleFn=null}","try{sampleFn=BRwrap(await claude.use('sample'))}catch(e){sampleFn=null}")
    rep("n:c.length,next,hike,known:!!g.kn})","n:c.length,next,hike,known:!!g.kn,raw:g.raw,last:last.t})")
    b='// ---------- boot ----------'
    s=s.replace(b,open('cancel.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('cancel.css').read()+s[i:]
    return s

_orig37=apply
def apply(s):
    s=_orig37(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # the ledger flags (card payment, transfer, refund) travel with each imported transaction
    rep("if(r.p)e.pending=true;if(r.kind==='card')e.card=true;if(r.pfd)e.pfd=r.pfd;",
        "if(r.p)e.pending=true;if(r.kind==='card')e.card=true;if(r.pfd)e.pfd=r.pfd;if(r.xf&&(r.cat0===undefined||r.cat===r.cat0))e.xf=r.xf;if(r.refund&&r.cat==='Income')e.refund=1;")
    rep("HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.cat,p:r.p?1:0,f:r.pfd||undefined});",
        "HIST.push({k:r.k,d:r.d,a:r.a,m:r.m,ac:r.acct,c:r.cat,p:r.p?1:0,f:r.pfd||undefined,x:r.xf&&(r.cat0===undefined||r.cat===r.cat0)?r.xf:undefined});")
    # Safe to spend on Home explains itself: budget, checking, bills before payday
    rep("""<span class="s">Basics '+money0(Math.max(0,A.info.Everyday.left))+' · Fun '+money0(Math.max(0,A.info.Personal.left))+'</span></div>'+""","""<span class="s">'+LG.heroSub(A)+'</span></div>'+""")
    # private messages are off (Community posts and comments stay)
    rep("""{ic:'send',t:'Messages',s:dmUnread()?dmUnread()+' unread':'',fn:()=>{setTab('community');DMNEW=false;xOpen('inbox')}},""","")
    rep(""".concat(p.mine?[]:[{ic:'send',t:'Message '+p.who,fn:()=>{DMNEW=false;xGo('chat',p.who)}}])""","")
    rep("""<div class="mpact"><button class="btn" data-x="dm" data-v="'+esc(n)+'">'+ic('chat')+'Message</button>""","""<div class="mpact">""")
    rep("""<button class="sbtn alt dmbtn" data-x="inbox" aria-label="Messages">'+ic('chat')+(dmUnread()?'<i class="dmc">'+dmUnread()+'</i>':'')+'</button>""","")
    # screenshots or a screen recording
    rep("SC.imgs=files.slice(0,4)","SC.imgs=files.slice(0,8)")
    rep('<input id="sc-file" type="file" accept="image/*" multiple class="hide">','<input id="sc-file" type="file" accept="image/*,video/*" multiple class="hide">')
    rep("Choose screenshots</b><small>or paste one here. Up to 4 at a time.</small>","Choose screenshots or a screen recording</b><small>Up to 8 screenshots, or a short recording of you scrolling through your transactions.</small>")
    rep("<b>Reading your screenshot…</b>","<b>'+(SC.vid?'Reading your recording…':'Reading your screenshot…')+'</b>")
    rep("""type "transfer" means moving money between the person's own accounts (adding cash, cashing out, transfer to bank). Never invent a transaction you cannot see.`;""",
        """type "transfer" means moving money between the person's own accounts (adding cash, cashing out, transfer to bank). The images can be frames from one screen recording that scrolls, so the same transaction can show up in more than one image: list each transaction once. Never invent a transaction you cannot see.`;""")
    rep("<span><b>Scan a screenshot</b><small>Receipts, Cash App, Venmo, Zelle or your bank app</small>","<span><b>Scan a screenshot</b><small>Or a screen recording. Receipts, Cash App, Venmo, Zelle or your bank app</small>")
    # upcoming payments (pay-later installments, autopays) are read as scheduled, not as spending
    rep(""""type":"purchase"|"p2p"|"transfer"|"refund"|"income"}],"note":""",""""type":"purchase"|"p2p"|"transfer"|"refund"|"income"|"scheduled","provider":"Klarna, Affirm, Afterpay or another pay-later company, if any","plan":"the installment shown, like 2 of 6, if any"}],"note":""")
    rep("""list each transaction once. Never invent a transaction you cannot see.`;""","""list each transaction once. A payment that is upcoming, scheduled, set to autopay or due on a future date has not happened yet: give it type "scheduled" and its due date. For a pay-later installment, name is the store, amount is that one payment (not the plan total), provider is the pay-later company and plan is the installment number. Leave out any field that does not apply, and keep the JSON compact. Never invent a transaction you cannot see.`;""")
    # setup step 1: a clear hint on the payday picker
    rep("""'<label class="f">Next payday'+wi('nextPay','date','')+'</label>')+""","""'<label class="f">Next payday<small>Tap to pick the date of your next paycheck.</small>'+wi('nextPay','date','')+'</label>')+""")
    # streak wording when nothing is left to spend today
    rep("lock?'Locked in for today. Stay under '+money(Math.max(0,left))+' to keep it green.'","lock?(left>0.004?'Locked in for today. Stay under '+money(left)+' to keep it green.':'Locked in for today. Spend nothing else today to keep it green.')")
    rep("'Today is locked in as a <b>green day</b>. Stay under '+money(Math.max(0,d.a-d.s))+' to keep it.","'Today is locked in as a <b>green day</b>. '+(d.a-d.s>0.004?'Stay under '+money(d.a-d.s)+' to keep it.':'Spend nothing else today to keep it.')+'")
    rep("toast('Day locked in. Stay under '+money(Math.max(0,left))+' to keep it green.')","toast(left>0.004?'Day locked in. Stay under '+money(left)+' to keep it green.':'Day locked in. Spend nothing else today to keep it green.')")
    b='// ---------- boot ----------'
    s=s.replace(b,open('ledger.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('ledger.css').read()+s[i:]
    return s

_orig38=apply
def apply(s):
    s=_orig38(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # clearer names for the two ways to see transactions
    rep("[['cat','Breakdown'],['list','History']]","[['cat','By category'],['list','All transactions']]")
    # generic tips read like financial advice: the plan's own what-if switches stay
    i=s.index('<details class="sub"><summary>Other ways to close a gap</summary>');j=s.index('</ul></details>',i)+len('</ul></details>');s=s[:i]+s[j:]
    b='// ---------- boot ----------'
    s=s.replace(b,open('polish.js').read()+'\n'+b)
    i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open('polish.css').read()+s[i:]
    return s

_orig39=apply
def apply(s):
    s=_orig39(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # what you owe can grow (pay-later plans), so it is a function other modules can extend
    rep("const totalDebt=()=>state.debts.reduce((a,d)=>a+ +d.bal,0);","let totalDebt=()=>state.debts.reduce((a,d)=>a+ +d.bal,0);")
    # the Debt card on Home includes what's left on pay-later plans, matching Net worth
    rep("const debtNow=E.debts.reduce((a,d)=>a+ +d.bal,0),","const debtNow=E.debts.reduce((a,d)=>a+ +d.bal,0)+(typeof PL!=='undefined'?PL.owed():0),")
    # Log: type or say it, Sprout fills in the rest
    rep('<div class="ph"><h2 id="sh-spend-t">Add a transaction</h2><button type="button" class="lnk" data-close>Done</button></div>','<div class="ph"><h2 id="sh-spend-t">Add a transaction</h2><button type="button" class="lnk" data-close>Done</button></div><div class="qlog"><div class="qlrow"><input id="ql-in" type="text" placeholder="Type or say it, like 12 at Chipotle" autocomplete="off" autocapitalize="off" enterkeyhint="done" aria-label="Type or say what you spent"><button type="button" class="qlmic" data-qlmic aria-label="Say it"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3.5"/></svg></button></div><div id="ql-out"></div></div>')
    # the checking card says where its number comes from
    rep("(Math.abs(sinceSpent())>0.004?'Estimated from your last check-in':'From your last check-in')","((typeof F2!=='undefined'&&F2.chkLabel())||(Math.abs(sinceSpent())>0.004?'Estimated from your last check-in':'From your last check-in'))")
    # insights live in Spending now: no separate chart button in the header
    rep('<button class="gearb" data-x="nav" data-v="insights" aria-label="Spending insights" title="Spending insights"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></button>','')
    rep('<button class="mitem" data-nav="insights"><i>▤</i>Spending insights</button>','<button class="mitem" data-nav="insights"><i>▤</i>Spending</button>')
    rep('<button class="mitem" data-nav="edit"><i>✎</i>Edit numbers</button>','<button class="mitem" data-nav="edit"><i>✎</i>Your plan</button>')
    rep('<h2>Transactions</h2><button class="lnk" id="tx-add">','<h2>Spending</h2><button class="lnk" id="tx-add">')
    rep('<b>Edit numbers</b><small id="s-edit">','<b>All numbers</b><small id="s-edit">')
    s=s.replace('in Edit numbers','in Your plan').replace('Use Edit numbers below','Use Your plan')
    b='// ---------- boot ----------'
    for f in ['rc.js','pl.js','icons2.js','fin2.js','spend.js','sg.js','ask2.js','notify.js','cal2.js','credit2.js','passkey.js']:
        if os.path.exists(f):s=s.replace(b,open(f).read()+'\n'+b)
    for f in ['smart.css','type.css']:
        if os.path.exists(f):
            i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open(f).read()+s[i:]
    return s

# ---------- batch 2026-10-22: one set of numbers, budgets that don't fight each other, and the redesigns ----------
_orig40=apply
B40_JS=['truth.js','budget3.js','fin3.js','home3.js','nw3.js','cal3.js','whatif3.js','rc2.js','cat3.js','alerts3.js','job3.js','ask3.js','spend3.js','feel.js','scan3.js','credit3.js']
B40_CSS=['b3.css','f3.css','h3.css','c3.css','feel.css']
def apply(s):
    s=_orig40(s)
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:80],s.count(a));s=s.replace(a,b)
    # extra money goes to debts in your chosen order (highest rate first by default), including cards linked from the bank
    rep("st.debts.forEach(d=>{if(!d.extra)return;const n=d.name;a=Math.min(avail,Math.max(0,ai[n]-mn[n]));ex[n]=Math.round(a*100)/100;avail-=a});",
        "(typeof MX!=='undefined'?MX.order(st):st.debts.filter(d=>d.extra)).forEach(d=>{const n=d.name;if(!(n in ai))return;a=Math.min(avail,Math.max(0,ai[n]-mn[n]-(skPaid[n]||0)));a=Math.round(a*100)/100;ex[n]=(ex[n]||0)+a;avail-=a});")
    # a budget can be $0
    rep("const budLim=c=>{const v=X().bud[c[0]];return v>0?v:c[2]};","const budLim=c=>{const v=X().bud[c[0]];return v!=null&&v!==''&&isFinite(+v)&&+v>=0?+v:c[2]};")
    # pages opened with a detail (a bill, a category) get that detail
    rep("else if(v==='calendar'){CALS=null;xGo(v)}else xGo(v);break}","else if(v==='calendar'){CALS=null;xGo(v,w)}else xGo(v,w);break}")
    # the day-by-day balance counts money given back too (a what-if that spends less)
    rep("const its=R.items.filter(x=>x.t>=r.d0&&x.t<r.d1&&x.a>0.004);","const its=R.items.filter(x=>x.t>=r.d0&&x.t<r.d1&&Math.abs(x.a)>0.004);")
    # other regular income is planned like a paycheck
    rep("const got=st.gotPay||{};payDates(st,asOf).forEach(t=>{if(!got[fd(t)])ev.push({t,inc:+st.pay,lab:'Paycheck'})});","const got=st.gotPay||{};payDates(st,asOf).forEach(t=>{if(!got[fd(t)])ev.push({t,inc:+st.pay,lab:'Paycheck'})});if(typeof JOB!=='undefined')JOB.addInc(ev,st,asOf);")
    # no pinch or double-tap zoom
    rep('<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">','<meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">')
    # scans know Cash App Borrow: borrowed money is a debt, and its repayment is scheduled
    rep('"type":"purchase"|"p2p"|"transfer"|"refund"|"income"|"scheduled",','"type":"purchase"|"p2p"|"transfer"|"refund"|"income"|"scheduled"|"borrow",')
    rep('Leave out any field that does not apply, and keep the JSON compact. Never invent a transaction you cannot see.`;','Money received from Cash App Borrow or another cash-advance app is type "borrow", not income; a Borrow repayment due later is type "scheduled" with provider "Cash App Borrow". Leave out any field that does not apply, and keep the JSON compact. Never invent a transaction you cannot see.`;')
    # clearer label for bills in the transaction list
    rep("c==='Bill'?'Bill/payment':","c==='Bill'?'Bill or payment':")
    # no em dashes anywhere on screen: empty values show an en dash
    s=s.replace("'—'","'–'")
    b='// ---------- boot ----------'
    for f in B40_JS:
        s=s.replace(b,open(f).read()+'\n'+b)
    for f in B40_CSS:
        i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open(f).read()+s[i:]
    return s

_orig41=apply
B41_JS=['plan4.js']
B41_CSS=[]
def apply(s):
    s=_orig41(s)
    b='// ---------- boot ----------'
    for f in B41_JS:
        s=s.replace(b,open(f).read()+'\n'+b)
    for f in B41_CSS:
        i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open(f).read()+s[i:]
    return s

# ---------- batch 2 (2026-10-22 pm): charts, net worth, debts, calendar, ask, log, theme ----------
_orig42=apply
B42_JS=['splash_lines.js','chart4.js','nw4.js','debt4.js','cal4.js','spend4.js','home4.js','budget4.js','bill4.js','alerts4.js','tabs4.js','plus4.js','sync4.js','ask_examples.js','ask4.js','log4.js','theme4.js']
B42_CSS=['c4.css','theme4.css']
def apply(s):
    s=_orig42(s)
    b='// ---------- boot ----------'
    s=s.replace("toast(left>0.004?'Day locked in. Stay under '+money(left)+' to keep it green.':'Day locked in. Spend nothing else today to keep it green.')","toast(left>0.004?'Day locked in. '+money(left)+' of today’s amount is left.':'Day locked in. Today’s amount is used up.')")
    s=s.replace("(left>0.004?'Locked in for today. Stay under '+money(left)+' to keep it green.':'Locked in for today. Spend nothing else today to keep it green.')","(left>0.004?'Locked in for today. '+money(left)+' of today’s amount is left.':'Locked in for today. Today’s amount is used up.')")
    s=s.replace('const QL={};','const QL=window.QL={};')
    for f in B42_JS:
        s=s.replace(b,open(f).read()+'\n'+b)
    for f in B42_CSS:
        i=s.index('<title>Sprout v2</title>\n<style>')+len('<title>Sprout v2</title>\n<style>');i=s.index('</style>',i);s=s[:i]+open(f).read()+s[i:]
    return s
