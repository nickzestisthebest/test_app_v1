let SZN=0;
// Style A: the Sprout leaf keeps growing (matches the logo)
function leafPlant(st){const u='la'+(SZN++);let o='';const f=n=>(+n).toFixed(1);
  const defs='<defs><linearGradient id="'+u+'a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1f8a45"/><stop offset="1" stop-color="#5fd08a"/></linearGradient><linearGradient id="'+u+'b" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a9f52"/><stop offset="1" stop-color="#9be3b6"/></linearGradient></defs>';
  const leaf=(x,y,s,ang,alt)=>{o+='<g transform="translate('+f(x)+' '+f(y)+') rotate('+f(ang)+') scale('+f(s)+')"><path d="M0 0 C0 -4 3 -7 8 -7 C8 -2 5 1 0 1Z" fill="url(#'+u+(alt?'b':'a')+')"/><path d="M0.4 0 C2.5 -2.2 4.5 -4.2 7 -6.2" stroke="#e6f8ec" stroke-width=".35" fill="none" opacity=".75" stroke-linecap="round"/></g>'};
  const stem=(d,w)=>{o+='<path d="'+d+'" stroke="#2a8a4e" stroke-width="'+w+'" fill="none" stroke-linecap="round"/>'};
  const G=196;
  if(st===0){stem('M150 '+G+' C150 '+(G-12)+' 150 '+(G-22)+' 150 '+(G-30),3);leaf(150,G-28,2.6,0);leaf(150,G-22,2.2,180,1)}
  else if(st===1){stem('M150 '+G+' C150 '+(G-25)+' 152 '+(G-45)+' 150 '+(G-62),3.6);leaf(150,G-50,3.2,0);leaf(150,G-40,2.8,180,1);leaf(150,G-60,1.5,-30)}
  else if(st===2){stem('M150 '+G+' C146 '+(G-40)+' 158 '+(G-70)+' 150 '+(G-108),4.6);[[150,G-36,3.4,195,1],[152,G-54,3.6,-10],[154,G-74,3.2,190,1],[152,G-92,2.8,-15],[150,G-106,2,-40]].forEach(l=>leaf(...l))}
  else if(st===3){stem('M150 '+G+' C144 '+(G-50)+' 160 '+(G-90)+' 148 '+(G-140),5.6);stem('M151 '+(G-60)+' C168 '+(G-70)+' 182 '+(G-84)+' 192 '+(G-104),3.4);stem('M152 '+(G-82)+' C136 '+(G-92)+' 120 '+(G-100)+' 110 '+(G-118),3);
    [[150,G-34,3.6,195,1],[151,G-48,3.6,-8],[192,G-104,3,-35],[180,G-88,2.8,15],[172,G-80,2.6,200,1],[110,G-118,2.8,215,1],[124,G-100,2.6,170,1],[136,G-94,2.4,-60],[150,G-110,3.2,-12],[149,G-126,3,190,1],[148,G-140,2.2,-35]].forEach(l=>leaf(...l))}
  else{stem('M150 '+G+' C142 '+(G-60)+' 164 '+(G-110)+' 146 '+(G-170),7);stem('M150 '+(G-56)+' C176 '+(G-66)+' 200 '+(G-82)+' 214 '+(G-108),4.2);stem('M152 '+(G-78)+' C126 '+(G-88)+' 104 '+(G-100)+' 88 '+(G-124),4);stem('M154 '+(G-112)+' C176 '+(G-122)+' 190 '+(G-136)+' 198 '+(G-156),3.2);stem('M150 '+(G-124)+' C130 '+(G-134)+' 118 '+(G-146)+' 110 '+(G-164),3);
    [[150,G-30,3.8,195,1],[151,G-44,3.8,-8],[214,G-108,3.2,-40],[200,G-88,3,15],[190,G-78,2.8,200,1],[88,G-124,3.2,210,1],[104,G-102,3,165,1],[120,G-94,2.6,-60],[198,G-156,3,-45],[186,G-132,2.6,20],[110,G-164,3,215,1],[124,G-140,2.6,170,1],[152,G-96,3,-15],[150,G-140,3.2,190,1],[148,G-158,3,-15],[146,G-172,2.4,-40]].forEach(l=>leaf(...l))}
  const ground='<ellipse cx="150" cy="'+(G+3)+'" rx="'+(30+st*12)+'" ry="5" fill="#1f6e3c" opacity=".12"/>';
  return '<svg class="plant" viewBox="0 -14 300 224" role="img" aria-label="Your plant">'+defs+ground+'<g class="sway">'+o+'</g></svg>'}
