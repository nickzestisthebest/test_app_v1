// ===================== Smarter categories: the most specific word wins =====================
// "Kroger Fuel" is gas, not groceries. A pharmacy counter at a grocery store isn't groceries either.
// Your own choices always come first: a purchase you moved, a store Sprout learned from you, your own categories.
const CAT3={};
{
CAT3.SPEC=[
  [/\bfuel\b|gas station|\bgasoline\b|\bshell\b|chevron|exxon|\bbp\b|marathon petro|quik ?trip|\bqt\s*\d|racetrac|\bwawa\b|sheetz|speedway|circle k|valero|sunoco|citgo|\bmobil\b|murphy (usa|express)|\bloves\b|pilot travel|flying j|casey'?s|kwik|\bev ?charg|chargepoint|tesla supercharg/i,'gas'],
  [/uber ?eats|doordash|grubhub|postmates|seamless/i,'din'],
  [/\buber\b(?!\s*eats)|\blyft\b|marta|\btransit\b|parking|\btoll|park ?mobile|parkwhiz|\bamtrak\b/i,'gas']];
{const _co=B2.catOf;B2.catOf=function(s){const k=_co.apply(this,arguments);try{if(!s||s.bc)return k;const b=B2.g(),m=String(s.note||s.m||''),mk=mkey(m);if(mk&&b.rules[mk])return k;
    if(b.custom.some(c=>{const r=B2.rx(c.words);return r&&r.test(m)}))return k;
    for(const x of CAT3.SPEC){if(x[0].test(m)&&BCATS.some(c=>c[0]===x[1]))return x[1]}}catch(e){}return k}}
// the By category view and budgets read the same answer
try{if(window.__S)window.__S.CAT3=CAT3}catch(e){}
}
