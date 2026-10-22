f='bonsai_site.html';s=open(f).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a));s=s.replace(a,b)
sig='<svg viewBox="0 0 18 12" class="sig"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>'
wifi='<svg viewBox="0 0 16 12" class="wifi"><path d="M8 11.2l2.3-2.6a3.4 3.4 0 0 0-4.6 0z"/><path d="M3.6 6.6a6.4 6.4 0 0 1 8.8 0l-1.3 1.5a4.4 4.4 0 0 0-6.2 0z"/><path d="M1.2 4a9.8 9.8 0 0 1 13.6 0l-1.3 1.5a7.8 7.8 0 0 0-11 0z"/></svg>'
bat='<svg viewBox="0 0 27 13" class="bat"><rect x=".6" y=".6" width="22.8" height="11.8" rx="3.4" fill="none" stroke-width="1.1" opacity=".4"/><rect x="2.3" y="2.3" width="17" height="8.4" rx="2"/><path d="M25 4.4v4.2a2 2 0 0 0 0-4.2z" opacity=".45"/></svg>'
sb='<div class="sbar" aria-hidden="true"><span class="clk">9:41</span><span class="isl"></span><span class="sic">'+sig+wifi+bat+'</span></div>'
n=s.count('<div class="notch"></div>');assert n>=3,n
s=s.replace('<div class="notch"></div>',sb)
# soft fade under the app header so scrolling content tucks under it like in the app
rep("""<img class="chrome" alt=\"\"""","""<i class="hfade"></i><img class="chrome" alt=\"\"""")
css='''
/* realistic modern phone frame (generic, no brand marks) */
.phone{--bz:10px;width:300px;aspect-ratio:300/662;border-radius:54px;padding:var(--bz);background:#0b0d0c;
  box-shadow:inset 0 0 0 1.5px #8e9792,inset 0 0 0 3px #2c312e,inset 0 0 0 4.5px #121513,0 0 0 1px rgba(0,0,0,.25),0 40px 80px -30px rgba(18,60,35,.45),0 18px 36px -18px rgba(0,0,0,.35)}
.phone::before,.phone::after{content:"";position:absolute;width:3px;border-radius:2px;background:linear-gradient(90deg,#5d6560,#a9b1ac 60%,#6b736e)}
.phone::before{left:-3px;top:17%;height:5.2%;box-shadow:0 calc(300px*.662*.1) 0 0 #8a928d,0 calc(300px*.662*.205) 0 0 #8a928d}
.phone::after{right:-3px;top:27%;height:12%;background:linear-gradient(270deg,#5d6560,#a9b1ac 60%,#6b736e)}
.phone .scr{border-radius:calc(54px - var(--bz));padding-top:36px;background:#d6edde}
.phone .scr>.adem,.phone .scr>.app{top:36px}
.phone .scr::after{content:"";position:absolute;left:50%;bottom:5px;width:35%;height:4.5px;border-radius:9px;background:rgba(16,38,26,.82);transform:translateX(-50%);z-index:6;pointer-events:none}
.sbar{position:absolute;z-index:5;top:var(--bz);left:var(--bz);right:var(--bz);height:36px;border-radius:calc(54px - var(--bz)) calc(54px - var(--bz)) 0 0;display:flex;align-items:center;justify-content:space-between;padding:4px 22px 0 30px;color:#10261a;pointer-events:none}
.sbar .clk{font:600 14px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,sans-serif;letter-spacing:-.01em;width:52px}
.sbar .isl{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:31%;height:24px;border-radius:14px;background:#000;box-shadow:inset 0 0 0 1px #151515}
.sbar .isl::after{content:"";position:absolute;right:11px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#2a3550,#0a0c12 70%)}
.sbar .sic{display:flex;align-items:center;gap:5px}.sbar svg{fill:currentColor;height:11px;width:auto}.sbar .bat{height:12px;stroke:currentColor}
.adem .dl .hfade{position:absolute;left:0;right:0;top:0;height:12.5%;background:linear-gradient(#d6edde 70%,rgba(214,237,221,0));z-index:1;pointer-events:none}
.adem .dl img.chrome{z-index:2}
@media (max-width:860px){.hlphone{width:min(290px,78vw)}}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
open(f,'w').write(s);print('ok',n)
s=open(f).read()
a="$$('[data-screen]').forEach(e=>{e.style.opacity=e.dataset.screen==='2'?1:0})"
assert s.count(a)==1
s=s.replace(a,"$$('[data-screen]').forEach(e=>{e.style.opacity=e.dataset.screen==='2'?1:0;e.style.transform='none'})")
open(f,'w').write(s);print('mobile fix ok')
