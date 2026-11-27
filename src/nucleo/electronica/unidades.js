/* ⚡ Electrónica · unidades, prefijos y notación de ingeniería (sin DOM).
   leerIng('4.7k') → 4700 · '220u' / '220µF' → 0.00022 · '1M' → 1e6 · '4k7' → 4700 · '2,2 kΩ' → 2200 · '10 mA' → 0.01
   fmtIng(0.0047,'A') → '4.7 mA' (prefijos de 10³ en 10³, hasta 3 cifras significativas). */
const PREF={T:1e12,G:1e9,M:1e6,k:1e3,K:1e3,m:1e-3,u:1e-6,'µ':1e-6,'μ':1e-6,n:1e-9,p:1e-12};
// unidades que se aceptan después del número (y se ignoran al leer)
const UNIDADES=['Ω','ohm','ohms','ohmios','V','A','W','F','H','Hz','s','J','Wh','VA','VAR','var','C','S','dB','°','rad'];

export function leerIng(entrada){
  let s=String(entrada??'').trim().replace(/\s+/g,'').replace(/−/g,'-').replace(/,/g,'.');
  if(!s)return NaN;
  s=s.replace(/^[a-zA-Zα-ω_]+\s*=/,'');   // «R = 4.7k», «I=2mA»
  // 4k7, 2M2, 1R5 (notación de los planos)
  let m=s.match(/^(-?\d+)([kKMRmuµμnp])(\d+)(.*)$/);
  if(m)return valido(+(`${m[1]}.${m[3]}`)*(m[2]==='R'?1:PREF[m[2]]),m[4]);
  m=s.match(/^(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*(.*)$/i);if(!m)return NaN;
  const n=+m[1];let resto=m[2];
  if(!resto)return n;
  // ¿empieza con un prefijo seguido de unidad (o solo)? «mA», «kΩ», «M», «u»; ojo: «m» sola es mili, pero «min» no
  for(const u of [...UNIDADES].sort((a,b)=>b.length-a.length))if(resto===u)return n;
  const p=resto[0];if(PREF[p]!==undefined){const u=resto.slice(1);if(!u||UNIDADES.includes(u))return n*PREF[p]}
  return NaN;
}
const valido=(n,resto)=>!resto||UNIDADES.includes(resto)?n:NaN;
// ¿coincide con tolerancia relativa? (por defecto 1 %: valores comerciales y redondeos)
export const igualIng=(e,v,tol=0.01)=>{const x=leerIng(e);return Number.isFinite(x)&&Math.abs(x-v)<=Math.max(tol*Math.abs(v),1e-12)};

const SIMB=[[1e12,'T'],[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']];
export function fmtIng(v,unidad='',cifras=3){
  if(!Number.isFinite(v))return '—';if(v===0)return `0${unidad?' '+unidad:''}`;
  const a=Math.abs(v),[k,s]=SIMB.find(([k])=>a>=k*0.9995)||SIMB.at(-1);
  const x=+(v/k).toPrecision(cifras);
  return `${x}${unidad||s?' ':''}${s}${unidad}`.replace(/ $/,'');
}
// número «bonito» para mostrar en un enunciado (sin notación científica)
export const fmtNum=(v,dec=3)=>String(+(+v).toFixed(dec));
