"""The app's name and look come from one file: sprout_live/brand.json.
brandify() swaps the built-in name for the configured one in finished pages. Storage keys (lowercase "sprout-...")
are never touched, so renaming keeps everyone's data."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
BRAND_FILE = os.path.join(HERE, '..', 'sprout_live', 'brand.json')
BASE = {'name': 'Sprout', 'domain': 'sprout.app', 'legalEntity': 'Sprout Money LLC', 'tagline': 'Grow a little every day',
        'accent': '#5f8f5a', 'accentDark': '#8fbf7f', 'description': 'A calm daily budget that knows your bills and paychecks.',
        'supportEmail': '[your support email]', 'themeColor': '#5f8f5a', 'backgroundColor': '#eef2e8', 'iconFile': 'tools/icon_1024.png'}

def load():
    b = dict(BASE)
    try:
        b.update({k: v for k, v in json.load(open(BRAND_FILE, encoding='utf-8')).items() if not k.startswith('_')})
    except FileNotFoundError:
        pass
    b['name'] = str(b['name']).strip() or 'Sprout'
    return b

KEEP = ['<title>Sprout v2</title>']

def brandify(s, b=None):
    b = b or load()
    if b['name'] == 'Sprout' and b['domain'] == 'sprout.app' and b['legalEntity'] == 'Sprout Money LLC':
        return s
    hold = {}
    for i, k in enumerate(KEEP):
        tok = '\x00K%d\x00' % i; hold[tok] = k; s = s.replace(k, tok)
    s = s.replace('Sprout Money LLC', b['legalEntity'])
    s = re.sub(r'(?<![\w-])sprout\.app\b', b['domain'], s)
    s = re.sub(r'\bSprout\b', b['name'], s)
    for tok, k in hold.items():
        s = s.replace(tok, k)
    return s

def app_head(b=None):
    """window.BRAND for the app, plus the accent colors."""
    b = b or load()
    pub = {k: b.get(k) for k in ('name', 'tagline', 'description', 'domain', 'supportEmail')}
    js = '<script>window.BRAND=' + json.dumps(pub, ensure_ascii=False).replace('</', '<\\/') + '</script>'
    css = ''
    if b.get('accent', BASE['accent']) != BASE['accent'] or b.get('accentDark', BASE['accentDark']) != BASE['accentDark']:
        css = '<style>:root{--accent:%s;--mxc-line:%s;--good:%s}[data-theme=dark]{--accent:%s;--mxc-line:%s;--good:%s}</style>' % (
            b['accent'], b['accent'], b['accent'], b['accentDark'], b['accentDark'], b['accentDark'])
    return js + css
