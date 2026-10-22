// ----- press, hold and slide: keep your finger down, slide onto an option, let go -----
// Phones use raw touch events (they keep arriving even when the browser cancels pointer events
// for its own long-press, text selection or scrolling). Mouse and pen use pointer events.
let LPDOWN=null,LPHL=null;
const HTMLEL=document.documentElement;
function lpHL(it){if(it===LPHL)return;if(LPHL)LPHL.classList.remove('hl');LPHL=it;if(it){it.classList.add('hl');try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}}}
const lpItemAt=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('#lpm .lpm-i'):null};
function lpPick(x,y){const b=lpItemAt(x,y);lpHL(null);if(!b)return false;
  const o=document.getElementById('lpm'),it=o&&o.__items&&o.__items[+b.dataset.lpi];LPSUP=true;setTimeout(()=>{LPSUP=false},450);
  lpClose();if(it&&it.fn)setTimeout(()=>it.fn(),60);return true}
function lpTrack(x,y){if(!LPDOWN.moved&&Math.hypot(x-LPDOWN.x,y-LPDOWN.y)>8)LPDOWN.moved=true;if(LPDOWN.moved)lpHL(lpItemAt(x,y))}
const lpEnd=()=>{LPDOWN=null;HTMLEL.classList.remove('lp-hold')};
// ---- touch ----
addEventListener('touchstart',e=>{if(e.touches.length!==1){lpEnd();return}const t=e.touches[0];LPDOWN={touch:true,x:t.clientX,y:t.clientY,moved:false};
  if(lpFind(e.target)||LPOPEN)HTMLEL.classList.add('lp-hold')},{capture:true,passive:true});
addEventListener('touchmove',e=>{if(!LPDOWN||!LPDOWN.touch||!LPOPEN)return;e.preventDefault();const t=e.touches[0];lpTrack(t.clientX,t.clientY)},{capture:true,passive:false});
addEventListener('touchend',e=>{const d=LPDOWN;lpEnd();if(!d||!d.touch)return;if(!LPOPEN||!d.moved){lpHL(null);return}
  const t=e.changedTouches[0];if(lpPick(t.clientX,t.clientY)&&e.cancelable)e.preventDefault()},{capture:true,passive:false});
addEventListener('touchcancel',()=>{lpEnd();lpHL(null)},true);
// ---- mouse and pen ----
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button>0)return;LPDOWN={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false}},{capture:true,passive:true});
addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!LPOPEN||!LPDOWN||LPDOWN.touch||e.pointerId!==LPDOWN.id)return;lpTrack(e.clientX,e.clientY)},{passive:true});
addEventListener('pointerup',e=>{if(e.pointerType==='touch')return;const d=LPDOWN;LPDOWN=null;if(!d||d.touch||!LPOPEN||e.pointerId!==d.id||!d.moved){lpHL(null);return}lpPick(e.clientX,e.clientY)},true);
