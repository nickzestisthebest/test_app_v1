// ---------- accounts: everyone signs up first, and everything lives under their account ----------
const TERMS_V='2026-10-21.2';
// ---------- Terms of Service (plain-language template: have a lawyer review before launch) ----------
const TERMS_SECS=[
 ['1. What Sprout is','Sprout is a budgeting and planning tool made by Sprout Money LLC (“Sprout,” “we”). Sprout is not a bank, lender, credit repair company, or financial, investment, tax or legal advisor. Nothing in Sprout is financial, investment, tax or legal advice. Talk to a qualified professional before making major money decisions.'],
 ['2. Who can use Sprout','You must be at least 18 years old and live in the United States. You agree to give us true and current information and to keep one account for yourself.'],
 ['3. Your account','Keep your password and devices secure. You are responsible for activity on your account. Tell us right away if you think someone else has used it.'],
 ['4. Your numbers may be wrong, so check them','Sprout shows balances, transactions, categories, safe-to-spend amounts, budgets, net worth, subscriptions, possible savings, payoff dates, projections, credit score information and answers from Ask Sprout. This information comes from your bank and other institutions through our bank connection provider, from what you enter, and from Sprout’s own calculations. <b>It can be delayed, incomplete or wrong.</b> For example, a bank can send data late or with errors, a pending charge can change, an account you have not connected is not counted, and Sprout can sort a transaction into the wrong category or mistake a transfer for spending. Sprout does not verify the information it receives. What Sprout shows is not an official statement, balance or record, and it is not a promise of any result. <b>Always check your bank and card statements before you rely on a number from Sprout</b>, especially before you spend, move money or pay a bill. You can correct categories and amounts in the app. You are responsible for your own financial decisions. To the fullest extent the law allows, Sprout is not responsible for overdrafts, fees, interest, late payments, declined payments, credit effects or any other loss that results from relying on information in Sprout, including information that is delayed, missing or wrong. Estimates are not guarantees, and we do not guarantee any savings, refund, lower rate, credit score change or other financial result.'],
 ['5. Ask Sprout','Ask Sprout uses artificial intelligence to answer questions about the numbers in your plan. Answers can be wrong or incomplete. Check anything important before you act on it.'],
 ['6. Cancel for me and Lower my bills','You can start these from their screens or by asking Ask Sprout, and you approve each request separately before anything is sent. When you approve one, you authorize Sprout to contact that provider for you, using the name and email you give us for that account. Sprout never asks for your passwords for other services, and Sprout is not affiliated with the providers it contacts. We keep a record of each approval. You can withdraw a request until we start working on it. Providers make their own decisions. We do not guarantee that a cancellation, discount, credit or refund will happen, how much it will be, or when. You stay responsible for every bill until your provider confirms a change, and you should watch your statements. Some providers may require you to finish a step yourself.'],
 ['7. Credit reports you add','You can add your own credit report, or a picture of a credit score, and Sprout uses it to explain what it says and to complete your plan. Sprout is not a credit bureau or consumer reporting agency, does not get your credit report or score from a credit bureau, does not check or affect your credit, and does not offer credit repair. What Sprout shows can be wrong if your report is wrong or is read incorrectly, so check it against the report itself. To fix an error on a report, contact the credit bureau; you can dispute errors for free. Only add your own report.'],
 ['8. Notifications and Face ID','Notifications are optional, and you choose which kinds you get. They are reminders worked out from your numbers and can be late, missing or wrong, so you stay responsible for paying your bills on time. Face ID uses a passkey that Apple keeps on your device; Sprout never receives your face data, and your password always works too.'],
 ['9. Sprout Plus, billing and refunds','Sprout Plus is an optional paid plan. During early access, Plus comes with an access code we give you, and you are not charged. Before paid plans open, we will show you the price, how often you will be billed and how renewal and cancellation work, and you will choose whether to subscribe. If you subscribe through an app store, that store handles payment and refunds under its own policies. If we change the price, we will tell you in advance and the new price applies at your next renewal. Paying for Plus does not guarantee any savings. The free plan includes the features and usage limits shown in the app, such as a monthly number of screenshot scans. We may change what each plan includes. If we remove a main Plus feature during a period you have paid for, we will tell you in advance and you can cancel.'],
 ['10. Rewards and referrals','Referrals: when someone new signs up with your referral code, you each get one free month of Sprout Plus. Codes must be entered when the new account is created. Each person may have only one Sprout account, and you can earn up to 12 referral months in any 12-month period. Free months add to the end of any free time you already have and do not renew on their own. We may hold a referral reward for review if a sign-up looks like a duplicate. Referrals made with fake, duplicate or self-made accounts earn nothing and may lead to account closure. Streak rewards are promotional credits toward Sprout Plus. Unless we say otherwise in writing, they have no cash value, cannot be transferred and may not be redeemed for money. We may change, pause or end the rewards program, and we may cancel rewards earned through abuse, error or fraud. Rewards are void where prohibited.'],
 ['11. Community','Community is a shared space for posts and comments. Sprout does not offer private messages between members, so do not share anything in Community you would not want other members to see. Be kind and lawful. Do not post account numbers, personal information about others, scams, investment pitches or anything harmful. Posts from other members are their own opinions, not advice from Sprout, so do not rely on them. You keep ownership of what you post and give us permission to show it in Sprout. We may remove posts or accounts that break these rules.'],
 ['12. Other companies’ services','Sprout works with services from other companies, such as Apple, Google and bank connection providers. Their terms apply to your use of their services, and we are not responsible for their actions, errors or outages.'],
 ['13. No warranties','Sprout is provided “as is” and “as available.” To the fullest extent the law allows, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, accuracy and non-infringement. We do not promise that Sprout will always be available, error-free or secure.'],
 ['14. Limits on our liability','To the fullest extent the law allows, Sprout and its owners and team are not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, lost savings, fees, overdrafts, interest or late charges, or for errors, delays or gaps in information from your bank, our bank connection provider or other sources, or in Sprout’s calculations, even if we were told they were possible. Our total liability for any claim about Sprout is limited to the greater of the amount you paid us in the 12 months before the claim or $50. Some states do not allow some of these limits, so they may not all apply to you.'],
 ['15. Your responsibility to us','If you break these terms or the law, or your content harms someone, you agree to cover reasonable losses and costs this causes Sprout, to the extent the law allows.'],
 ['16. Resolving disputes','Please contact us first so we can try to fix the problem. If we cannot resolve it within 60 days, you and Sprout agree to resolve disputes by binding individual arbitration instead of in court, except that either of us may bring a qualifying claim in small claims court. <b>You and Sprout each give up the right to a jury trial and to take part in a class action.</b> You can opt out of arbitration by emailing us within 30 days after you first accept these terms. These terms are governed by the laws of the State of Georgia and applicable federal law.'],
 ['17. Changes to these terms','We may update these terms. If a change is important, we will tell you in the app or by email and ask you to agree again. If you do not agree, you can stop using Sprout and delete your account.'],
 ['18. Ending your account','You can delete your account at any time in Settings. We may suspend or close accounts that break these terms or put others at risk. Sections 4, 6, 7 and 13 to 16 continue after your account ends.'],
 ['19. Contact','Questions about these terms: support@ your Sprout domain.']];
