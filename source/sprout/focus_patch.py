def apply(s):
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:70],s.count(a))
        s=s.replace(a,b)
    rep('// ---------- boot ----------',open('focus.js').read()+'\n'+open('hl.js').read()+'\n'+open('fx.js').read()+'\n'+open('cat.js').read()+'\n// ---------- boot ----------')
    rep("<h2>'+(short?'Money gets tight before payday.':'You’re on track.')+'","<h2>'+esc(headline(short))+'")
    rep('</style>\n',open('focus.css').read()+'</style>\n')
    rep("document.addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){setView('detail',g.dataset.goto)}});","document.addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){openFocus(g.dataset.goto)}});")
    rep("const go=n=>{setView('detail','#m-'+(n==='update'?'edit':n))};","const go=n=>{openFocus('#m-'+(n==='update'?'edit':n))};")
    rep("function setView(v,target){VIEW=v;","function setView(v,target){VIEW=v;clearFocus();")
    rep("fn:()=>setView('detail','#t-hero')","fn:()=>openFocus('#t-hero')")
    rep('<div id="coach"></div>','<div id="fbar" class="fbar"></div>\n  <div id="coach"></div>')
    rep("'<button class=\"ovmore\" data-goto=\"\">See everything</button>'","''")
    rep("function overview(){stkTick();lpHint();","function overview(){stkTick();lpHint();setTimeout(fxRefresh,0);")
    return s
