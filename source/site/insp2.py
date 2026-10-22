import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium');pg=b.new_page(viewport={'width':1280,'height':800})
    pg.goto('file://'+os.getcwd()+'/t.html');pg.wait_for_timeout(800)
    print(pg.evaluate("(()=>{const c=document.querySelector('.ctas');return c.outerHTML.slice(0,600)+' || '+[...c.children].map(x=>x.tagName+':'+Math.round(x.getBoundingClientRect().width)+'x'+Math.round(x.getBoundingClientRect().height)).join(',')})()"))
