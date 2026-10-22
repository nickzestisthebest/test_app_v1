import json,re
s=open('bonsai_site.html').read()
D=json.load(open('anim/demos.json'))
def rep(a,b,c=1):
    global s
    assert s.count(a)==c,(a[:70],s.count(a));s=s.replace(a,b)
# ---------- hero: animated home demo instead of a video ----------
i=s.index('<video class="shot vclip"');j=s.index('</video>',i)+len('</video>')
s=s[:i]+'<div class="adem" data-demo="home" data-loop="1" role="img" aria-label="Sprout Home screen scrolling from safe to spend today to left to spend this month and the growing plant"></div>'+s[j:]
# ---------- replace the video tour with an Apple-style highlights gallery ----------
i=s.index('<section class="sec tour"');j=s.index('</section>',i)+len('</section>')
H=[('ask','Ask Sprout','Just ask.','Ask how much you can spend today, or whether you can afford something. Sprout answers from your real numbers.'),
   ('finances','Finances','Your whole picture.','Net worth, checking, your paycheck and your debt, all on one calm screen.'),
   ('spending','Spending','See where it goes.','Every purchase sorted into simple categories, with budgets you can nudge in a tap.'),
   ('bills','Bills','No more surprises.','Find subscriptions you forgot, cancel them for you, and see every bill on a calendar.'),
   ('community','Community','Never alone.','Ask for advice, cheer each other on, and find an accountability buddy.')]
caps=''.join('<div class="hlcap'+(' on' if k==0 else '')+'" data-i="'+str(k)+'"><span class="eyebrow">'+t+'</span><h3>'+h+'</h3><p>'+d+'</p></div>' for k,(n,t,h,d) in enumerate(H))
pills=''.join('<button type="button" class="hlpill'+(' on' if k==0 else '')+'" data-i="'+str(k)+'" aria-label="Show '+t+'"><span>'+t+'</span><i><u></u></i></button>' for k,(n,t,h,d) in enumerate(H))
sec='''<section class="sec highlights" data-bg="--bg" id="tour">
  <div class="wrap">
    <h2 class="hlh">Get the highlights.</h2>
    <div class="hlcard">
      <div class="hlcaps" aria-live="polite">'''+caps+'''</div>
      <div class="phone hlphone"><div class="notch"></div><div class="scr"><div class="adem" data-demo="'''+H[0][0]+'''" role="img" aria-label="Animated demo of the Sprout app"></div></div></div>
    </div>
    <div class="hlpills" role="tablist" aria-label="Highlights">'''+pills+'''</div>
  </div>
</section>'''
s=s[:i]+sec+s[j:]
# ---------- css ----------
s=re.sub(r'^@media \(max-width:600px\)\{\.tcard.*\n','',s,flags=re.M);s=re.sub(r'^\.(trail|tcard|phone\.sm|tnav|tbtn)[\{ ].*\n','',s,flags=re.M)
css='''
.adem{position:absolute;inset:0;overflow:hidden;background:#eef7f1}
.adem .dl{position:absolute;inset:0;opacity:0;transition:opacity .7s cubic-bezier(.4,0,.2,1)}
.adem .dl.on{opacity:1}
.adem .dl img{position:absolute;left:0;top:0;width:100%;display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}
.adem .dl img.tall{will-change:transform;backface-visibility:hidden}
.adem .dl img.still,.adem .dl img.chrome{height:100%;object-fit:cover;object-position:top}
.adem .tapfx{position:absolute;width:15%;aspect-ratio:1;margin:-7.5% 0 0 -7.5%;border-radius:50%;background:rgba(47,174,90,.28);box-shadow:0 0 0 2px rgba(47,174,90,.45);pointer-events:none;z-index:50;animation:dtap .75s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes dtap{0%{transform:scale(.35);opacity:0}25%{opacity:1}100%{transform:scale(1.25);opacity:0}}
.highlights{padding-top:clamp(70px,9vw,120px)}
.hlh{font-size:clamp(34px,4.6vw,56px)!important;margin-bottom:30px}
.hlcard{position:relative;background:var(--card);border-radius:36px;box-shadow:var(--shadow);display:grid;grid-template-columns:1fr auto;align-items:center;gap:40px;padding:clamp(28px,5vw,64px) clamp(28px,6vw,90px);overflow:hidden;min-height:640px}
.hlcaps{position:relative;min-height:240px}
.hlcap{position:absolute;inset:0;opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .8s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.hlcap.on{opacity:1;transform:none;position:relative}
.hlcap h3{font-size:clamp(34px,4vw,52px);line-height:1.04;margin:10px 0 14px}
.hlcap p{font-size:clamp(17px,1.6vw,21px);color:var(--muted);max-width:30ch;margin:0;line-height:1.5}
.hlphone{width:300px}
.hlpills{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:26px}
.hlpill{font:inherit;font-size:14.5px;font-weight:700;border:0;cursor:pointer;border-radius:999px;padding:10px 16px 12px;background:var(--card);color:var(--muted);box-shadow:inset 0 0 0 1px var(--line);display:flex;flex-direction:column;align-items:center;gap:6px;min-width:96px;transition:color .3s,background .3s}
.hlpill.on{color:var(--ink);background:var(--bg2);box-shadow:none}
.hlpill i{display:block;width:100%;height:3px;border-radius:3px;background:var(--line);overflow:hidden}
.hlpill u{display:block;height:100%;width:0;background:var(--accent)}
.hlpill.on u{width:100%;transition:width var(--dur,10s) linear}
@media (max-width:860px){.hlcard{grid-template-columns:1fr;justify-items:center;text-align:center;gap:26px;min-height:0}.hlcaps{min-height:170px;width:100%}.hlcap p{margin:0 auto}.hlphone{width:min(290px,78vw)}}
@media (prefers-reduced-motion:reduce){.adem .dl{transition:none}.hlpill.on u{transition:none}}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
# ---------- js: remove video player code, add the animation engine ----------
i=s.index('// ----- play clips only while visible -----');j=s.index('\n\n',i) if '\n\n' in s[i:] else None
k=s.index("vids.forEach(v=>vio.observe(v))}",i)+len("vids.forEach(v=>vio.observe(v))}")
s=s[:i]+s[k:]
s=re.sub(r"// ----- tour arrows -----\ndocument\.querySelectorAll\('\.tbtn'\).*\n",'',s)
eng='''
// ----- animated app demos: real screens moved with CSS (no video) -----
const DEMOS='''+json.dumps(D,separators=(',',':'))+''';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function demoDur(k){let t=0;DEMOS[k].scenes.forEach(sc=>{t+=700;if(sc.t==='page')sc.moves.forEach(m=>t+=m[1]+m[2]);else t+=sc.hold;if(sc.tap)t+=520});return t}
function Demo(el){const self={el,key:null,run:0,layers:[]};
  self.load=k=>{self.key=k;self.run++;el.innerHTML='';const sc=DEMOS[k].scenes;
    self.layers=sc.map(s=>{const L=document.createElement('div');L.className='dl';
      if(s.t==='page'){L.innerHTML='<img class="tall" alt="" decoding="async" src="anim/'+s.img+'.jpg"><img class="chrome" alt="" decoding="async" src="anim/'+s.chrome+'.png">'}
      else L.innerHTML='<img class="still" alt="" decoding="async" src="anim/'+s.img+'.jpg">';
      el.appendChild(L);return L});
    self.layers[0].classList.add('on');const sc0=sc[0];if(sc0.t==='page')self.pos(0,sc0.moves[0][0],0)};
  self.pos=(i,y,dur)=>{const s=DEMOS[self.key].scenes[i],img=self.layers[i].querySelector('img.tall');img.style.transition=dur?'transform '+dur+'ms cubic-bezier(.42,0,.22,1)':'none';img.style.transform='translate3d(0,'+(-Math.max(0,Math.min(y,s.h-844))/s.h*100).toFixed(4)+'%,0)'};
  self.tap=async(p,id)=>{const d=document.createElement('div');d.className='tapfx';d.style.left=(p[0]/390*100)+'%';d.style.top=(p[1]/844*100)+'%';el.appendChild(d);setTimeout(()=>d.remove(),900);await sleep(520)};
  self.play=async(loop,onDone)=>{const id=++self.run,sc=DEMOS[self.key].scenes,alive=()=>id===self.run;
    await Promise.all(self.layers.map(L=>[...L.querySelectorAll('img')].map(im=>im.decode?im.decode().catch(()=>{}):0)).flat());
    do{for(let i=0;i<sc.length;i++){if(!alive())return;const s=sc[i],L=self.layers[i];
        self.layers.forEach((x,j)=>{x.style.zIndex=j===i?2:1});L.classList.add('on');
        if(s.t==='page'){self.pos(i,s.moves[0][0],0)}
        await sleep(700);if(!alive())return;self.layers.forEach((x,j)=>{if(j!==i)x.classList.remove('on')});
        if(s.t==='page'){for(const m of s.moves){if(!alive())return;self.pos(i,m[0],m[1]);await sleep(m[1]+m[2])}}else await sleep(s.hold);
        if(s.tap&&alive())await self.tap(s.tap)}
      if(!alive())return;
      if(onDone&&alive()){onDone();return}}while(loop&&alive())};
  self.stop=()=>{self.run++};return self}
