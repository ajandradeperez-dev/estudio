/* Recordatorio diario de la racha con la app cerrada. El service worker de Workbox lo carga con importScripts (vite.config.js).
   El estado lo deja la app en la caché 'ciberlab-recordatorio' (app.js → sincronizarRecordatorio), porque aquí no hay localStorage.
   Periodic Background Sync: el navegador decide cuándo despertar al service worker (en Chrome/Android, con la app instalada
   y según el uso), así que la hora elegida es aproximada. */
const CACHE_REC='ciberlab-recordatorio',URL_REC='recordatorio.json';
const dos=n=>String(n).padStart(2,'0');
const hoy=()=>{const d=new Date();return `${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`};

async function revisar(){
  const c=await caches.open(CACHE_REC),r=await c.match(URL_REC);if(!r)return;
  const e=await r.json(),ahora=new Date(),[h,m]=String(e.hora||'20:00').split(':').map(Number);
  if(!e.activo||e.cumplida===hoy()||e.notificado===hoy()||ahora.getHours()*60+ahora.getMinutes()<h*60+(m||0))return;
  await self.registration.showNotification(e.racha?`🔥 No pierdas tu racha de ${e.racha} ${e.racha===1?'día':'días'}`:'⏰ Hora de estudiar',
    {body:`${e.nombre?e.nombre+', a':'A'}ún no cumples tu meta de hoy en ${e.app||'la app'}. Unos minutos bastan.`,icon:'icons/icon-192.png',badge:'icons/icon-monocromo-512.png',tag:'recordatorio-racha',data:{url:'./#'}});
  e.notificado=hoy();await c.put(URL_REC,new Response(JSON.stringify(e),{headers:{'content-type':'application/json'}}));
}
self.addEventListener('periodicsync',ev=>{if(ev.tag==='recordatorio-racha')ev.waitUntil(revisar())});
// Tocar la notificación abre la app (o la trae al frente si ya estaba abierta)
self.addEventListener('notificationclick',ev=>{
  ev.notification.close();
  ev.waitUntil((async()=>{
    const url=new URL(ev.notification.data?.url||'./',self.registration.scope).href;
    const abiertas=await clients.matchAll({type:'window',includeUncontrolled:true});
    const ya=abiertas.find(w=>w.url.startsWith(self.registration.scope));
    if(ya){await ya.focus();return}
    await clients.openWindow(url);
  })());
});
