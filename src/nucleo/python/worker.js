/* Web Worker con Python (Pyodide 0.29.5, Python 3.13) para el curso de Python. Se crea solo al abrir el editor o el
   laboratorio, así Pyodide (~10 MB) no está en el paquete principal; los archivos vienen de jsDelivr la primera vez y el
   service worker los guarda en la caché 'pyodide' (después funciona sin internet). Pyodide 314 ya no se puede cargar con
   importScripts en un worker clásico: por eso 0.29.5 (también es la que usa npm run python).
   Si un programa no termina (bucle infinito), la página termina este worker y crea otro (runner.js).
   Mensajes: {id, tipo:'cargar'|'correr', codigo, entrada:[líneas para input()]}. */
// En la app nativa Pyodide va dentro del APK (scripts/app/apk.mjs lo copia a pyodide/): funciona sin internet desde el inicio
// (si el APK se armó sin Python, --sin-python, se usa jsDelivr como en la web)
const VERSION='0.29.5',NATIVA=typeof __NATIVA__!=='undefined'&&__NATIVA__,CDN=`https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
let listo=null;
function cargar(){
  if(!listo){let base=CDN;
    if(NATIVA)try{const local=new URL('/pyodide/',self.location.origin).href;importScripts(`${local}pyodide.js`);base=local}catch(e){importScripts(`${CDN}pyodide.js`)}
    else importScripts(`${CDN}pyodide.js`);
    listo=self.loadPyodide({indexURL:base})}
  return listo;
}
self.onmessage=async e=>{
  const {id,tipo,codigo,entrada}=e.data||{};
  let py;
  try{py=await cargar()}catch(err){listo=null;self.postMessage({id,error:{tipo:'Carga',mensaje:String(err?.message||err)}});return}
  if(tipo==='cargar'){self.postMessage({id,listo:true,version:py.version});return}
  const out=[],cola=[...(entrada||[])];
  py.setStdout({batched:s=>out.push(s)});
  py.setStderr({batched:s=>out.push(s)});
  py.setStdin({stdin:()=>cola.length?cola.shift():undefined,isatty:false});
  const g=py.globals.get('dict')();
  try{py.runPython(codigo,{globals:g});self.postMessage({id,salida:out.join('\n')})}
  catch(err){self.postMessage({id,salida:out.join('\n'),error:{tipo:err.type||'Error',mensaje:String(err.message||err)}})}
  finally{g.destroy?.()}
};
