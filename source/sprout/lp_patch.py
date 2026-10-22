def apply(s,v2):
    def rep(a,b,c=1):
        nonlocal s
        assert s.count(a)==c,(a[:70],s.count(a))
        s=s.replace(a,b)
    js=open('lp.js').read()+('\n'+open('lp_v2.js').read()+'\n'+open('demo2.js').read() if v2 else '')
    rep('// ---------- boot ----------',js+'\n// ---------- boot ----------')
    rep('</style>\n',open('lp.css').read()+'</style>\n')
    rep("function overview(){stkTick();","function overview(){stkTick();lpHint();")
    if v2:
        rep("  else if(a==='demo'){","  else if(a==='demo2'){loadExample('thriving')}\n  else if(a==='demo'){")
        rep('Just exploring? Try it with example numbers</button>','Just exploring? Try it with example numbers</button><button class="lnk" data-wact="demo2" style="align-self:center">Or see a thriving example</button>')
        rep("sgroup('Help',[","sgroup('Demo',[srow('spark','Example data','','data-x=\"open\" data-v=\"examples\"')])+\n  sgroup('Help',[")
    return s
