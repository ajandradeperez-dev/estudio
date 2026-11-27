/* ⚡ Electrónica · código de colores de resistencias (4 y 5 bandas) y series E12/E24 (sin DOM). */
export const COLORES=[['negro','#111111'],['café','#7c4a1e'],['rojo','#dc2626'],['naranja','#ea580c'],['amarillo','#facc15'],['verde','#16a34a'],['azul','#2563eb'],['violeta','#7c3aed'],['gris','#9ca3af'],['blanco','#f8fafc']];
export const MULT={negro:1,café:10,rojo:100,naranja:1e3,amarillo:1e4,verde:1e5,azul:1e6,violeta:1e7,oro:0.1,plata:0.01};
export const TOL={café:1,rojo:2,verde:0.5,azul:0.25,violeta:0.1,gris:0.05,oro:5,plata:10};
export const E12=[10,12,15,18,22,27,33,39,47,56,68,82];
export const E24=[10,11,12,13,15,16,18,20,22,24,27,30,33,36,39,43,47,51,56,62,68,75,82,91];
const nombre=i=>COLORES[i][0],indice=c=>COLORES.findIndex(([n])=>n===c);
// [bandas] → ohms. 4 bandas: 2 cifras + multiplicador (+ tolerancia); 5 bandas: 3 cifras + multiplicador (+ tolerancia)
export function valorDeBandas(bandas){
  const cifras=bandas.length>=5?3:2,d=bandas.slice(0,cifras).map(indice);
  if(d.some(x=>x<0))return NaN;const m=MULT[bandas[cifras]];if(m===undefined)return NaN;
  return Math.round(+d.join('')*m*100)/100;
}
// ohms → bandas (con tolerancia de oro para 4 bandas y café para 5)
export function bandasDeValor(ohm,num=4){
  const cifras=num>=5?3:2;let e=Math.floor(Math.log10(ohm))-(cifras-1),base=Math.round(ohm/10**e);
  if(base>=10**cifras){base=Math.round(base/10);e++}
  const multNombre=Object.entries(MULT).find(([,v])=>Math.abs(v-10**e)<1e-12*Math.max(1,10**e))?.[0];
  if(!multNombre)return null;
  return [...String(base).padStart(cifras,'0').split('').map(x=>nombre(+x)),multNombre,num>=5?'café':'oro'];
}
// valores comerciales de 10 Ω a 1 MΩ
export const valoresE12=(min=10,max=1e6)=>{const out=[];for(let d=1;d<=6;d++)for(const b of E12){const v=b*10**(d-1);if(v>=min&&v<=max)out.push(v)}return out};
export function comercialCercano(ohm,serie=E12){let mejor=null;for(let d=-1;d<=7;d++)for(const b of serie){const v=b*10**(d-1);if(!mejor||Math.abs(Math.log(v/ohm))<Math.abs(Math.log(mejor/ohm)))mejor=v}return Math.round(mejor*100)/100}
export const colorDe=n=>(COLORES.find(([x])=>x===n)||[null,n==='oro'?'#c9a227':n==='plata'?'#c0c0c0':'#999'])[1];
