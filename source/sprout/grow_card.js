function growthCard(){const sc=sproutScore();let st=0;GROW.forEach((g,i)=>{if(sc>=g[1])st=i});const nx=GROW[st+1],pct=nx?Math.max(4,Math.min(100,(sc-GROW[st][1])/(nx[1]-GROW[st][1])*100)):100;
  const cur=state.debts.reduce((a,d)=>a+ +d.bal,0),debtPaid=Math.max(0,Math.round(Math.max(+state.startDebt||0,cur)-cur)),saved=Math.max(0,Math.round(+state.saved||0));
  return '<section class="ovcard wide gcard" aria-label="Your plant"><div class="gcv">'+treeSvg(st)+'<span class="gcst">Stage '+(st+1)+' of '+GROW.length+'</span></div>'+
   '<div class="gcb"><div class="gch"><span class="gcn">'+GROW[st][0]+'</span><span class="gcd">'+GROW[st][2]+'</span></div>'+
   '<div class="gcp"><b>'+money0(sc)+'</b><span>grown so far</span></div>'+
   '<div class="gcx"><span><i class="a"></i>'+money0(debtPaid)+' debt paid off</span><span><i class="b"></i>'+money0(saved)+' saved</span></div>'+
   '<div class="gcbar"><i style="width:'+pct.toFixed(0)+'%"></i></div>'+
   '<div class="gcnext">'+(nx?'<b>'+money0(nx[1]-sc)+'</b> more to reach <b>'+nx[0]+'</b>':'<b>Fully grown.</b> Keep going to stay green.')+'</div>'+
   '<p class="gchow">Your plant grows with every dollar of debt you pay off and every dollar you save.</p></div></section>'}
