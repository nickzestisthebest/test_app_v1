// ===================== App switcher cover: a calm branded screen whenever you leave the app =====================
// iPhone takes its app-switcher snapshot as the app goes to the background, so the cover goes up on the first sign of
// leaving (blur on phones, page hidden everywhere) and fades away when you come back. On by default; Settings › Passcode and Face ID.
const COV={};
{
const on=()=>{try{return !P().nocover}catch(e){return true}};
const phone=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true||matchMedia('(pointer: coarse)').matches}catch(e){return false}};
COV.el=()=>{let d=document.getElementById('cov4');if(d)return d;d=document.createElement('div');d.id='cov4';d.setAttribute('aria-hidden','true');
  const B=window.BRAND||{};d.innerHTML='<div class="cov4in"><span class="cov4mark">'+(typeof LEAF==='function'?LEAF('','currentColor'):'')+'</span><b class="cov4name">'+esc(B.name||'Sprout')+'</b><span class="cov4tag">'+esc(B.tagline||'Grow a little every day')+'</span></div>';
  document.body.appendChild(d);return d};
COV.show=()=>{if(!on())return;const d=COV.el();clearTimeout(COV.t);d.classList.remove('out');d.classList.add('on')};
COV.hide=()=>{const d=document.getElementById('cov4');if(!d||!d.classList.contains('on'))return;clearTimeout(COV.t);
  // a short beat so the snapshot never catches the app half-revealed, then a soft fade
  COV.t=setTimeout(()=>{d.classList.add('out');COV.t=setTimeout(()=>{d.classList.remove('on','out')},380)},120)};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')COV.show();else COV.hide()});
window.addEventListener('pagehide',COV.show);window.addEventListener('pageshow',COV.hide);
// phones: the app switcher gesture blurs the window before the page is hidden; desktops ignore blur (clicking the address bar shouldn't cover the app)
window.addEventListener('blur',()=>{if(phone()&&!(document.activeElement&&/^(IFRAME)$/.test(document.activeElement.tagName)))COV.show()});
window.addEventListener('focus',COV.hide);
// a tap on the cover (if it ever lingers) clears it
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#cov4'))COV.hide()},true);
// the setting
{const _sec=PAGES.security;if(_sec)PAGES.security=function(){let h=_sec.apply(this,arguments);try{const p=P();
    h+=sgroup('Privacy',['<label class="srow"><span class="sico">'+ic('eye')+'</span><span class="slab">Cover the app when you leave<small>Shows a calm screen instead of your money in the app switcher</small></span><input type="checkbox" class="sw" data-x="cov4" '+(p.nocover?'':'checked')+'></label>'])}catch(e){}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.x!=='cov4')return;const p=P();if(t.checked)delete p.nocover;else p.nocover=1;try{savePrefs()}catch(_){}try{queueSave()}catch(_){}toast(t.checked?'The app is covered when you leave it.':'The app switcher will show your screen.')});
try{if(window.__S)window.__S.COV=COV}catch(e){}
}