const TERMS_HTML='<p class="tmnote">Template for the demo. Have a lawyer review it before launch.</p>'+TERMS_SECS.map(s=>'<h4>'+s[0]+'</h4><p>'+s[1]+'</p>').join('');
const EST_HTML='<p>Sprout adds up what it finds in the plan you entered or connected:</p><p><b>Subscriptions you don’t use:</b> the monthly price of subscriptions with no recent activity, times 12. This only becomes a saving if you cancel them and the provider confirms.</p><p><b>Bills Sprout can lower:</b> a typical discount for that kind of bill, based on common promotional and loyalty rates. Your provider may offer less, or nothing.</p><p><b>Streak rewards:</b> the most you could earn in Plus credit if you reach every milestone. Credit has no cash value.</p><p>These are estimates to help you decide, not promises. Actual savings vary and are not guaranteed. See section 4 of the Terms of Service.</p>';

function acctReg(){let R=null;try{R=JSON.parse((LSG&&LSG.getItem(ACCKEY))||'null')}catch(e){}if(!R||typeof R!=='object')R={};R.list=R.list||{};R.gone=R.gone||{};return R}
function acctSaveReg(R){try{LSG&&LSG.setItem(ACCKEY,JSON.stringify(R))}catch(e){}}
const acctMe=()=>ACC?acctReg().list[ACC]||null:null;
const regDoc=()=>'data/users/'+uid+'/sprout_accounts';
const acctDoc=n=>'data/users/'+uid+'/a_'+ACC+'_'+n;
async function acctPull(){if(!db||!uid)return;try{const s=await db.doc(regDoc()).get();if(!s.exists)return;const d=s.data()||{},R=acctReg(),cl=d.list||{};
  Object.assign(R.gone,d.gone||{});Object.keys(cl).forEach(k=>{if(!R.gone[k]&&(!R.list[k]||(cl[k].upd||0)>(R.list[k].upd||0)))R.list[k]=cl[k]});Object.keys(R.gone).forEach(k=>delete R.list[k]);if(!R.cur&&!R.out&&d.cur&&R.list[d.cur])R.cur=d.cur;if(R.cur&&!R.list[R.cur])R.cur=null;acctSaveReg(R)}catch(e){}}
async function acctPush(){if(!db||!uid)return;const R=acctReg();try{await db.doc(regDoc()).set(JSON.parse(JSON.stringify({list:R.list,gone:R.gone,cur:R.cur||null,at:Date.now()})))}catch(e){}}
function acctPut(a){const R=acctReg();a.upd=Date.now();R.list[a.id]=a;acctSaveReg(R);acctPush()}
const enc=s=>new TextEncoder().encode(s);
async function pwHash(pw,salt){try{const k=await crypto.subtle.importKey('raw',enc(pw),'PBKDF2',false,['deriveBits']);const b=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc(salt),iterations:150000},k,256);return 'p2$'+btoa(String.fromCharCode(...new Uint8Array(b)))}
  catch(e){let h=5381,g=52711;const s=salt+'|'+pw;for(let i=0;i<40000;i++){const c=s.charCodeAt(i%s.length);h=((h<<5)+h+c)|0;g=((g<<7)^g^c)|0}return 'f$'+(h>>>0).toString(36)+(g>>>0).toString(36)}}
