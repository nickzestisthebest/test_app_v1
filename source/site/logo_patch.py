f='bonsai_site.html';s=open(f).read()
css='''
/* brand mark = logo C: green tile, shaded white sprout */
.brand svg{width:32px;height:32px;padding:6px;box-sizing:border-box;border-radius:10px;background:#2a9f52;box-shadow:0 2px 8px -3px rgba(23,79,47,.45);flex:none}
.brand svg path{opacity:1!important}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
ico=open('../logos/icon_head_C_for_site.txt').read()
if '<link rel="icon"' not in s:s=s.replace('</title>','</title>\n'+ico,1)
import re
SP='<svg viewBox="0 0 1024 1024" aria-hidden="true"><g transform="translate(512 512) scale(1.18) translate(-529 -536)"><path d="M512 810 C512 700 512 600 512 520" stroke="#ffffff" stroke-width="44" stroke-linecap="round" fill="none"/><path d="M512 610 C512 470 412 380 246 372 C236 520 340 616 512 610 Z" fill="#a6e2bb"/><path d="M512 560 C512 380 640 268 812 262 C820 440 700 560 512 560 Z" fill="#e6f6ec"/></g></svg>'
s,nb=re.subn(r'(<a class="brand"[^>]*>)<svg.*?</svg>',lambda m:m.group(1)+SP,s,flags=re.S)
assert nb>=2,nb
s=s.replace('.brand svg{width:32px;height:32px;padding:6px;','.brand svg{width:32px;height:32px;padding:3px;')
open(f,'w').write(s);print('logo ok')
