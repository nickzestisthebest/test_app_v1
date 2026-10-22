import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');errs=[]
    for name,vp,scheme in [('d',{'width':1280,'height':800},'light'),('m',{'width':390,'height':844},'light'),('dd',{'width':1280,'height':800},'dark')]:
        pg=b.new_page(viewport=vp,color_scheme=scheme);pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(1800)
        print(name,'sw',pg.evaluate("document.documentElement.scrollWidth"),'h',pg.evaluate("document.documentElement.scrollHeight"))
        H=pg.evaluate("document.documentElement.scrollHeight");n=0
        for y in ([0,900,1700,2300,3200,4200,5000,5900,6900,7900,8800,9800] if name!='m' else [0,800,1600,2400,3200,4000,4800,5600,6400,7200,8000]):
            if y>H: break
            pg.evaluate("window.scrollTo(0,%d)"%y);pg.wait_for_timeout(700);pg.screenshot(path='%s_%02d.png'%(name,n));n+=1
        pg.close()
    print(errs)
