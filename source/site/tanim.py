import os
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':1280,'height':800});pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    ph=pg.query_selector('.hero .phone');fr=[]
    for k in range(12):
        pg.wait_for_timeout(700);ph.screenshot(path=f'rec/h{k}.png');fr.append(Image.open(f'rec/h{k}.png').convert('RGB').resize((150,310)))
    pg.evaluate("document.getElementById('tour').scrollIntoView()");pg.wait_for_timeout(600)
    ph2=pg.query_selector('.hlphone')
    for k in range(12):
        pg.wait_for_timeout(1000);ph2.screenshot(path=f'rec/g{k}.png');fr.append(Image.open(f'rec/g{k}.png').convert('RGB').resize((150,310)))
    S=Image.new('RGB',(150*12,310*2),'white')
    for i,im in enumerate(fr):S.paste(im,((i%12)*150,(i//12)*310))
    S.save('rec/anim_strip.png')
    pg.screenshot(path='hl_full.png')
