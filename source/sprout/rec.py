import os,time,json
from playwright.sync_api import sync_playwright
VD='/tmp/claude-0/-home-claude/5314556e-0af2-50e5-b390-023f01a81bfc/scratchpad/site/rec'
os.makedirs(VD,exist_ok=True)
marks={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,color_scheme='light',record_video_dir=VD,record_video_size={'width':780,'height':1688})
    t0=time.monotonic()
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};try{localStorage.setItem('sprout-lp-hint','1')}catch(e){}")
    pg.goto('file://'+os.getcwd()+'/v2_test.html');pg.wait_for_timeout(3400)
    pg.click('[data-wact=demo2]');pg.wait_for_timeout(6500)
    pg.add_style_tag(content=".tapfx{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(47,174,90,.35);box-shadow:0 0 0 2px rgba(47,174,90,.5);pointer-events:none;z-index:99999;animation:tapfx .55s ease-out forwards}@keyframes tapfx{from{transform:scale(.4);opacity:1}to{transform:scale(1.35);opacity:0}}#toast{display:none!important}")
    pg.evaluate("document.body.classList.remove('noai')")
    W=pg.wait_for_timeout
    def tap(sel,w=700,click=True):
        el=[e for e in pg.query_selector_all(sel) if e.is_visible()][0];el.scroll_into_view_if_needed();bb=el.bounding_box();x=bb['x']+bb['width']/2;y=bb['y']+min(bb['height']/2,30)
        pg.evaluate("([x,y])=>{const d=document.createElement('div');d.className='tapfx';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)}",[x,y])
        W(260)
        if click: pg.mouse.click(x,y)
        W(w)
    def scroll(y,w=1400):pg.evaluate("y=>window.scrollTo({top:y,behavior:'smooth'})",y);W(w)
    def scroll_to(sel,off=-80,w=1400):pg.evaluate("([s,o])=>{const e=document.querySelector(s);window.scrollTo({top:e.getBoundingClientRect().top+scrollY+o,behavior:'smooth'})}",[sel,off]);W(w)
    def close(w=500):pg.evaluate("document.querySelectorAll('.sheet.on button[data-close]').forEach(b=>b.click())");W(w)
    def flash(c):
        pg.evaluate("c=>{const d=document.createElement('div');d.id='syncfx';d.style.cssText='position:fixed;inset:0;z-index:999999;background:'+c;document.body.appendChild(d)}",c);W(1300);pg.evaluate("document.getElementById('syncfx').remove()");W(120)
    def mark(n,a,bb):marks[n]=[round(a-t0,2),round(bb-t0,2)];flash('#00ffff')
    now=time.monotonic
    # ---- 1 Home ----
    scroll(0,600);flash('#ff00ff');a=now();W(1500)
    scroll_to('.ovhero',-90,1700);W(900)
    scroll_to('.leftc',-200,1500);W(1200)
    scroll_to('.gcard',-80,1600);W(1300)
    scroll(0,1500);W(600);mark('home',a,now())
    # ---- 2 Ask ----
    flash('#ff00ff');a=now();tap('#open-ask',900)
    pg.evaluate("(()=>{const b=document.getElementById('cmd-box');b.classList.remove('hide');b.hidden=false;b.style.display='';const na=document.getElementById('cmd-na');if(na)na.classList.add('hide');document.getElementById('cmd-out').innerHTML=''})()");W(500)
    def ask(q,ans):
        tap('#cmd-in',200);pg.type('#cmd-in',q,delay=45);W(300);tap('#cmd-go',200,click=False)
        pg.evaluate("""([q,a])=>{const o=document.getElementById('cmd-out');let t=o.querySelector('.thread');if(!t){t=document.createElement('div');t.className='thread';o.appendChild(t)}
          t.insertAdjacentHTML('beforeend','<div class="bub me"><p>'+q+'</p></div><div class="bub ai typing" aria-label="Thinking"><i></i><i></i><i></i></div>');document.getElementById('cmd-in').value='';
          setTimeout(()=>{const ty=t.querySelector('.typing');if(ty){ty.outerHTML='<div class="bub ai"><p>'+a+'</p></div>'}},1100)}""",[q,ans]);W(3200)
    ask('How much can I spend today?','<b>$27.49 today.</b> That is $14 for basics like groceries and gas, and $14 for fun. Your phone bill due today is already covered.')
    ask('Can I afford $80 for dinner Friday?','<b>It is tight.</b> You will have about $70 for fun before payday on Oct 17, so $80 goes about $10 over. Try $60, or plan it for after payday.')
    W(800);mark('ask',a,now());close(700)
    # ---- 3 Finances + net worth ----
    flash('#ff00ff');a=now();tap('.tabbar [data-tab=money]',1500)
    scroll_to('.ovgrid',-90,1500);W(900);scroll(0,1200)
    tap('.nwcard',1800)
    svg=pg.query_selector('[data-nwchart]');bb=svg.bounding_box()
    for k in range(0,26):
        pg.mouse.move(bb['x']+bb['width']*(0.06+0.9*k/25),bb['y']+bb['height']*.5);W(70)
    W(900);pg.mouse.move(5,5);W(900)
    pg.evaluate("document.querySelector('#sh-x .panel').scrollTo({top:620,behavior:'smooth'})");W(1800)
    mark('finances',a,now());close(600)
    # ---- 4 Spending: transactions + budgets ----
    scroll(0,400);flash('#ff00ff');a=now()
    scroll_to('#pg [data-x=nav][data-v=tx]',-200,1100);tap('#pg [data-x=nav][data-v=tx]',1800)
    pg.evaluate("window.scrollTo({top:380,behavior:'smooth'})");W(1600)
    pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})");W(900)
    tap('[data-txview=list]',1600);tap('[data-txview=cat]',900)
    tap('.tabbar [data-tab=money]',700);scroll_to('#pg [data-v=budgets]',-260,1100);tap('#pg [data-x=open][data-v=budgets]',1800)
    tap('#x-body [data-x=bud][data-v=din][data-w="25"]',500);tap('#x-body [data-x=bud][data-v=din][data-w="25"]',900)
    mark('spending',a,now());close(600)
    # ---- 5 Bills + subscriptions ----
    flash('#ff00ff');a=now();scroll_to('#pg [data-v=subs]',-260,900);tap('#pg [data-x=open][data-v=subs]',1700)
    tap('#x-body .xrow[data-v=cancel]',1300)
    tap('#x-body [data-x=runcancel]',3600)
    W(1200);close(600)
    scroll_to('#pg [data-v=calendar]',-260,900);tap('#pg [data-x=open][data-v=calendar]',2200)
    mark('bills',a,now());close(600)
    # ---- 6 Community ----
    flash('#ff00ff');a=now();tap('.tabbar [data-tab=community]',1200)
    if pg.query_selector('#pg [data-x=welx]'):tap('#pg [data-x=welx]',700)
    pg.evaluate("window.scrollTo({top:700,behavior:'smooth'})");W(1500);pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})");W(900)
    tap('#pg .post .mlk[data-x=mem] >> nth=0',1700)
    tap('#x-body [data-x=dm]',900)
    tap('#dm-in',200);pg.type('#dm-in','Want to check in every Friday?',delay=45);W(300);tap('#x-body [data-x=dmsend]',3000)
    W(800);mark('community',a,now());close(600)
    pg.close();vpath=pg.video.path();ctx.close();b.close()
json.dump({'video':vpath,'marks':marks,'errs':errs},open(VD+'/marks.json','w'),indent=1)
print(json.dumps(marks),errs,vpath)
