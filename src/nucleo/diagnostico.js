/* Diagnóstico del botón Atrás (Perfil → Acerca de → tocar 3 veces la versión): guarda los últimos 30 eventos de navegación
   en este teléfono ('ciberlab-diagnostico'; no entra al respaldo ni sale del teléfono salvo que tú lo copies y lo envíes). */
const CLAVE='ciberlab-diagnostico',MAX=30;
const leer=()=>{try{const l=JSON.parse(localStorage.getItem(CLAVE));return Array.isArray(l)?l:[]}catch(e){return []}};
export function registrar(tipo,datos={}){
  try{
    const l=leer();
    l.push({t:new Date().toISOString().slice(11,23),tipo,...datos,len:history.length,i:history.state?.i??null,
      activo:navigator.userActivation?navigator.userActivation.hasBeenActive:null,ahora:navigator.userActivation?navigator.userActivation.isActive:null});
    localStorage.setItem(CLAVE,JSON.stringify(l.slice(-MAX)));
  }catch(e){}
}
export const esTWA=()=>{try{return document.referrer.startsWith('android-app://')||sessionStorage.getItem('ciberlab-twa')==='1'}catch(e){return false}};
// El referrer android-app:// solo está en la primera carga: se recuerda en la sesión
try{if(document.referrer.startsWith('android-app://'))sessionStorage.setItem('ciberlab-twa','1')}catch(e){}
export function versionChrome(){
  const b=navigator.userAgentData?.brands?.find(x=>/Chrom/.test(x.brand)&&!/Not/.test(x.brand));
  if(b)return `${b.brand} ${b.version}`;
  const m=/(Chrome|CriOS|Edg)\/([\d.]+)/.exec(navigator.userAgent);return m?`${m[1]} ${m[2]}`:'(no es Chrome)';
}
export function textoDiagnostico(version){
  const cab=[`Versión de la app: ${version}`,`TWA (APK): ${esTWA()?'sí':'no'} · referrer: ${document.referrer||'(vacío)'}`,`Navegador: ${versionChrome()}`,
    `Modo: ${matchMedia('(display-mode: standalone)').matches?'standalone':'navegador'} · ${navigator.userAgent}`,`history.length ahora: ${history.length} · estado: ${JSON.stringify(history.state)}`,''];
  return cab.concat(leer().map(e=>`${e.t} ${e.tipo.padEnd(8)} ${e.ruta!==undefined?'#'+e.ruta:''} len=${e.len} i=${e.i} activo=${e.activo}/${e.ahora}${e.nota?' · '+e.nota:''}`)).join('\n');
}
export const borrarDiagnostico=()=>{try{localStorage.removeItem(CLAVE)}catch(e){}};
