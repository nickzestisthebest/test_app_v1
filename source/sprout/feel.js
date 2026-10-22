// ===================== Feels like an app: no zooming, no accidental highlighting, and a text size you choose =====================
const FEEL={};
{
// pinch and double-tap zoom stay off (iOS ignores the viewport setting in Safari, so the gesture is stopped too)
['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>{e.preventDefault()},{passive:false}));
// double-tap zoom is off through touch-action: manipulation, so quick taps on buttons still work
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
// a long press on text doesn't select it or pop up a menu, except where you type or copy on purpose
document.addEventListener('contextmenu',e=>{if(!(e.target.closest&&e.target.closest('input,textarea,[contenteditable],.sel,.askmsg,.chatb')))e.preventDefault()});
// text size
FEEL.SIZES=[['1','Default'],['1.1','Larger'],['1.2','Largest']];
FEEL.apply=()=>{try{const v=+((P()||{}).tsize||1);document.documentElement.style.setProperty('--tsz',v);document.documentElement.classList.toggle('tsz',v>1)}catch(e){}};
{const _ap=PAGES.appearance;PAGES.appearance=function(){const p=P(),v=String(p.tsize||1);return _ap.apply(this,arguments)+'<div class="xcard"><h3>Text size</h3><div class="mxseg">'+FEEL.SIZES.map(s=>'<button type="button" role="tab" aria-selected="'+(v===s[0])+'" data-tsize="'+s[0]+'">'+s[1]+'</button>').join('')+'</div><p class="xhint" style="margin:0">Makes words and numbers bigger across Sprout.</p></div>'}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tsize]');if(!b)return;const p=P();p.tsize=+b.dataset.tsize;FEEL.apply();queueSave();xRender()});
FEEL.apply();setTimeout(FEEL.apply,500);
// ---------- talking to log: never let the mic hang the app ----------
// On an iPhone Home Screen app, the browser's speech engine can stall the page, so Sprout uses the keyboard's own
// dictation there. Elsewhere it listens for at most 10 seconds, can be stopped with a second tap, and updates the
// preview a few times a second instead of on every sound.
FEEL.standalone=()=>{try{return !!(navigator.standalone||matchMedia('(display-mode: standalone)').matches)}catch(e){return false}};
FEEL.ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let REC=null,RT=null,WD=null,LAST=0;
const micOff=b=>{if(b){b.classList.remove('on');b.setAttribute('aria-pressed','false')}};
const stopRec=()=>{clearTimeout(RT);clearTimeout(WD);try{if(REC)REC.abort()}catch(e){}REC=null;micOff(document.querySelector('[data-qlmic]'))};
const keyboardTip=i=>{i.focus();toast('Tap the microphone on your keyboard and say it, like “12 at Chipotle”')};
if(typeof QL!=='undefined')QL.listen=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition,i=document.getElementById('ql-in'),b=document.querySelector('[data-qlmic]');if(!i)return;
  if(REC){stopRec();return}
  if(!SR||(FEEL.ios()&&FEEL.standalone())||!window.isSecureContext){keyboardTip(i);return}
  let r;try{r=new SR()}catch(e){keyboardTip(i);return}
  REC=r;let started=false;r.lang='en-US';r.interimResults=true;r.maxAlternatives=1;r.continuous=false;
  if(b){b.classList.add('on');b.setAttribute('aria-pressed','true')}
  r.onstart=()=>{started=true};r.onaudiostart=()=>{started=true};
  r.onresult=ev=>{let t='';try{for(let k=0;k<ev.results.length;k++)t+=ev.results[k][0].transcript}catch(e){}i.value=t;const now=Date.now();if(now-LAST>250){LAST=now;try{QL.render()}catch(e){}}};
  r.onerror=ev=>{const n=ev&&ev.error;stopRec();if(n==='not-allowed'||n==='service-not-allowed')toast('Microphone is off for Sprout. You can type it, or use your keyboard’s microphone.');else keyboardTip(i)};
  r.onend=()=>{REC=null;micOff(b);clearTimeout(RT);clearTimeout(WD);try{QL.render()}catch(e){}};
  // if nothing starts in 3 seconds, give up quietly and offer the keyboard instead
  WD=setTimeout(()=>{if(!started){stopRec();keyboardTip(i)}},3000);
  RT=setTimeout(()=>{try{r.stop()}catch(e){stopRec()}},10000);
  try{r.start()}catch(e){stopRec();keyboardTip(i)}};
// closing the sheet always stops listening
{const _cs=closeSheets;closeSheets=function(){stopRec();return _cs.apply(this,arguments)}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRec()});
try{if(window.__S)window.__S.FEEL=FEEL}catch(e){}
}
