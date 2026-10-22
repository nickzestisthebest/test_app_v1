let BZN=0;
function bonsaiSVG(st){let o='';const f=n=>(+n).toFixed(1);let seed=7+st*13;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const u='bz'+(BZN++);
  const defs='<defs><radialGradient id="'+u+'l" cx="32%" cy="28%" r="78%"><stop offset="0" stop-color="#b5ecc8"/><stop offset=".45" stop-color="#5fc285"/><stop offset="1" stop-color="#2a8a52"/></radialGradient>'+
   '<radialGradient id="'+u+'d" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#3e9e64"/><stop offset="1" stop-color="#1d6a3e"/></radialGradient>'+
   '<linearGradient id="'+u+'t" x1="0" x2="1"><stop offset="0" stop-color="#9a7457"/><stop offset=".55" stop-color="#6b4f3c"/><stop offset="1" stop-color="#4b3628"/></linearGradient>'+
   '<linearGradient id="'+u+'p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4f0"/><stop offset="1" stop-color="#b9cbbf"/></linearGradient>'+
   '<linearGradient id="'+u+'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfdcd3"/></linearGradient>'+
   '<radialGradient id="'+u+'s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0d2a1a" stop-opacity=".22"/><stop offset="1" stop-color="#0d2a1a" stop-opacity="0"/></radialGradient></defs>';
  const pad=(cx,cy,w,h)=>{const pts=[];const n=Math.round(9+w/6);for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd());pts.push([cx+Math.cos(a)*r*w*.4,cy+Math.sin(a)*r*h*.34,w*(.14+rnd()*.1)])}
    pts.sort((a,b)=>a[1]-b[1]);
    o+='<ellipse cx="'+f(cx)+'" cy="'+f(cy+h*.42)+'" rx="'+f(w*.5)+'" ry="'+f(h*.18)+'" fill="url(#'+u+'s)"/>';
    o+=pts.map(p=>'<circle cx="'+f(p[0])+'" cy="'+f(p[1]+h*.14)+'" r="'+f(p[2])+'" fill="url(#'+u+'d)"/>').join('');
    o+=pts.map(p=>'<circle cx="'+f(p[0])+'" cy="'+f(p[1])+'" r="'+f(p[2]*.96)+'" fill="url(#'+u+'l)"/>').join('')};
  const limb=(x1,y1,w1,qx,qy,x2,y2,w2)=>{const ang=Math.atan2(y2-y1,x2-x1)+Math.PI/2,c=Math.cos(ang),s=Math.sin(ang);
    o+='<path fill="url(#'+u+'t)" d="M'+f(x1+c*w1/2)+' '+f(y1+s*w1/2)+' Q'+f(qx+c*(w1+w2)/4)+' '+f(qy+s*(w1+w2)/4)+' '+f(x2+c*w2/2)+' '+f(y2+s*w2/2)+' L'+f(x2-c*w2/2)+' '+f(y2-s*w2/2)+' Q'+f(qx-c*(w1+w2)/4)+' '+f(qy-s*(w1+w2)/4)+' '+f(x1-c*w1/2)+' '+f(y1-s*w1/2)+'Z"/>'};
  const root=(a,b,c,d)=>{o+='<path fill="url(#'+u+'t)" d="M'+a+' '+G+' Q'+(b)+' '+(G-6)+' '+(b+4)+' '+(G-16)+' L'+(c-4)+' '+(G-16)+' Q'+c+' '+(G-6)+' '+d+' '+G+'Z"/>'};
  const G=170;
  if(st===0){o+='<path d="M150 '+G+' C150 '+(G-8)+' 150 '+(G-14)+' 151 '+(G-20)+'" stroke="#3f9f63" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="158" cy="'+(G-22)+'" rx="8" ry="3.6" fill="url(#'+u+'l)" transform="rotate(-25 158 '+(G-22)+')"/><ellipse cx="143" cy="'+(G-21)+'" rx="7" ry="3.2" fill="url(#'+u+'l)" transform="rotate(20 143 '+(G-21)+')"/>'}
  else if(st===1){limb(150,G,5,148,G-25,152,G-54,2);limb(151,G-36,2.2,160,G-44,168,G-48,1.2);pad(168,G-50,28,15);pad(150,G-60,34,17)}
  else if(st===2){limb(150,G,13,140,G-35,146,G-78,5);limb(146,G-50,5,168,G-60,182,G-64,2.2);limb(144,G-40,4,126,G-46,118,G-50,2);pad(184,G-66,42,19);pad(116,G-52,36,17);pad(146,G-86,58,25)}
  else if(st===3){root(124,138,162,178);limb(150,G-6,20,132,G-50,148,G-100,8);limb(144,G-60,8,182,G-74,200,G-80,3);limb(140,G-44,7,112,G-56,98,G-62,3);limb(147,G-86,5,128,G-98,120,G-104,2.4);pad(202,G-82,58,23);pad(98,G-64,50,21);pad(120,G-106,44,19);pad(150,G-114,72,29)}
  else{root(110,134,166,194);limb(150,G-8,30,124,G-60,146,G-118,11);limb(140,G-70,11,196,G-86,224,G-94,4);limb(136,G-50,10,96,G-62,72,G-70,4);limb(146,G-100,7,118,G-116,104,G-124,3);limb(148,G-104,6,176,G-122,190,G-126,3);
    pad(228,G-98,72,27);pad(70,G-74,64,25);pad(102,G-128,54,21);pad(192,G-130,52,21);pad(148,G-142,88,33)}
  const pot='<ellipse cx="150" cy="'+(G+40)+'" rx="88" ry="6" fill="url(#'+u+'s)"/>'+
   '<path d="M76 '+(G+8)+' H224 C224 '+(G+22)+' 212 '+(G+32)+' 192 '+(G+32)+' H108 C88 '+(G+32)+' 76 '+(G+22)+' 76 '+(G+8)+'Z" fill="url(#'+u+'p)"/>'+
   '<path d="M86 '+(G+12)+' C90 '+(G+22)+' 98 '+(G+27)+' 110 '+(G+28)+'" stroke="#fff" stroke-opacity=".7" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
   '<rect x="72" y="'+(G)+'" width="156" height="9" rx="4.5" fill="url(#'+u+'r)"/><rect x="72" y="'+(G+7)+'" width="156" height="2" rx="1" fill="#a9bdb0" opacity=".6"/>'+
   '<path d="M84 '+(G+1)+' Q150 '+(G-4)+' 216 '+(G+1)+'Z" fill="#5d4637"/>'+[96,108,190,204].map((x,i)=>'<ellipse cx="'+x+'" cy="'+(G)+'" rx="'+(4+i%2)+'" ry="2" fill="url(#'+u+'l)"/>').join('');
  return '<svg class="bonsai" viewBox="0 0 300 220" role="img" aria-label="Bonsai stage '+(st+1)+'">'+defs+o+pot+'</svg>'}
