import os
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    pg.evaluate("document.querySelector('.hlcard').scrollIntoView({block:'start'})");pg.wait_for_timeout(1500)
    fr=[]
    for i in range(5):
        pg.click(f'.hlpill[data-i="{i}"]');pg.wait_for_timeout(2600)
        pg.evaluate("document.querySelector('.hlcard').scrollIntoView({block:'start'})");pg.wait_for_timeout(300)
        pg.screenshot(path=f'rec/m{i}.png');fr.append(Image.open(f'rec/m{i}.png').convert('RGB').resize((195,422)))
        print(i,pg.evaluate("[...document.querySelectorAll('#tour .adem .dl')].map(l=>l.classList.contains('on')?1:0).join('')"),pg.evaluate("[...document.querySelectorAll('#tour .adem img')].slice(0,2).map(i=>i.naturalHeight+'/'+i.getBoundingClientRect().height.toFixed(0))"))
    S=Image.new('RGB',(195*5,422),'white')
    for i,im in enumerate(fr):S.paste(im,(i*195,0))
    S.save('rec/mob_strip.png');print(errs)
