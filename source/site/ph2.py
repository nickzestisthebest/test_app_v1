import os
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    out=[]
    for vw,tag in [(1280,'d'),(390,'m')]:
        pg=b.new_page(viewport={'width':vw,'height':900},device_scale_factor=1)
        pg.goto('file://'+os.getcwd()+'/bonsai_site.html');pg.wait_for_timeout(1500)
        for i,sel in enumerate(['.hero .phone','.snapphone','.hlphone','.story .phone']):
            el=pg.locator(sel).first;el.scroll_into_view_if_needed();pg.wait_for_timeout(2500)
            fn='p_%s%d.png'%(tag,i);el.screenshot(path=fn);out.append(fn)
    b.close()
ims=[Image.open(f) for f in out];h=max(i.height for i in ims)
W=Image.new('RGB',(sum(i.width for i in ims)+10*len(ims),h),'white');x=0
for i in ims:W.paste(i,(x,0));x+=i.width+10
W.save('phones.png');print(W.size)
