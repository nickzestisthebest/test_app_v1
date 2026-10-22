// ---------- Home order: Today's plan sits right under Safe to spend; the plant lives in the streak sheet ----------
{const _ovw=overview;overview=function(){const r=_ovw.apply(this,arguments);const o=document.getElementById('ov');
  if(o){const tp=o.querySelector('.ovcard.wide.row[data-goto="#guide"]'),h=o.querySelector('.ovhero');if(tp&&h&&h.nextElementSibling!==tp)h.after(tp)}return r}}
{const _ssp=streakSheet;streakSheet=function(){const r=_ssp.apply(this,arguments);const b=document.getElementById('stk-body');
  if(b&&!b.querySelector('.gcard')){b.insertAdjacentHTML('afterbegin',growthCard());const g=b.querySelector('.gcard');if(g){g.classList.add('stkplant');g.removeAttribute('data-goto')}}return r}}
