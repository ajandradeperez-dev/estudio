/* HTML "red primero" (lo carga el service worker de Workbox con importScripts ANTES de registrar sus rutas, así que este
   manejador va primero). Con conexión, cada apertura trae el index.html nuevo: la versión nueva corre a la primera, sin
   tener que abrir la app dos veces ni depender de cuándo se active el service worker. Sin conexión (o si la red tarda
   más de 4 s), se sirve el último index.html guardado (caché 'paginas') o el que Workbox dejó en su precaché.
   Los .js y .css llevan su huella en el nombre: los nuevos vienen de la red y los viejos siguen en la precaché. */
const CACHE_PAGINAS='paginas';
self.addEventListener('fetch',e=>{
  if(e.request.mode!=='navigate'||e.request.method!=='GET')return;
  e.stopImmediatePropagation();
  const indice=new URL('index.html',self.registration.scope).href;
  e.respondWith((async()=>{
    const guardada=async()=>(await (await caches.open(CACHE_PAGINAS)).match(indice))||(await caches.match(indice,{ignoreSearch:true}))||(await caches.match(e.request,{ignoreSearch:true}));
    try{
      const red=fetch(e.request,{cache:'no-store'});
      const r=await Promise.race([red,new Promise((_,no)=>setTimeout(()=>no(new Error('lenta')),4000))]);
      if(r&&r.ok){const c=await caches.open(CACHE_PAGINAS);await c.put(indice,r.clone());return r}
      return (await guardada())||r;
    }catch(x){
      return (await guardada())||Response.error();
    }
  })());
});
