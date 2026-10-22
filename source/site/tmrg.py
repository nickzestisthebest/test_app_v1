import os
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for name,vp in [('d',{'width':1280,'height':800}),('m',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp,device_scale_factor=2);pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(600)
        pg.evaluate("document.querySelector('.mrgbox').scrollIntoView({block:'center'})");pg.wait_for_timeout(300)
        pg.evaluate("const s=document.getElementById('snap');s.classList.remove('on');void s.offsetWidth;s.classList.add('on')")
        pg.wait_for_timeout(1000);pg.query_selector('.mrg').screenshot(path=f'rec/mrg_{name}_1.png')
        pg.wait_for_timeout(3000);pg.query_selector('.mrg').screenshot(path=f'rec/mrg_{name}_2.png')
        pg.close()
ims=[Image.open(f'rec/mrg_{n}.png').convert('RGB') for n in ['d_1','d_2','m_1','m_2']]
W=max(i.width for i in ims);H=sum(i.height for i in ims)+30
S=Image.new('RGB',(W,H),'white');y=0
for i in ims:S.paste(i,(0,y));y+=i.height+10
S.save('rec/mrg.png')
