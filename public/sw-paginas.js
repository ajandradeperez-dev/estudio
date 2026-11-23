/* HTML "red primero" (lo carga el service worker de Workbox con importScripts ANTES de registrar sus rutas, así que este
   manejador va primero). Con conexión, cada apertura trae el index.html nuevo: la versión nueva corre a la primera, sin
   tener que abrir la app dos veces ni depender de cuándo se active el service worker. Sin conexión (o si la red tarda
   más de 4 s), se sirve el último index.html guardado (caché 'paginas') o el que Workbox dejó en su precaché.
   Los .js y .css llevan su huella en el nombre: los nuevos vienen de la red y los viejos siguen en la precaché.
   Arreglo (PROMPT-APP-NATIVA, parte 0): en un teléfono con red lenta la app se quedaba en una versión vieja para siempre,
   porque (1) si la red tardaba más de 4 s se servía la copia guardada y la respuesta nueva, que llegaba después, se
   descartaba sin guardarla, y (2) la copia vieja de 'paginas' ganaba al index.html nuevo de la precaché. Ahora la
   respuesta tardía se guarda igual (para la próxima apertura) y, al activarse un service worker nuevo (= versión nueva
   publicada), se borra la copia vieja para que mande el index.html de esa versión. */
const CACHE_PAGINAS='paginas';
self.addEventListener('activate',e=>{e.waitUntil(caches.delete(CACHE_PAGINAS))});
self.addEventListener('fetch',e=>{
  if(e.request.mode!=='navigate'||e.request.method!=='GET')return;
  e.stopImmediatePropagation();
  const indice=new URL('index.html',self.registration.scope).href;
  const guardar=async r=>{if(r&&r.ok){const c=await caches.open(CACHE_PAGINAS);await c.put(indice,r)}};
  // primero la precaché de esta versión (la de Workbox); la copia de 'paginas' solo si no está
  const guardada=async()=>(await caches.match(indice,{ignoreSearch:true}))||(await (await caches.open(CACHE_PAGINAS)).match(indice))||(await caches.match(e.request,{ignoreSearch:true}));
  const red=fetch(e.request,{cache:'no-store'});
  // aunque llegue tarde, la respuesta nueva se guarda para la próxima apertura
  e.waitUntil(red.then(r=>guardar(r.clone())).catch(()=>{}));
  e.respondWith((async()=>{
    try{
      const r=await Promise.race([red,new Promise((_,no)=>setTimeout(()=>no(new Error('lenta')),4000))]);
      if(r&&r.ok)return r.clone();
      return (await guardada())||r;
    }catch(x){
      return (await guardada())||Response.error();
    }
  })());
});
