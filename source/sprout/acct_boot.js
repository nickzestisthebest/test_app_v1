async function boot(){
  document.body.classList.add('booting');
  const withTimeout=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);
  const nap=ms=>new Promise(r=>setTimeout(r,ms));
  cmdInit();
  try{db=await withTimeout(claude.use('db'),10000)}catch(e){db=null}
  try{userNS=await withTimeout(claude.use('user'),10000)}catch(e){userNS=null}
  let owner=false;try{owner=userNS?await userNS.isOwner():false}catch(e){}
  for(let k=0;k<3&&db&&!uid;k++){try{uid=userNS?(await userNS.id())||((await userNS.me())||{}).id:null}catch(e){uid=null}if(!uid)await nap(800)}
  await acctPull();
  // nobody gets in without an account
  let fresh=false;
  if(!ACC){const R=acctReg();if(R.cur&&R.list[R.cur])ACC=R.cur}
  if(!ACC||!acctMe()){ACC=null;const sp=splashDone();const g=authGate();await sp;fresh=(await g).isNew}
  const me=acctMe();
  const local=loadLocal();
  let loaded=null,cloudFail=!db||!uid;
  for(let k=0;k<3&&db&&uid;k++){
    try{const snap=await db.doc(docPath()).get();mode='cloud';cloudFail=false;if(snap.exists)loaded=snap.data();else if(local&&local.setup){loaded=local;setTimeout(queueSave,50)}break}
    catch(e){cloudFail=true;await nap(800)}
  }
  if(!loaded&&local&&!(owner&&cloudFail))loaded=local;
  if(!loaded&&ADOPT){loaded=ADOPT;ADOPT=null;setTimeout(queueSave,50)}
  if(loaded)state=merge(loaded);
  if(me&&me.demo&&!state.setup){HIST=[];try{histSave()}catch(e){}state=thrivingState();setTimeout(queueSave,50)}
  if(me&&me.demo){const x=X();if(!x.plusDemo2){x.plusDemo2=1;x.plus={on:0,bill:'yr'};setTimeout(queueSave,60)}}
  if(me&&!state.name)state.name=me.first;
  {let lp=null;try{lp=JSON.parse(lsGet(PREFS_LS)||'null')}catch(e){}if(lp&&!state.prefs)state.prefs=Object.assign({},lp)}
  if(me)P().email=me.email;applyPrefs();
  await histLoad();
  editors();plan();restoreOpen();
  setView('ov');await splashDone();if(P().lock)showLock();
  setTimeout(termsCheck,fresh?0:900);
  try{refApply()}catch(e){}
  setSave(mode==='cloud'?'Saved privately to your account':'Saved to your account on this device');
  if(owner&&cloudFail&&!loaded&&!fresh){showLoadError();return}
  if(fresh&&me)toast('Welcome to Sprout, '+me.first+'. Your account is ready.');
  if(state.demo)toast('Example numbers. Redo setup in Edit numbers to use yours.');
  if(!state.setup)setTimeout(()=>openWizard(false),fresh?700:350);
  if(state.link&&state.link.on&&Date.now()-state.link.at>3e5)setTimeout(lkSync,1200);
  if(mode==='cloud'){db.doc(docPath()).onSnapshot(snap=>{if(!snap.exists)return;const d=merge(snap.data());if(JSON.stringify(d)!==JSON.stringify(state)&&!dirty&&!(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))){state=d;saveLocal();editors();plan()}},()=>{})}
}
