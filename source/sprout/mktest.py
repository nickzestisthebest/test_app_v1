import re
s=open('sprout_v2.html').read()
TV=re.search(r"const TERMS_V='([^']+)'",open('acct.js').read()).group(1)
k='boot();\n\n})();'
i=s.rindex(k)
s=s[:i]+"boot();Object.defineProperties(window,{state:{get:()=>state},HIST:{get:()=>HIST}});window.__T={PAGES,xOpen,closeSheets,setTab,goHome,setView,lpClose,openFocus,detectSubs,plusIs:()=>plusIs(),LG,availAt:(T,sp)=>availAt(T,sp),renderTx:()=>renderTx(),nwSeries:()=>nwSeries(),ev:c=>eval(c)};\n\n})();"+s[i+len(k):]
# test builds start signed in to a seeded account unless a test asks for the real gate
SEED="""if(!window.__noSeed){try{const L=window.localStorage;if(!L.getItem('sprout-accounts-v1'))L.setItem('sprout-accounts-v1',JSON.stringify({cur:'t1',list:{t1:{id:'t1',first:'Test',last:'User',email:'test@example.com',phone:'(555) 222-3333',dob:'1990-01-01',zip:'10001',salt:'s',pwh:'x',created:1,fidAsked:1,agree:{v:'__TV__',at:1,tos:true,privacy:true,esign:true}}}}));
const ks=[];for(let i=0;i<L.length;i++){const k=L.key(i);if(k.indexOf('::')<0&&k!=='sprout-accounts-v1')ks.push(k)}ks.forEach(k=>{if(L.getItem(k+'::t1')==null)L.setItem(k+'::t1',L.getItem(k))})}catch(e){}}
"""
SEED=SEED.replace('__TV__',TV)
a='<script>\n(function(){\n'
assert s.count(a)==1
s=s.replace(a,a+SEED)
open('v2_test.html','w').write(s)