const rid=n=>{const a=new Uint8Array(n);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<n;i++)a[i]=Math.random()*256|0}return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
const code6=()=>{const a=new Uint32Array(1);try{crypto.getRandomValues(a)}catch(e){a[0]=Math.random()*4e9}return String(100000+a[0]%900000)};
const findByEmail=m=>{const L=acctReg().list;return Object.values(L).find(a=>a.email===String(m||'').trim().toLowerCase())||null};
// ---- validation ----
const RX_NAME=/^[\p{L}][\p{L}' .-]{0,39}$/u,RX_MAIL=/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
function ageOf(iso){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');if(!m)return -1;const b=new Date(+m[1],+m[2]-1,+m[3]);if(isNaN(b)||b.getMonth()!==+m[2]-1)return -1;const n=new Date();let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;return a}
const digits=s=>String(s||'').replace(/\D/g,'');
const phone10=s=>{let d=digits(s);if(d.length===11&&d[0]==='1')d=d.slice(1);return d.length===10&&/^[2-9]\d{2}[2-9]/.test(d)?d:''};
const fmtPhone=d=>d?'('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6):'';
// strong passwords, the way banking apps ask for them: long, mixed, and not something easy to guess
const COMMONPW=['password','passw','qwerty','qwertyuiop','asdfgh','letmein','welcome','iloveyou','sprout','admin','monkey','football','baseball','dragon','abc','sunshine','princess','money','master','login','starwars','shadow','superman','trustno','hello','freedom','whatever','michael','jordan','summer','winter','spring','autumn','secret','changeme','test'];
const pwWeakWord=pw=>{const w=String(pw).toLowerCase().replace(/[^a-z]/g,'');return !w||COMMONPW.includes(w)};
const pwRules=(pw,mail)=>{pw=String(pw||'');const nm=String(mail||'').split('@')[0].toLowerCase();return [
  ['10 or more characters',pw.length>=10],
  ['Upper and lowercase letters',/[a-z]/.test(pw)&&/[A-Z]/.test(pw)],
  ['A number',/\d/.test(pw)],
  ['A symbol like ! ? # $',/[^A-Za-z0-9\s]/.test(pw)],
  ['Not your email or an easy word',!!pw&&!(nm.length>2&&pw.toLowerCase().includes(nm))&&!pwWeakWord(pw)&&!/(.)\1\1\1/.test(pw)]]};
const pwMeter=(pw,mail)=>{const n=pwRules(pw,mail).filter(r=>r[1]).length;return '<div class="pwmeter" data-n="'+n+'"><i></i><i></i><i></i><i></i><i></i><span>'+(['Too weak','Too weak','Weak','Getting there','Almost','Strong'][n])+'</span></div>'};
// ---- legal summaries (plain-language templates; have a lawyer finalize before launch) ----
const LEGAL={tos:['Terms of Service',TERMS_HTML],
  privacy:['Privacy Policy and Privacy Notice','<p><b>What we collect:</b> your name, email, phone, date of birth and ZIP, plus the money details you enter or connect.</p><p><b>Why:</b> to run your account, keep it secure, confirm you are an adult in the U.S., and show your plan.</p><p><b>What we never do:</b> sell your personal information, or share it with other companies for their marketing.</p><p><b>Who helps us:</b> trusted service providers (hosting, bank connection, AI answers, email) under contract, only to run Sprout.</p><p><b>Backup:</b> when you use bank sync, an encrypted copy of your plan is kept on your Sprout server so you can sign in on a new phone without losing your plan or streak. You can turn it off in Settings, under Bank sync and AI, and the copy is deleted.</p><p><b>Screenshots and recordings:</b> when you scan, Sprout picks still images on your phone and sends only those to read the transactions. They are not kept.</p><p><b>Your choices:</b> see, export, correct or delete your data any time in Settings. California and other state residents have additional rights, which we honor for everyone.</p>'],
  est:['How savings estimates work',EST_HTML],
  esign:['Consent to electronic communications','<p>You agree to get notices, disclosures and statements from Sprout electronically, by email or in the app, instead of on paper.</p><p>You can withdraw this consent at any time by closing your account or contacting support. You need a device with internet access and an email address to receive them. You can save or print anything we send you.</p>']};
// ---- the sign-up and log-in screen ----
let AU=null,AURES=null,ADOPT=null;
const auEl=()=>document.getElementById('auth');
const AULEAFW='<svg viewBox="0 0 24 24" class="auleaf" aria-hidden="true"><path d="M12 20v-7.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M12 13.5c0-4.6 3.2-7.6 8-7.8.2 4.8-2.9 7.8-8 7.8z" fill="#fff"/><path d="M12 15c0-3.6-2.5-5.9-6.6-6.1-.2 3.8 2.3 6.1 6.6 6.1z" fill="#fff" opacity=".8"/></svg>';
const AULEAF='<svg viewBox="0 0 1024 1024" aria-hidden="true"><path d="M512 810 C512 700 512 600 512 520" stroke="#1f7a42" stroke-width="44" stroke-linecap="round" fill="none"/><path d="M512 560 C512 380 640 268 812 262 C820 440 700 560 512 560 Z" fill="#2fae5a"/><path d="M512 610 C512 470 412 380 246 372 C236 520 340 616 512 610 Z" fill="#6fcf8f"/></svg>';
const auF=(id,label,type,val,ph,extra)=>'<label class="auf'+(AU.err[id]?' bad':'')+'"><span>'+label+'</span><input id="au-'+id+'" data-au="'+id+'" type="'+type+'" value="'+esc(val||'')+'" placeholder="'+esc(ph||'')+'" '+(extra||'')+'>'+(AU.err[id]?'<em role="alert">'+esc(AU.err[id])+'</em>':'')+'</label>';
function authGate(){return new Promise(res=>{AURES=res;AU={mode:'welcome',step:1,d:{},err:{}};let el=auEl();if(!el){el=document.createElement('div');el.id='auth';el.className='auth intro';setTimeout(()=>el.classList.remove('intro'),700);el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Sign up for Sprout');document.body.appendChild(el)}if(!document.getElementById('zenbg')){const z=document.createElement('div');z.id='zenbg';z.setAttribute('aria-hidden','true');z.innerHTML='<i class="zb1"></i><i class="zb2"></i><i class="zb3"></i><i class="zb4"></i><svg class="zw" viewBox="0 0 2400 600" preserveAspectRatio="none"><path d="M0 300 C200 220 400 380 600 300 S1000 220 1200 300 S1600 380 1800 300 S2200 220 2400 300"/><path class="zw2" d="M0 360 C200 300 400 420 600 360 S1000 300 1200 360 S1600 420 1800 360 S2200 300 2400 360"/></svg>';document.body.appendChild(z)}document.body.classList.add('authing');auRender()})}
function auRender(focusId){const el=auEl();if(!el)return;const d=AU.d;let h='',title='',sub='';
  el.classList.toggle('welcome',AU.mode==='welcome');
  if(AU.mode==='welcome'){
    const S=[
     ['Money made easy.','Know exactly what you can spend today. No spreadsheets, no guilt.',
      '<div class="wv wv1"><div class="wvc"><small>Safe to spend today</small><b>$27.49</b><i class="wvbar"><u style="width:64%"></u></i><div class="wvrow"><span>Basics left</span><em>$142.10</em></div><div class="wvrow"><span>Fun left</span><em>$38.00</em></div></div><div class="wvc wvmini"><span class="wvdot"></span>Rent is covered. Next paycheck Friday.</div></div>'],
     ['Just ask.','Ask Sprout anything about your money and get a real answer from your own numbers.',
      '<div class="wv wv2"><p class="wvme">Can I afford a $60 concert Friday?</p><p class="wvai"><b>Yes.</b> You’ll still have $142 for groceries and gas until payday.</p><p class="wvme">How fast can I pay off my Visa?</p><p class="wvai">At $180 a month, <b>by next August</b>. Add $40 and it’s June.</p></div>'],
     ['Snap it. Done.','Log a purchase from a screenshot. Sprout matches it to your bank so nothing counts twice.',
      '<div class="wv wv3"><div class="wvshot"><small>Cash App</small><b>$25.00</b><span>to Alex R.</span></div><div class="wvarrow">→</div><div class="wvc wvtx"><div class="wvrow"><span><b>Alex R.</b><br><small>Cash App · today</small></span><em>$25.00</em></div><div class="wvok">✓ Matched to checking</div></div></div>'],
     ['Grow a little every day.','Stay on plan, build a streak and watch your plant grow as your debt shrinks.',
      '<div class="wv wv4"><div class="wvplant">'+AULEAF+'</div><div class="wvc wvstreak"><b>64</b><span>day green streak</span></div><div class="wvc wvgrown"><small>Grown so far</small><b>$3,240</b></div></div>']];
    el.innerHTML='<div class="auin auw"><div class="auwtop"><span class="auwicon">'+AULEAF+'</span><b>Sprout</b></div>'+
      '<div class="auwslides" id="auw-sl" role="region" aria-label="What Sprout does">'+S.map((x,k)=>'<section class="auwslide" aria-label="'+(k+1)+' of '+S.length+'"><div class="auwvis">'+x[2]+'</div><h1 class="auwh">'+x[0]+'</h1><p class="auwp">'+x[1]+'</p></section>').join('')+'</div>'+
      '<div class="auwdots" role="tablist">'+S.map((x,k)=>'<button type="button" role="tab" aria-label="Show slide '+(k+1)+'" data-auw="'+k+'" class="'+(k?'':'on')+'"></button>').join('')+'</div>'+
      '<div class="auwbtns">'+ssoBtns('Continue')+'<button type="button" class="aubtn auleafb" data-au-act="tosignup">'+AULEAFW+'Sign up with email</button><p class="aualt">Already have an account? <button type="button" class="aulnk" data-au-act="tologin">Log in</button></p></div></div>'+ssoSheet();
    auwInit();return}
  if(AU.mode==='signup'){
    const ST=d.prov?[2,3]:[1,2,3,4],prog='<div class="auprog'+(d.prov?' two':'')+'" aria-label="Step '+(ST.indexOf(AU.step)+1)+' of '+ST.length+'">'+ST.map(i=>'<i class="'+(i<=AU.step?'on':'')+'"></i>').join('')+'</div>'+(d.prov?'<p class="ssonote">Signed in with '+PROV[d.prov]+' as <b>'+esc(d.email)+'</b></p>':'');
    if(AU.step===1){title='Create your account';sub='Money made easy starts here. It takes about a minute.';
      const R=pwRules(d.pw||'',d.email);
      h=ssoBtns('Sign up')+'<p class="auor">or use your email</p>'+prog+'<div class="aurow">'+auF('first','Legal first name','text',d.first,'Jordan','autocomplete="given-name" maxlength="40"')+auF('last','Legal last name','text',d.last,'Lee','autocomplete="family-name" maxlength="40"')+'</div>'+
        auF('email','Email','email',d.email,'you@example.com','autocomplete="email" inputmode="email" autocapitalize="off"')+
        '<div class="aupw">'+auF('pw','Password',AU.show?'text':'password',d.pw,'Create a password','autocomplete="new-password"')+'<button type="button" class="aueye" data-au-act="eye" aria-label="'+(AU.show?'Hide':'Show')+' password">'+(AU.show?'Hide':'Show')+'</button></div>'+
        pwMeter(d.pw,d.email)+'<ul class="aurules">'+R.map(r=>'<li class="'+(r[1]?'ok':'')+'">'+r[0]+'</li>').join('')+'</ul>'+
        '<button class="aubtn" data-au-act="next1">Continue</button><p class="aualt">Already have an account? <button class="aulnk" data-au-act="tologin">Log in</button></p>'}
    else if(AU.step===2){title='A bit about you';sub='Like every money app, Sprout confirms you’re an adult in the U.S. and keeps a way to reach you if something looks wrong.';
      const mx=new Date();mx.setFullYear(mx.getFullYear()-18);
      h=prog+auF('dob','Date of birth','date',d.dob,'','autocomplete="bday" max="'+fd(mx.getTime())+'" min="1900-01-01"')+
        auF('phone','Mobile number','tel',d.phone,'(555) 123-4567','autocomplete="tel-national" inputmode="tel" maxlength="16"')+
        auF('zip','ZIP code','text',d.zip,'10001','autocomplete="postal-code" inputmode="numeric" maxlength="10"')+
        '<p class="aufine">You must be 18 or older and live in the U.S. Your phone is only used for security codes and urgent account alerts.</p>'+
        '<button class="aubtn" data-au-act="next2">Continue</button><button class="aulnk aubk" data-au-act="back">Back</button>'}
    else if(AU.step===3){title='The fine print';sub='Short and in plain words. Tap any one to read it.';
      const cb=(k,label,req)=>'<label class="aucb'+(AU.err[k]?' bad':'')+'"><input type="checkbox" data-au="'+k+'"'+(d[k]?' checked':'')+'><span>'+label+(req?'':' <small>(optional)</small>')+'</span></label>';
      h=prog+'<div class="aucbs">'+cb('tos','I agree to the <button type="button" class="aulnk" data-au-doc="tos">Terms of Service</button>, including that estimates aren’t guarantees and the arbitration agreement, and confirm I’m 18+ and live in the U.S.',1)+
        cb('privacy','I’ve read the <button type="button" class="aulnk" data-au-doc="privacy">Privacy Policy and Privacy Notice</button>',1)+
        cb('esign','I agree to get notices and disclosures <button type="button" class="aulnk" data-au-doc="esign">electronically</button>',1)+
        cb('mkt','Send me tips and product news by email',0)+'</div>'+auF('ref','Referral code (optional)','text',d.ref,'SPRT-XXXXXX','autocapitalize="characters" autocomplete="off" maxlength="12"')+(AU.err.agree?'<p class="auerr" role="alert">'+AU.err.agree+'</p>':'')+
        '<p class="aufine">Sprout never sells your personal information. Bank connections are read-only and can never move money.</p>'+
        '<button class="aubtn" data-au-act="next3">Agree and continue</button><button class="aulnk aubk" data-au-act="back">Back</button>'}
    else{title='Check your email';sub='We sent a 6-digit code to <b>'+esc(d.email)+'</b>.';
      h=prog+auF('code','Verification code','text',d.code,'123456','inputmode="numeric" autocomplete="one-time-code" maxlength="6" class="aucode"')+
        '<p class="audemo">Demo: email isn’t connected yet, so here is your code: <b>'+AU.code+'</b></p>'+
        '<button class="aubtn" data-au-act="verify">Verify and create account</button><p class="aualt"><button class="aulnk" data-au-act="resend">Send a new code</button> · <button class="aulnk" data-au-act="chmail">Change email</button></p>'}}
  else if(AU.mode==='login'){title='Welcome back';sub='Log in to see your plan.';
    h=(fidAcc()?'<button type="button" class="fidbtn aufid" data-au-act="fidlogin">'+FIDG+'<span>Log in with Face ID<br><small>'+esc(fidAcc().email)+'</small></span></button><p class="auor">or</p>':'')+ssoBtns('Continue')+'<p class="auor">or log in with email</p>'+auF('email','Email','email',d.email,'you@example.com','autocomplete="username" inputmode="email" autocapitalize="off"')+
      '<div class="aupw">'+auF('pw','Password',AU.show?'text':'password',d.pw,'Your password','autocomplete="current-password"')+'<button type="button" class="aueye" data-au-act="eye" aria-label="'+(AU.show?'Hide':'Show')+' password">'+(AU.show?'Hide':'Show')+'</button></div>'+
      (AU.err.login?'<p class="auerr" role="alert">'+esc(AU.err.login)+'</p>':'')+
      '<button class="aubtn auleafb" data-au-act="login">'+AULEAFW+'Log in</button><p class="audemo">Demo account: <b>'+DEMO.email+'</b> · password <b>'+DEMO.pw+'</b> <button type="button" class="aulnk" data-au-act="demofill">Fill it in</button></p><button class="aulnk aubk" data-au-act="toreset">Forgot password?</button><p class="aualt">New to Sprout? <button class="aulnk" data-au-act="tosignup">Create an account</button></p>'}
  else{title='Reset your password';
    if(AU.step===1){sub='Enter your email and we’ll send you a code.';h=auF('email','Email','email',d.email,'you@example.com','autocomplete="username" inputmode="email" autocapitalize="off"')+'<button class="aubtn" data-au-act="rsend">Send code</button><button class="aulnk aubk" data-au-act="tologin">Back to log in</button>'}
    else{sub='Enter the code we sent to <b>'+esc(d.email)+'</b> and choose a new password.';const R=pwRules(d.pw||'',d.email);
      h=auF('code','Code','text',d.code,'123456','inputmode="numeric" autocomplete="one-time-code" maxlength="6" class="aucode"')+'<p class="audemo">Demo: your code is <b>'+AU.code+'</b></p>'+
        '<div class="aupw">'+auF('pw','New password',AU.show?'text':'password',d.pw,'New password','autocomplete="new-password"')+'<button type="button" class="aueye" data-au-act="eye" aria-label="'+(AU.show?'Hide':'Show')+' password">'+(AU.show?'Hide':'Show')+'</button></div>'+
        pwMeter(d.pw,d.email)+'<ul class="aurules">'+R.map(r=>'<li class="'+(r[1]?'ok':'')+'">'+r[0]+'</li>').join('')+'</ul><button class="aubtn" data-au-act="rset">Save and log in</button><button class="aulnk aubk" data-au-act="tologin">Back to log in</button>'}}
  el.innerHTML='<div class="auin"><div class="aulogo"><button type="button" class="auback" data-au-act="home" aria-label="Back to start"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>'+AULEAF+'<b>Sprout</b></div><div class="aucard"><h1>'+title+'</h1>'+(sub?'<p class="ausub">'+sub+'</p>':'')+'<form class="auform" novalidate>'+h+'</form></div><p class="aufoot">Your data is private to your account. Sprout v2 demo: real secure sign-in comes with the launch backend.</p></div>'+
    ssoSheet()+(AU.doc?'<div class="audoc" role="dialog" aria-modal="true" aria-label="'+esc(LEGAL[AU.doc][0])+'"><div class="audocc"><h2>'+LEGAL[AU.doc][0]+'</h2><small>Version '+TERMS_V+' · plain-language summary</small>'+LEGAL[AU.doc][1]+'<button class="aubtn" data-au-act="docclose">Done</button></div></div>':'');
  const f=focusId?document.getElementById('au-'+focusId):el.querySelector('.auf.bad input');if(f){try{f.focus({preventScroll:false})}catch(e){}}}
// welcome slides: swipe or tap the dots; they move on by themselves until you touch them
let AUWT=null;
function auwInit(){clearInterval(AUWT);const sl=document.getElementById('auw-sl');if(!sl)return;let user=false,ix=0;
  const go=k=>{ix=k;sl.scrollTo({left:k*sl.clientWidth,behavior:'smooth'})};
  const sync=()=>{const k=Math.round(sl.scrollLeft/Math.max(1,sl.clientWidth));if(k!==ix)ix=k;document.querySelectorAll('#auth [data-auw]').forEach((d,i)=>{d.classList.toggle('on',i===k);d.setAttribute('aria-selected',i===k)})};
  sl.addEventListener('scroll',()=>requestAnimationFrame(sync),{passive:true});
  ['touchstart','pointerdown','wheel'].forEach(t=>sl.addEventListener(t,()=>{user=true;clearInterval(AUWT)},{passive:true}));
  document.querySelectorAll('#auth [data-auw]').forEach(d=>d.addEventListener('click',()=>{user=true;clearInterval(AUWT);go(+d.dataset.auw)}));
  let RMq=false;try{RMq=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  if(!RMq)AUWT=setInterval(()=>{if(user||!document.getElementById('auw-sl')){clearInterval(AUWT);return}go((ix+1)%4)},4800)}
const ssoBtns=(lbl)=>'<div class="ssos"><button type="button" class="ssob apple" data-au-act="sso" data-v="apple">'+lbl+' with Apple</button><button type="button" class="ssob google" data-au-act="sso" data-v="google">'+lbl+' with Google</button></div>';
const PROV={apple:'Apple',google:'Google'};
function ssoSheet(){const o=AU.sso;if(!o)return '';const P=PROV[o.prov],dd=AU.d;
  return '<div class="audoc ssosh" role="dialog" aria-modal="true" aria-label="'+(P)+' sign-in"><div class="audocc"><div class="ssohd"><b>Sign in with '+P+'</b><button type="button" class="aulnk" data-au-act="ssoclose">Cancel</button></div>'+
   '<p class="audemo">Demo: the real '+P+' sign-in screen opens here once Sprout launches on the App Store. For now, type the name and email '+P+' would share.</p>'+
   '<div class="aurow">'+auF('sfirst','First name','text',dd.sfirst,'Jordan','autocomplete="given-name"')+auF('slast','Last name','text',dd.slast,'Lee','autocomplete="family-name"')+'</div>'+
   auF('semail',P+' email','email',dd.semail,o.prov==='apple'?'you@icloud.com':'you@gmail.com','autocomplete="email" inputmode="email" autocapitalize="off"')+
   (o.prov==='apple'?'<div class="ssohide"><label class="aucb"><input type="radio" name="ssoh" data-au="shide" value="0"'+(dd.shide==='1'?'':' checked')+'><span><b>Share my email</b></span></label><label class="aucb"><input type="radio" name="ssoh" data-au="shide" value="1"'+(dd.shide==='1'?' checked':'')+'><span><b>Hide my email</b><br><small>Apple gives Sprout a private relay address that forwards to you</small></span></label></div>':'')+
   (AU.err.sso?'<p class="auerr" role="alert">'+esc(AU.err.sso)+'</p>':'')+
   '<button class="aubtn" data-au-act="ssogo">Continue</button></div></div>'}
const DEMO={email:'demo@sprout.app',pw:'Sprout!2026'};
async function ensureDemo(){const R=acctReg();{const ex=Object.values(R.list).find(a=>a.email===DEMO.email);if(ex){if(ex.pwv!==2){ex.salt='sprout-demo-salt2';ex.pwh=await pwHash(DEMO.pw,ex.salt);ex.pwv=2;acctPut(ex)}return}}delete R.gone.demo;acctSaveReg(R);const now=Date.now(),salt='sprout-demo-salt';
  acctPut({id:'demo',demo:true,first:'Jordan',last:'Lee',email:DEMO.email,phone:'(555) 010-2026',dob:'1996-05-14',zip:'30303',country:'US',salt,pwh:await pwHash(DEMO.pw,salt),created:now,verified:now,agree:{v:TERMS_V,at:now,tos:true,privacy:true,esign:true},mkt:false,pwv:2})}
async function createAcct(b,d){b.disabled=true;b.textContent='Creating your account…';const L=acctReg().list,first=!Object.values(L).some(a=>!a.demo),id=rid(8),now=Date.now(),salt=d.prov?null:rid(16);
  const acc={id,first:d.first,last:d.last,email:d.email,phone:d.phone,dob:d.dob,zip:d.zip,country:'US',salt,pwh:d.prov?null:await pwHash(d.pw,salt),prov:d.prov||null,sso:d.prov?{[d.prov]:d.ssoid}:null,created:now,verified:now,
    agree:{v:TERMS_V,at:now,tos:true,privacy:true,esign:true},mkt:!!d.mkt,mktAt:d.mkt?now:null};
  acc.ref=refCodeFor(id);if(d.dupHint)acc.dupHint=true;refGrant(acc,d.refBy);acctPut(acc);ACC=id;if(first)await adoptLegacy();auDone(acc,true)}
function auErr(e,focus){AU.err=e;auRender(focus||Object.keys(e)[0])}
// ---- explore first: close the window, look around a sample plan, nothing is saved ----
function guestBar(on){let g=document.getElementById('guestbar');
  if(on&&!g){g=document.createElement('div');g.id='guestbar';g.className='guestbar';g.setAttribute('role','region');g.setAttribute('aria-label','Exploring without an account');
    g.innerHTML='<span><b>Exploring a sample plan</b><small>Nothing is saved. Sign up to start yours.</small></span><button type="button" class="gbtn" data-guest="signup">Sign up</button><button type="button" class="gbl" data-guest="login">Log in</button>';document.body.appendChild(g)}
  if(g)g.hidden=!on;document.body.classList.toggle('guest',!!on)}
function auHide(){const el=auEl();if(!el||!AU)return;AU.hidden=true;AU.doc=null;el.classList.add('out');document.body.classList.remove('authing');setTimeout(()=>{if(AU&&AU.hidden)el.hidden=true},360);guestBar(true)}
function auShow(mode){const el=auEl();if(!el||!AU)return;if(mode&&mode!==AU.mode)AU={mode,step:1,d:{email:AU.d.email},err:{}};AU.hidden=false;
  try{closeSheets()}catch(e){}el.hidden=false;el.classList.remove('out');el.classList.add('intro');setTimeout(()=>el.classList.remove('intro'),700);document.body.classList.add('authing');guestBar(false);auRender()}
const isGuest=()=>!ACC&&!!AU;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-guest]');if(!b)return;e.preventDefault();auShow(b.dataset.guest)});
async function auDone(a,isNew){{const R0=acctReg();R0.cur=a.id;delete R0.out;acctSaveReg(R0);acctPush()}guestBar(false);const R=acctReg();R.cur=a.id;acctSaveReg(R);ACC=a.id;
  const el=auEl();if(el){el.classList.add('out');setTimeout(()=>{el.remove();document.body.classList.remove('authing')},450)}{const z=document.getElementById('zenbg');if(z){z.classList.add('out');setTimeout(()=>z.remove(),600)}}
  const r=AURES;AU=null;AURES=null;if(r)r({isNew})}
async function adoptLegacy(){// the first account on this device keeps any plan made before accounts existed
  if(!LSG)return;const ks=[];for(let i=0;i<LSG.length;i++){const k=LSG.key(i);if(k&&k.indexOf('::')<0&&!lsGlobal(k)&&k!=='sprout-lp-hint'&&k!=='sprout-hl-last')ks.push(k)}
  ks.forEach(k=>{const n=k+'::'+ACC;if(LSG.getItem(n)==null)LSG.setItem(n,LSG.getItem(k))});
  if(db&&uid){try{const s=await db.doc('data/users/'+uid+'/state').get();if(s.exists&&s.data()&&s.data().setup)ADOPT=s.data()}catch(e){}}}
document.addEventListener('input',e=>{const t=e.target;if(!AU||!t.dataset||!t.dataset.au)return;const k=t.dataset.au;AU.d[k]=t.type==='checkbox'?t.checked:t.value;
  if(AU.err[k]){delete AU.err[k];const l=t.closest('.auf,.aucb');if(l){l.classList.remove('bad');const m=l.querySelector('em');if(m)m.remove()}}
  if(k==='pw'||k==='email'){const ul=document.querySelector('#auth .aurules');if(ul){const R=pwRules(AU.d.pw||'',AU.d.email);ul.querySelectorAll('li').forEach((li,i)=>li.classList.toggle('ok',R[i][1]))}
    const m=document.querySelector('#auth .pwmeter');if(m)m.outerHTML=pwMeter(AU.d.pw||'',AU.d.email)}
  if(t.type==='checkbox'&&AU.err.agree&&AU.d.tos&&AU.d.privacy&&AU.d.esign){delete AU.err.agree;const p=document.querySelector('#auth .auerr');if(p)p.remove()}});
document.addEventListener('change',e=>{const t=e.target;if(AU&&t.dataset&&t.dataset.au&&t.type==='checkbox')AU.d[t.dataset.au]=t.checked});
document.addEventListener('submit',e=>{if(e.target.closest&&e.target.closest('#auth')){e.preventDefault();const b=document.querySelector('#auth .aubtn');if(b)b.click()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&AU&&e.target.closest&&e.target.closest('#auth')&&e.target.tagName==='INPUT'&&e.target.type!=='checkbox'){e.preventDefault();const b=document.querySelector('#auth .auform .aubtn');if(b)b.click()}
  if(e.key==='Escape'&&AU&&AU.doc){AU.doc=null;auRender();return}
});
document.addEventListener('click',async e=>{if(!AU)return;const dl=e.target.closest&&e.target.closest('[data-au-doc]');if(dl){e.preventDefault();AU.doc=dl.dataset.auDoc;auRender();return}
  const b=e.target.closest&&e.target.closest('[data-au-act]');if(!b)return;e.preventDefault();const a=b.dataset.auAct,d=AU.d;
  const mail=String(d.email||'').trim().toLowerCase();
  switch(a){
   case 'home':AU={mode:'welcome',step:1,d:{email:d.email},err:{}};auRender();break;
   case 'eye':AU.show=!AU.show;auRender('pw');break;
   case 'docclose':AU.doc=null;auRender();break;
   case 'tologin':AU={mode:'login',step:1,d:{email:d.email},err:{}};auRender('email');break;
   case 'tosignup':AU={mode:'signup',step:1,d:{email:d.email},err:{}};auRender('first');break;
   case 'toreset':AU={mode:'reset',step:1,d:{email:d.email},err:{}};auRender('email');break;
   case 'back':if(d.prov&&AU.step===2){AU={mode:'welcome',step:1,d:{},err:{}};auRender();break}AU.step--;AU.err={};auRender();break;
   case 'fidlogin':{const acc=fidAcc();if(acc)fidScan(()=>{acc.last_in=Date.now();acctPut(acc);auDone(acc,false)});break}
   case 'demofill':d.email=DEMO.email;d.pw=DEMO.pw;AU.err={};auRender();break;
   case 'sso':AU.sso={prov:b.dataset.v};AU.err={};auRender('sfirst');break;
   case 'ssoclose':AU.sso=null;AU.err={};auRender();break;
   case 'ssogo':{const prov=AU.sso.prov,fn=String(d.sfirst||'').trim(),ln=String(d.slast||'').trim(),em=String(d.semail||'').trim().toLowerCase();
     if(!RX_NAME.test(fn)||!RX_NAME.test(ln)){auErr({sso:'Enter your first and last name'},'sfirst');break}
     if(!RX_MAIL.test(em)){auErr({sso:'Enter the email for your '+PROV[prov]+' account'},'semail');break}
     const L=acctReg().list,acc=Object.values(L).find(a=>a.sso&&a.sso[prov]===em)||findByEmail(em);
     if(acc){acc.sso=acc.sso||{};acc.sso[prov]=em;acc.last_in=Date.now();acctPut(acc);AU.sso=null;auDone(acc,false);break}
     const email=prov==='apple'&&d.shide==='1'?rid(5)+'@privaterelay.appleid.com':em;
     AU={mode:'signup',step:2,d:{first:fn,last:ln,email,prov,ssoid:em},err:{}};auRender('dob');break}
   case 'next1':{const E={},fn=String(d.first||'').trim(),ln=String(d.last||'').trim();
     if(!RX_NAME.test(fn))E.first=fn?'Use letters only':'Enter your first name';
     if(!RX_NAME.test(ln))E.last=ln?'Use letters only':'Enter your last name';
     if(!RX_MAIL.test(mail))E.email=mail?'That email doesn’t look right':'Enter your email';else if(findByEmail(mail))E.email='There’s already an account with this email. Log in instead.';
     if(!pwRules(d.pw||'',mail).every(r=>r[1]))E.pw='Your password needs everything below';
     if(Object.keys(E).length){auErr(E);break}d.first=fn;d.last=ln;d.email=mail;AU.step=2;AU.err={};auRender('dob');break}
   case 'next2':{const E={},ag=ageOf(d.dob),ph=phone10(d.phone),z=String(d.zip||'').trim();
     if(ag<0||ag>120)E.dob='Enter your date of birth';else if(ag<18)E.dob='You need to be 18 or older to use Sprout';
     if(!ph)E.phone='Enter a 10-digit U.S. mobile number';
     if(!/^\d{5}(-\d{4})?$/.test(z))E.zip='Enter a 5-digit U.S. ZIP code';
     if(!E.phone&&ph&&Object.values(acctReg().list).some(a=>digits(a.phone)===ph&&!a.demo))E.phone='This phone number is already on a Sprout account. Each person can have one account. Log in instead.';
     // same name and birthday is allowed (different people can share both); it only holds back referral rewards for a review
     d.dupHint=!E.dob&&Object.values(acctReg().list).some(a=>!a.demo&&a.dob===d.dob&&String(a.first).trim().toLowerCase()===String(d.first).trim().toLowerCase()&&String(a.last).trim().toLowerCase()===String(d.last).trim().toLowerCase());
     if(Object.keys(E).length){auErr(E);break}d.phone=fmtPhone(ph);d.zip=z;AU.step=3;AU.err={};auRender();break}
   case 'next3':{if(String(d.ref||'').trim()){const who=refFind(d.ref);if(!who){auErr({ref:'We couldn’t find that code. Check it, or leave it blank.'},'ref');break}d.refBy=who.id}else d.refBy=null;
     if(!(d.tos&&d.privacy&&d.esign)){const E={agree:'Please agree to the three required items to create your account.'};['tos','privacy','esign'].forEach(k=>{if(!d[k])E[k]=1});auErr(E,'x');break}
     if(d.prov){await createAcct(b,d);break}
     AU.code=code6();AU.sent=Date.now();AU.tries=0;AU.step=4;AU.err={};auRender('code');break}
   case 'resend':AU.code=code6();AU.tries=0;d.code='';auRender('code');toast('New code sent to '+d.email);break;
   case 'chmail':AU.step=1;AU.err={};auRender('email');break;
   case 'verify':{const c=digits(d.code);if(c.length!==6){auErr({code:'Enter the 6-digit code'});break}
     if(Date.now()-AU.sent>15*60e3){auErr({code:'That code expired. Send a new one.'});break}
     if(c!==AU.code){AU.tries=(AU.tries||0)+1;auErr({code:AU.tries>=5?'Too many tries. Send a new code.':'That code isn’t right'});if(AU.tries>=5)AU.code=code6()+'x';break}
     if(findByEmail(mail)){AU.step=1;auErr({email:'There’s already an account with this email. Log in instead.'});break}
     d.email=mail;await createAcct(b,d);break}
   case 'login':{const E={};if(mail===DEMO.email)await ensureDemo();if(!RX_MAIL.test(mail)){auErr({email:mail?'That email doesn’t look right':'Enter your email'});break}if(!d.pw){auErr({pw:'Enter your password'});break}
     const acc=findByEmail(mail);if(acc&&acc.lockUntil&&acc.lockUntil>Date.now()){auErr({login:'Too many tries. Wait a minute, or reset your password.'},'pw');break}
     // accounts are saved on each phone for now (and the Home Screen app keeps its own copy, apart from Safari): say so plainly
     if(!acc){d.pw='';auErr({login:'There’s no Sprout account with this email on this phone yet. Accounts are saved on each phone for now, and the Home Screen app keeps its own, separate from Safari. Tap Create account and use the same email. If bank sync was on, your banks and your backed-up plan come back.'},'email');break}
     if(acc&&!acc.pwh){auErr({login:'This account uses '+PROV[acc.prov]+'. Tap “Continue with '+PROV[acc.prov]+'” above. To log in with your email too, add a password in Settings › Account › Password.'},'pw');break}
     b.disabled=true;const ok=acc&&await pwHash(d.pw,acc.salt)===acc.pwh;b.disabled=false;
     if(!ok){if(acc){acc.fails=(acc.fails||0)+1;if(acc.fails>=5){acc.fails=0;acc.lockUntil=Date.now()+60e3}acctPut(acc)}d.pw='';auErr({login:'That email and password don’t match.'},'pw');break}
     acc.fails=0;acc.lockUntil=0;acc.last_in=Date.now();acctPut(acc);auDone(acc,false);break}
   case 'rsend':{if(!RX_MAIL.test(mail)){auErr({email:'Enter the email on your account'});break}{const ac=findByEmail(mail);if(ac&&!ac.pwh){auErr({email:'This account uses '+PROV[ac.prov]+', so there’s no Sprout password to reset.'});break}}d.email=mail;AU.code=code6();AU.sent=Date.now();AU.step=2;AU.err={};auRender('code');break}
   case 'rset':{const acc=findByEmail(mail),c=digits(d.code);if(!acc||c!==AU.code){auErr({code:'That code isn’t right'});break}
     if(!pwRules(d.pw||'',mail).every(r=>r[1])){auErr({pw:'Your password needs everything below'});break}
     acc.salt=rid(16);acc.pwh=await pwHash(d.pw,acc.salt);acc.fails=0;acc.lockUntil=0;acctPut(acc);toast('Password updated');auDone(acc,false);break}
  }});
// ---- signed-in account: settings pages and actions ----
async function acctSignOut(){try{saveLocal();if(mode==='cloud'&&dirty){clearTimeout(timer);await doSave()}}catch(e){}const R=acctReg();R.cur=null;R.out=Date.now();acctSaveReg(R);await acctPush();document.body.classList.add('booting');setTimeout(()=>location.reload(),60)}
const dobMask=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?'••/••/'+m[1]:''};
PAGES.acctinfo=()=>{const a=acctMe()||{};const dt=t=>t?new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'';
  const row=(l,v)=>'<div class="srow"><span class="slab">'+l+'</span><span class="sval">'+v+'</span></div>';
  return sgroup('Account',[row('Legal name',esc((a.first||'')+' '+(a.last||''))),row('Email',esc(a.email||'')+' <span class="auok">Verified</span>'),row('Sign-in',a.prov?'Sign in with '+PROV[a.prov]:'Email and password'),row('Mobile',esc(a.phone||'')),row('Date of birth',dobMask(a.dob)),row('ZIP code',esc(a.zip||'')),row('Member since',dt(a.created))])+
   sgroup('Agreements',[row('Terms of Service','Agreed '+dt(a.agree&&a.agree.at)),row('Privacy Policy','Agreed '+dt(a.agree&&a.agree.at)),row('Electronic notices','Agreed '+dt(a.agree&&a.agree.at)),
     '<label class="srow"><span class="slab">Tips and product news<small>By email, unsubscribe any time</small></span><input type="checkbox" class="sw" data-x="mkt"'+(a.mkt?' checked':'')+'></label>'])+
   '<p class="xhint">To change your legal name or date of birth, contact support. Every setting and number in Sprout is saved under this account only.</p>'};
PAGES.pwchange=()=>{const a=acctMe()||{},add=!a.pwh,R=pwRules('',a.email);
  return (add?'<div class="xcard"><h3>Add a password</h3><p style="margin:0">You sign in with '+PROV[a.prov]+'. Add a password if you also want to log in with your email, <b>'+esc(a.email)+'</b>. '+PROV[a.prov]+' sign-in keeps working either way.</p></div>':'')+
  '<div class="xf">'+(add?'':'<label class="f">Current password<input id="pw-old" type="password" autocomplete="current-password"></label>')+'<label class="f">New password<input id="pw-new" type="password" autocomplete="new-password"></label>'+pwMeter('',a.email)+'<ul class="aurules" id="pw-rules">'+R.map(r=>'<li>'+r[0]+'</li>').join('')+'</ul><label class="f">Confirm new password<input id="pw-new2" type="password" autocomplete="new-password"></label><button class="btn" data-x="pwsave">'+(add?'Add password':'Update password')+'</button></div>'};
document.addEventListener('input',e=>{if(!e.target||e.target.id!=='pw-new')return;const a=acctMe()||{},R=pwRules(e.target.value,a.email);document.querySelectorAll('#pw-rules li').forEach((li,i)=>li.classList.toggle('ok',R[i][1]));const m=document.querySelector('#x-body .pwmeter');if(m)m.outerHTML=pwMeter(e.target.value,a.email)});
PAGES.acctdel=()=>(acctMe()||{}).prov?PAGES.acctdel0().replace(/<label class="f">Password<input id="del-pw"[^>]*><\/label>/,''):PAGES.acctdel0();
PAGES.acctdel0=()=>'<div class="xcard"><h3>Delete your Sprout account</h3><p style="margin:0">This permanently erases your account, plan, history, settings, profile, posts and any backup on your server. It can’t be undone. Export your data first if you want a copy.</p></div><div class="xf"><label class="f">Password<input id="del-pw" type="password" autocomplete="current-password"></label><label class="f">Type DELETE to confirm<input id="del-ok" type="text" autocapitalize="characters" placeholder="DELETE"></label><button class="btn bad" data-x="acctdelgo">Delete my account</button></div>';
Object.assign(IC,{trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6'});
Object.assign(TITLES,{acctinfo:'Your account',pwchange:'Change password',acctdel:'Delete account'});
document.addEventListener('change',e=>{if(e.target&&e.target.dataset&&e.target.dataset.x==='mkt'){const a=acctMe();if(a){a.mkt=e.target.checked;a.mktAt=Date.now();acctPut(a);toast(a.mkt?'You’ll get tips by email':'Unsubscribed from tips')}}});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x;
  if(a==='pwsave'){const acc=acctMe();if(!acc)return;const n=$('#pw-new').value,n2=$('#pw-new2').value;
    if(acc.pwh&&await pwHash(($('#pw-old')||{}).value||'',acc.salt)!==acc.pwh){toast('Your current password isn’t right');return}
    if(!pwRules(n,acc.email).every(r=>r[1])){toast('Your new password needs everything on the list');return}if(n!==n2){toast('The new passwords don’t match');return}
    const added=!acc.pwh;acc.salt=rid(16);acc.pwh=await pwHash(n,acc.salt);acctPut(acc);xBack();toast(added?'Password added. You can now log in with your email too.':'Password updated')}
  if(a==='acctdelgo'){const acc=acctMe();if(!acc)return;if(($('#del-ok').value||'').trim().toUpperCase()!=='DELETE'){toast('Type DELETE to confirm');return}
    if(acc.pwh&&await pwHash(($('#del-pw')||{}).value||'',acc.salt)!==acc.pwh){toast('That password isn’t right');return}
    b.disabled=true;b.textContent='Deleting…';clearTimeout(timer);mode='none';
    if(db&&uid){for(const n of ['state','backup','history'])try{await db.doc(acctDoc(n)).delete()}catch(_){}}
    if(LSG){const ks=[];for(let i=0;i<LSG.length;i++){const k=LSG.key(i);if(k&&k.endsWith('::'+acc.id))ks.push(k)}ks.forEach(k=>LSG.removeItem(k))}
    const R=acctReg();delete R.list[acc.id];R.gone[acc.id]=Date.now();R.cur=null;acctSaveReg(R);await acctPush();document.body.classList.add('booting');setTimeout(()=>location.reload(),80)}});

// ---- legal pages in Settings, and asking everyone to agree again when the Terms change ----
PAGES.legal=()=>sgroup('Legal',[['tos','Terms of Service','Version '+TERMS_V],['privacy','Privacy Policy',''],['est','How savings estimates work',''],['esign','Electronic notices','']].map(d=>'<button type="button" class="srow" data-x="legaldoc" data-v="'+d[0]+'"><span class="sico">'+ic('doc')+'</span><span class="slab">'+d[1]+(d[2]?'<small>'+d[2]+'</small>':'')+'</span><span class="schev">›</span></button>'))+
  '<div class="xcard"><h3>In plain words</h3><p style="margin:0">Sprout helps you plan. It isn’t financial advice, and estimates like possible savings aren’t guarantees. Your plan is private, and you can export or delete it any time.</p></div>';
PAGES.legaldoc=k=>{const L=LEGAL[k]||LEGAL.tos;return '<div class="xcard legaldoc"><h3>'+L[0]+'</h3>'+L[1]+'</div>'};
Object.assign(TITLES,{legal:'Privacy and terms',legaldoc:'Legal'});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=legaldoc]');if(b){e.preventDefault();xGo('legaldoc',b.dataset.v)}});
function termsCheck(){const a=acctMe();if(!a||(a.agree&&a.agree.v===TERMS_V)||document.getElementById('tmup'))return;
  const d=document.createElement('div');d.id='tmup';d.className='tmup';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Updated Terms of Service');
  d.innerHTML='<div class="tmupc"><span class="plbadge">Updated</span><h2>We updated our Terms</h2><p>We made our Terms of Service clearer about a few things:</p><ul><li>Savings and other numbers in Sprout are <b>estimates, not guarantees</b>.</li><li>Cancel for me and Lower my bills depend on your providers. You approve each request, and Sprout never asks for your passwords for other services.</li><li>How Sprout Plus billing, refunds and streak rewards work.</li><li>How disputes are handled, including individual arbitration.</li></ul><button type="button" class="aulnk" data-x="tmread">Read the full Terms</button><div class="tmbody" hidden>'+TERMS_HTML+'</div><label class="aucb"><input type="checkbox" id="tm-ok"><span>I agree to the updated Terms of Service</span></label><button type="button" class="btn" data-x="tmagree">Continue</button></div>';
  document.body.appendChild(d)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-x=tmread],[data-x=tmagree]');if(!b)return;e.preventDefault();
  if(b.dataset.x==='tmread'){const t=document.querySelector('#tmup .tmbody');if(t){t.hidden=!t.hidden;b.textContent=t.hidden?'Read the full Terms':'Hide the full Terms'}return}
  if(!document.getElementById('tm-ok').checked){toast('Check the box to agree');return}
  const a=acctMe();if(a){a.agree=Object.assign({},a.agree,{v:TERMS_V,at:Date.now(),tos:true});acctPut(a)}const d=document.getElementById('tmup');if(d)d.remove();toast('Thanks. You’re all set.')});
