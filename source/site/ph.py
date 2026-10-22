import os,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':1280,'height':900},device_scale_factor=2)
    pg.goto('file://'+os.getcwd()+'/bonsai_site.html');pg.wait_for_timeout(2500)
    pg.locator('.hero .phone').screenshot(path='ph_'+sys.argv[1]+'.png')
    b.close()
