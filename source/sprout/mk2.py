s=open('sprout.html').read()
lk=open('lk_block.js').read()
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a,s.count(a))
    s=s.replace(a,b)
rep('<title>Sprout</title>','<title>Sprout v2</title>')
rep('// ---------- boot ----------',lk+'\n// ---------- boot ----------')
rep("saved:0, goals:[], rules:{}, accts:{},","saved:0, goals:[], rules:{}, accts:{}, link:null,")
rep('<button class="mitem" data-nav="import">','<button class="mitem" data-nav="accts"><i>⛓</i>Connected accounts</button>\n    <button class="mitem" data-nav="import">')
rep("'import','insights'];","'import','insights','accts'];")
rep("else if(n==='insights')insOpen();}","else if(n==='insights')insOpen();else if(n==='accts')acctsOpen();}")
rep('<div class="sheet" id="sh-ins" hidden>','''<div class="sheet" id="sh-link" hidden>
  <div class="scrim" data-close></div>
  <div class="panel tall" role="dialog" aria-modal="true" aria-labelledby="lk-t">
    <div class="grab"></div>
    <div class="ph"><h2 id="lk-t">Connect your accounts</h2><button type="button" class="lnk" data-close>Close</button></div>
    <div id="lk-body" style="display:flex;flex-direction:column;gap:12px"></div>
  </div>
</div>
<div class="sheet" id="sh-accts" hidden>
  <div class="scrim" data-close></div>
  <div class="panel tall" role="dialog" aria-modal="true" aria-labelledby="ac-t">
    <div class="grab"></div>
    <div class="ph"><h2 id="ac-t">Connected accounts</h2><button type="button" class="lnk" data-close>Done</button></div>
    <div id="ac-body" style="display:flex;flex-direction:column;gap:12px"></div>
  </div>
</div>
<div class="sheet" id="sh-ins" hidden>''')
rep("'<button class=\"btn alt\" data-wact=\"restore\" id=\"wz-restore\" hidden>","'<button class=\"btn\" data-wact=\"connect\">Connect my accounts (demo)</button><button class=\"btn alt\" data-wact=\"restore\" id=\"wz-restore\" hidden>")
rep("  else if(a==='demo'){","  else if(a==='connect'){closeWizard();setTimeout(lkOpen,300)}\n  else if(a==='demo'){")
rep("'</span><h2>'+(short?","'</span><h2>'+(short?") if False else None
rep("+'</h2></div>'+growthCard()+","+'</h2></div>'+syncChip()+growthCard()+")
rep("  if(!state.setup)setTimeout(()=>openWizard(false),350);","  if(!state.setup)setTimeout(()=>openWizard(false),350);\n  if(state.link&&state.link.on&&Date.now()-state.link.at>3e5)setTimeout(lkSync,1200);")
css='''
.lkdemo{background:#fff4de;color:#6b4a0a;border-radius:14px;padding:10px 12px;font-size:13px;line-height:1.4}
.lkrow{display:flex;align-items:center;gap:12px;background:var(--tile);border-radius:16px;padding:12px 14px}
.lki{width:42px;height:42px;border-radius:12px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-size:20px;flex:none}
.lkt{flex:1;min-width:0}.lkt b{display:block;font-size:15px}.lkt small{display:block;color:var(--hero-mute);font-size:12.5px}
.lkok{color:var(--accent);font-weight:800;font-size:13px;white-space:nowrap}
.lkc{display:flex;align-items:center;gap:12px;min-height:44px;font-size:14.5px}
.lkc input{width:22px;height:22px;accent-color:var(--accent);flex:none}
.lkc>span{flex:1}.lkc small{display:block;color:var(--hero-mute);font-size:12.5px}
.lkns{font-style:normal;font-size:11.5px;font-weight:700;color:#8a5a0b}
.syncchip{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;margin:0 0 10px;border:0;background:var(--tile);border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;font-weight:700;color:var(--hero-ink);cursor:pointer;min-height:40px}
.syncchip i{width:9px;height:9px;border-radius:50%;background:var(--mint);flex:none}
.syncchip span{flex:1;text-align:left}.syncchip em{font-style:normal;color:var(--accent);font-weight:800}
.syncchip.off i{background:#c9a24a}
.syncchip.busy i{animation:syncp 0.8s ease-in-out infinite}
@keyframes syncp{50%{opacity:.25;transform:scale(1.5)}}
@media (prefers-reduced-motion:reduce){.syncchip.busy i{animation:none}}
'''
rep('</style>\n',css+'</style>\n') if s.count('</style>\n')==1 else None
open('sprout_v2.html','w').write(s)
