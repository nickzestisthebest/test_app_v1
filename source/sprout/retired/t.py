from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':390,'height':1500})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};localStorage.setItem('sprout-state-v1',JSON.stringify({setup:true,name:'T',pay:2000,firstPay:'2026-10-23',cash:500,debts:[{name:'Visa',bal:3000,apr:20,min:90,day:20}],startDebt:4000,saved:300,checkin:{last:new Date().toISOString().slice(0,10),streak:5,best:9}}))")
    pg.goto('file://'+__import__('os').getcwd()+'/sprout.html')
    pg.wait_for_timeout(3500)
    pg.screenshot(path='home.png');pg.click('#hd-streak');pg.wait_for_timeout(900);pg.screenshot(path='stk.png')
    print(errs, pg.inner_text('#ov')[:300])
