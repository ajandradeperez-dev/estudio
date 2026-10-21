import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import {APP_NOMBRE,APP_DESCRIPCION,APP_COLOR} from './src/config.js';

// En GitHub Pages la app vive en /<repositorio>/: el workflow pasa BASE_PATH. En local es '/'.
const base=process.env.BASE_PATH||'/';

export default defineConfig({
  base,
  // Versión visible en "Mi progreso" para saber cuál tienes instalada: el workflow pasa fecha + commit; en local, la fecha
  define:{__VERSION__:JSON.stringify(process.env.APP_VERSION||new Date().toISOString().slice(0,16).replace('T',' '))},
  // Puertos fijos: el progreso vive en localStorage, que depende del origen (incluido el puerto).
  // Si Vite cambiara de puerto al estar ocupado, la app abriría "vacía". Con strictPort falla en vez de cambiar.
  server:{port:5173,strictPort:true},
  // KaTeX va en el paquete principal (~570 KB, 186 KB comprimido) para funcionar sin conexión
  build:{chunkSizeWarningLimit:800},
  preview:{port:4173,strictPort:true},
  plugins:[
  // index.html usa %APP_NOMBRE%, %APP_DESCRIPCION% y %APP_COLOR% (src/config.js)
  {name:'config-app',transformIndexHtml:h=>h.replaceAll('%APP_NOMBRE%',APP_NOMBRE).replaceAll('%APP_DESCRIPCION%',APP_DESCRIPCION).replaceAll('%APP_COLOR%',APP_COLOR)},
  VitePWA({
    // El service worker nuevo se activa solo; main.js decide cuándo recargar (onNeedReload) para no cortar un ejercicio
    registerType:'autoUpdate',
    injectRegister:false,
    includeAssets:['favicon.svg','icons/apple-touch-icon.png','icons/icono.svg'],
    manifest:{
      // Identidad fija de la app instalada. El navegador resuelve id contra el ORIGEN (no contra start_url),
      // así que debe ser la ruta completa: /<repositorio>/ en GitHub Pages, igual a la que tenía sin id.
      id:base,
      name:APP_NOMBRE,
      short_name:APP_NOMBRE,
      description:APP_DESCRIPCION,
      lang:'es',
      start_url:'.',
      scope:'.',
      display:'standalone', // se instala como app (WebAPK) a pantalla completa, sin barra del navegador
      orientation:'any',
      theme_color:APP_COLOR,
      background_color:'#ffffff',
      categories:['education'],
      // any: con esquinas redondeadas; maskable: a sangre, el launcher de Android lo recorta en su forma (círculo, etc.)
      // monochrome: silueta para los íconos temáticos de Android 13+. Todos salen de public/icons/icono.svg (scripts/iconos.mjs)
      icons:[
        ...[48,72,96,128,144,152,192,256,384,512].map(t=>({src:`icons/icon-${t}.png`,sizes:`${t}x${t}`,type:'image/png',purpose:'any'})),
        {src:'icons/icon-maskable-192.png',sizes:'192x192',type:'image/png',purpose:'maskable'},
        {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
        {src:'icons/icon-monocromo-512.png',sizes:'512x512',type:'image/png',purpose:'monochrome'}
      ],
      shortcuts:[
        {name:'Repasar',url:'./#repaso',icons:[{src:'icons/icon-96.png',sizes:'96x96'}]},
        {name:'Notas',url:'./#notas',icons:[{src:'icons/icon-96.png',sizes:'96x96'}]}
      ]
    },
    workbox:{
      // Todo lo de la app queda en caché para funcionar sin internet (incluidas las fuentes de KaTeX en woff2)
      globPatterns:['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
      // Los generadores de ejercicios van en un chunk grande (~2 MB y creciendo): sin esto no se precachean y no hay modo sin conexión
      maximumFileSizeToCacheInBytes:6*1024*1024,
      cleanupOutdatedCaches:true,
      // sw-paginas.js: el HTML va "red primero" (la versión nueva carga a la primera; sin conexión, la guardada). Va antes que las
      // rutas de Workbox. sw-recordatorio.js: recordatorio diario con la app cerrada (Periodic Background Sync y clic en la notificación)
      importScripts:['sw-paginas.js','sw-recordatorio.js'],
      navigateFallback:null,
      // Actualización automática: la versión nueva se activa en cuanto se instala (sin esperar a cerrar todas las pestañas)
      skipWaiting:true,
      clientsClaim:true,
      // Las fuentes de Google se guardan la primera vez que se cargan con conexión
      runtimeCaching:[
        // OCR sin IA (Tesseract.js): el motor y el idioma se bajan de jsDelivr la primera vez que se usan y quedan guardados
        {urlPattern:({url})=>url.origin==='https://cdn.jsdelivr.net'&&/tesseract/.test(url.pathname),handler:'CacheFirst',
         options:{cacheName:'ocr',expiration:{maxEntries:20,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}},
        // Curso de Python: Pyodide (Python en el navegador) se baja de jsDelivr la primera vez que se abre el editor o el
        // laboratorio y queda guardado para usarse sin internet
        {urlPattern:({url})=>url.origin==='https://cdn.jsdelivr.net'&&url.pathname.startsWith('/pyodide/'),handler:'CacheFirst',
         options:{cacheName:'pyodide',expiration:{maxEntries:40,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}},
        // 📚 Lectura: cada capítulo (public/libros/…) se guarda al abrirlo; las figuras de Online Statistics Education también
        {urlPattern:({url})=>url.pathname.includes('/libros/')&&url.pathname.endsWith('.json'),handler:'StaleWhileRevalidate',
         options:{cacheName:'libros',expiration:{maxEntries:120,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}},
        {urlPattern:({url})=>url.origin==='https://onlinestatbook.com',handler:'CacheFirst',
         options:{cacheName:'libros-figuras',expiration:{maxEntries:300,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}},
        {urlPattern:({url})=>url.origin==='https://fonts.googleapis.com',handler:'StaleWhileRevalidate',
         options:{cacheName:'fuentes-css',cacheableResponse:{statuses:[0,200]}}},
        {urlPattern:({url})=>url.origin==='https://fonts.gstatic.com',handler:'CacheFirst',
         options:{cacheName:'fuentes-archivos',expiration:{maxEntries:30,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}}
      ]
    }
  })]
});
