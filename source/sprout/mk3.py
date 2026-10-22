s=open('sprout_v2_base.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:60],s.count(a))
    s=s.replace(a,b)
css=open('x_css.css').read()
rep('</style>\n',css+'</style>\n')
tab=lambda n,l,ico,ex='': '<button class="tb" data-tab="%s"%s><svg viewBox="0 0 24 24" aria-hidden="true"><path d="%s"/></svg>%s</button>'%(n,ex,ico,l)
nav='''<nav class="dock tabbar" aria-label="Main">
  <button class="tb on" data-tab="home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4z"/></svg>Home</button>
  <button class="tb" data-tab="money"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 2.8 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"/></svg>Money<span class="bdg" id="tb-bdg" hidden>0</span></button>
  <button class="tb fab" id="open-spend" aria-label="Log spend"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></i>Log</button>
  <button class="tb" data-tab="community"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6"/></svg>Community</button>
  <button class="tb" id="open-ask"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Ask</button>
</nav>'''
i=s.index('<nav class="dock" aria-label="Quick actions">');j=s.index('</nav>',i)+6
s=s[:i]+nav+s[j:]
rep('<section id="ov" class="ov" aria-label="Overview"></section>','<section id="ov" class="ov" aria-label="Overview"></section>\n  <section id="pg" aria-label="Page"></section>')
rep('<div class="sheet" id="sh-ins" hidden>','''<div class="sheet" id="sh-x" hidden>
  <div class="scrim" data-close></div>
  <div class="panel tall" role="dialog" aria-modal="true" aria-labelledby="x-t">
    <div class="grab"></div>
    <div class="ph"><h2 id="x-t"></h2><button type="button" class="lnk" data-close>Done</button></div>
    <div id="x-body" style="display:flex;flex-direction:column;gap:12px"></div>
  </div>
</div>
<div class="sheet" id="sh-ins" hidden>''')
rep('// ---------- boot ----------',open('x_money.js').read()+'\n'+open('x_soc.js').read()+'\n// ---------- boot ----------')
rep("function setView(v,target){VIEW=v;","function setView(v,target){VIEW=v;document.body.classList.remove('view-tab');tbSync();")
rep("function overview(){","function overview(){if(VIEW==='tab')setTimeout(pgRender,0);setTimeout(tbSync,0);")
rep("+syncChip()+growthCard()+","+syncChip()+homeAlert()+growthCard()+")
rep("const agoTxt=","function homeAlert(){const a=alerts();return a.length?'<button class=\"xalert\" data-x=\"open\" data-v=\"alerts\" style=\"margin-bottom:10px\">'+ic('bell')+'<span style=\"flex:1\">'+esc(a[0].t)+(a.length>1?' · +'+(a.length-1)+' more':'')+'</span>›</button>':''}\nconst agoTxt=")
rep("<title>Sprout v2</title>","<title>Sprout v2</title>")
open('sprout_v2.html','w').write(s)
