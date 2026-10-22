import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w,h,n in [(1280,900,'d'),(390,844,'m')]:
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.goto('file://'+os.getcwd()+'/bonsai_site.html');pg.wait_for_timeout(1500)
        for sel,k in [('#features','feat'),('#pricing','price'),('#privacy','priv')]:
            pg.evaluate("s=>document.querySelector(s).scrollIntoView()",sel);pg.wait_for_timeout(1800)
            pg.locator(sel).screenshot(path='up_%s_%s.png'%(n,k))
        pg.evaluate("document.querySelector('.spcard').scrollIntoView({block:'center'})");pg.wait_for_timeout(1800);pg.locator('.spcard').screenshot(path='up_%s_spend.png'%n)
    b.close()
