# Rename drill (#146): build everything under a made-up name, check nothing still says Sprout, then put the real name back.
import os, json, re, subprocess, shutil
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); LIVE=os.path.join(HERE,'..','sprout_live'); BF=os.path.join(LIVE,'brand.json')
orig=open(BF).read(); R=[]
def ck(n,ok,info=''): R.append(('PASS ' if ok else 'FAIL ')+n+('' if ok else ' :: '+str(info)[:300]))
def run(c,cwd): return subprocess.run(c,shell=True,cwd=cwd,capture_output=True,text=True)
try:
    b=json.loads(orig); b.update(name='Fernly',domain='fernly.app',legalEntity='Fernly Labs LLC',tagline='Small steps, steady growth',accent='#4f7f8f',accentDark='#8fb8c8',themeColor='#4f7f8f')
    open(BF,'w').write(json.dumps(b,indent=2))
    r=run('bash build.sh',HERE); ck('app builds under a new name',r.returncode==0,r.stderr[-300:])
    r=run('python3 tools/build_pwa.py && node tools/gen_prompts.mjs && node tools/build_pages.mjs',LIVE); ck('installable app, prompts and pages build',r.returncode==0,r.stderr[-300:])
    app=open(os.path.join(HERE,'sprout_v2.html')).read().replace('<title>Sprout v2</title>','')
    left=re.findall(r'.{30}\bSprout\b.{30}',app); ck('no "Sprout" left in the app',not left,left[:3])
    ck('storage keys unchanged (data survives a rename)',"'sprout-accounts-v1'" in app and 'sprout-state-v1' in app)
    ck('domain swapped','fernly.app' in app and not re.search(r'(?<![\w-])sprout\.app',app))
    pub=open(os.path.join(LIVE,'public','index.html')).read(); ck('PWA title is the new name','<title>Fernly</title>' in pub and 'apple-mobile-web-app-title" content="Fernly"' in pub)
    man=json.load(open(os.path.join(LIVE,'public','manifest.webmanifest'))); ck('manifest uses the new name and color',man['name']=='Fernly' and man['theme_color']=='#4f7f8f',man)
    sw=open(os.path.join(LIVE,'public','sw.js')).read(); ck('notifications title uses the new name','Sprout' not in sw)
    br=open(os.path.join(LIVE,'api','_brand.js')).read(); ck('server name updated','"Fernly"' in br)
    pr=open(os.path.join(LIVE,'api','_prompts.js')).read(); ck('server accepts the renamed translate prompt','app called Fernly into' in pr and 'app called Fernly into' in app)
    for pg_ in ['about/index.html','privacy/index.html','terms/index.html']:
        t=open(os.path.join(LIVE,'public',pg_)).read(); ck(pg_+' renamed',not re.search(r'\bSprout\b',t),re.findall(r'.{30}\bSprout\b.{30}',t)[:2])
    with sync_playwright() as p:
        bw=p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); pg=bw.new_page(viewport={'width':390,'height':844}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.add_init_script("window.claude={use:async()=>{throw new Error('x')}};")
        pg.goto('file://'+os.path.join(HERE,'v2_test.html')); pg.wait_for_timeout(3000)
        pg.evaluate("__T.closeSheets();document.querySelectorAll('.sheet.on').forEach(s=>{s.classList.remove('on');s.hidden=true});document.body.classList.remove('lock')")
        seen=[]
        for js in ["__T.setTab('home')","__T.setTab('money')","__T.xOpen('settings')","__T.xOpen('plus')","__T.xOpen('numbers')","__T.closeSheets();openSheet('sh-ask')"]:
            pg.evaluate("(()=>__T.ev(%s))()"%json.dumps(js)); pg.wait_for_timeout(600); t=pg.inner_text('body'); seen+=re.findall(r'.{20}\bSprout\b.{20}',t)
        ck('no "Sprout" on screen in the main views',not seen,seen[:3])
        acc=pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()"); ck('accent color from the brand file',acc=='#4f7f8f',acc)
        pg.evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(150)
        ck('app switcher cover shows the new name','Fernly' in pg.inner_text('#cov4'))
        ck('no page errors',not errs,errs[:3]); bw.close()
finally:
    open(BF,'w').write(orig)
    r=run('bash build.sh',HERE); r2=run('python3 tools/build_pwa.py && node tools/gen_prompts.mjs && node tools/build_pages.mjs',LIVE)
    ck('real name restored',r.returncode==0 and r2.returncode==0 and '"Sprout"' in open(os.path.join(LIVE,'api','_brand.js')).read())
print('\n'.join(R)); print(sum(x.startswith('PASS') for x in R),'/',len(R))
