import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':940,'height':470},device_scale_factor=1.5)
    pg.goto('file://'+os.getcwd()+'/proto.html');pg.wait_for_timeout(400);pg.screenshot(path='proto.png')
