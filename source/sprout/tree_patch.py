def apply(s):
    a='// ---------- boot ----------'
    assert s.count(a)==1
    s=s.replace(a,open('leaf_gen.js').read()+'\ntreeSvg=function(st){return leafPlant(st).replace(/aria-label="[^"]*"/,\'aria-label="Your \'+GROW[st][0].toLowerCase()+\'"\')};\n'+a)
    b='</style>\n'
    assert s.count(b)==1
    s=s.replace(b,'.plant .sway{transform-origin:150px 196px;animation:psway 7s ease-in-out infinite}@keyframes psway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1.2deg)}}@media (prefers-reduced-motion:reduce){.plant .sway{animation:none}}\n'+b)
    c='<div style="background:linear-gradient(var(--sky),var(--mintcream));padding:12px 12px 0;position:relative">'
    if s.count(c)==1: s=s.replace(c,'<div style="background:linear-gradient(var(--sky),var(--mintcream));padding:16px 30px 4px;position:relative">')
    return s
