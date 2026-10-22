s=open('sprout_v2.html').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a))
    s=s.replace(a,b)
rep('</style>\n',open('x_set.css').read()+'</style>\n')
gear='<button class="gearb" data-settings aria-label="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>\n    '
rep('<button class="hamb" id="open-menu"',gear+'<button class="hamb" id="open-menu"')
for n in ['accts','import','redo','backup','how']:
    rep('<button class="mitem" data-nav="%s">'%n,'<button class="mitem mhide" data-nav="%s" tabindex="-1" aria-hidden="true">'%n)
rep('<i>i</i>How Sprout works</button>','<i>i</i>How Sprout works</button>\n    <button class="mitem" data-settings><i>⚙</i>Settings</button>')
s=s.replace("document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#open-settings'))","document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-settings]'))")
rep('// ---------- boot ----------',open('x_set.js').read()+'\n// ---------- boot ----------')
rep("accts:{}, link:null,","accts:{}, link:null, prefs:null,")
rep("if(loaded)state=merge(loaded);","if(loaded)state=merge(loaded);\n  {let lp=null;try{lp=JSON.parse(lsGet(PREFS_LS)||'null')}catch(e){}if(lp&&!state.prefs)state.prefs=Object.assign({},lp)}applyPrefs();")
rep("setView('ov');await splashDone();","setView('ov');await splashDone();if(P().lock)showLock();")
rep("function confetti(){if(RM)return;","function confetti(){if(RM||(state.prefs&&state.prefs.noconf))return;")
rep("linear-gradient(#dff3e6,var(--mintcream))","linear-gradient(var(--sky),var(--mintcream))")
rep('fill="#0f2a1c"','style="fill:var(--hero-ink)"')
open('sprout_v2.html','w').write(s)