const demoEls=[...document.querySelectorAll('.adem')].map(e=>{const d=Demo(e);d.load(e.dataset.demo);return d});
// hero: loop while visible
const loops=demoEls.filter(d=>d.el.dataset.loop),heroD=loops[0];
// highlights gallery
const gD=demoEls.find(d=>!d.el.dataset.loop),HK=['ask','finances','spending','bills','community'];let gi=0,gVis=false;
function gShow(i,start){gi=i;document.querySelectorAll('.hlcap').forEach((c,k)=>c.classList.toggle('on',k===i));
  document.querySelectorAll('.hlpill').forEach((p,k)=>{p.classList.remove('on');p.setAttribute('aria-selected',k===i)});
  const p=document.querySelectorAll('.hlpill')[i];p.style.setProperty('--dur',demoDur(HK[i])+'ms');void p.offsetWidth;
  gD.load(HK[i]);if(start&&!RM){p.classList.add('on');gD.play(false,()=>gShow((gi+1)%HK.length,true))}else p.classList.add('on')}
document.querySelectorAll('.hlpill').forEach(p=>p.addEventListener('click',()=>gShow(+p.dataset.i,gVis)));
if(!RM){const dio=new IntersectionObserver(es=>es.forEach(e=>{
  const L=loops.find(d=>d.el===e.target);if(L){if(e.isIntersecting)L.play(true);else L.stop()}
  else{gVis=e.isIntersecting;if(e.isIntersecting)gShow(gi,true);else{gD.stop();document.querySelectorAll('.hlpill').forEach(p=>p.classList.remove('on'))}}}),{threshold:.35});
  loops.forEach(d=>dio.observe(d.el));dio.observe(gD.el)}
'''
k=s.rindex('})();');s=s[:k]+eng+s[k:]
open('bonsai_site.html','w').write(s)
print('ok',s.count('<video'),len(s)//1024,'KB')
