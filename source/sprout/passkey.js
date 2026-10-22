// ===================== Face ID for real: a passkey kept by your iPhone, unlocked with Face ID or Touch ID =====================
// On your phone (the Sprout app on your Home Screen, or Sprout in Safari), turning on Face ID makes a passkey for this
// account on this phone. Opening Sprout then asks iOS to check your face. Your password always works too.
// In previews where the phone can't do this, Sprout shows the demo animation instead.
const PK={};
{
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
PK.ok=null;
PK.can=async()=>{if(PK.ok!=null)return PK.ok;try{PK.ok=!!(LIVE&&LIVE.on&&window.isSecureContext&&window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())}catch(e){PK.ok=false}return PK.ok};
PK.creds=()=>{const R=acctReg();return R.fidc||{}};
PK.target=()=>{const a=document.getElementById('auth')&&fidAcc()?fidAcc():acctMe();return a||fidAcc()};
PK.make=async a=>{const c=await navigator.credentials.create({publicKey:{rp:{name:'Sprout',id:location.hostname},user:{id:new TextEncoder().encode(String(a.id)).slice(0,64),name:String(a.email||'Sprout account'),displayName:String(a.first||'Sprout')},
  challenge:rnd(32),pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'preferred'},timeout:60000,attestation:'none'}});
  if(!c)throw new Error('none');const R=acctReg();R.fidc=R.fidc||{};R.fidc[a.id]=b64(c.rawId);acctSaveReg(R);return true};
PK.check=async a=>{const id=PK.creds()[a.id];if(!id)return PK.make(a);
  const r=await navigator.credentials.get({publicKey:{challenge:rnd(32),rpId:location.hostname,allowCredentials:[{type:'public-key',id:unb64(id),transports:['internal','hybrid']}],userVerification:'required',timeout:60000}});
  if(!r||b64(r.rawId)!==id)throw new Error('mismatch');return true};
PK.forget=accId=>{const R=acctReg();if(R.fidc&&R.fidc[accId]){delete R.fidc[accId];acctSaveReg(R)}};
const _demo=fidScan;
// same promise as before: onOk runs only after iOS says it's you
fidScan=function(onOk,auto){PK.can().then(real=>{if(!real)return _demo(onOk);const a=PK.target();if(!a)return _demo(onOk);
  PK.check(a).then(()=>{try{onOk&&onOk()}catch(e){}}).catch(err=>{try{if(!PK.creds()[a.id]&&a.id===ACC&&P().faceid){fidSet(false);try{xRender()}catch(_){}}}catch(_){}if(auto)return;const n=err&&err.name;
    if(n==='InvalidStateError'){PK.forget(a.id);toast('Face ID needs to be set up again. Turn it off and on in Settings.')}
    else if(n!=='NotAllowedError'&&n!=='AbortError')toast('Face ID didn’t work here. Use your password.')})})};
// turning Face ID off forgets this phone's passkey for the account
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.x==='pref'&&t.dataset.v==='faceid'&&!t.checked){try{PK.forget(ACC)}catch(_){}}});
try{if(window.__S){window.__S.PK=PK;window.__S.acct=()=>acctMe()}}catch(e){}
}
