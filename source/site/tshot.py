import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for name,vp in [('d',{'width':1280,'height':800}),('m',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp);pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(2500);pg.screenshot(path=f'v_{name}_hero.png')
        pg.evaluate("document.getElementById('tour').scrollIntoView()");pg.wait_for_timeout(2500);pg.screenshot(path=f'v_{name}_tour.png');pg.close()
