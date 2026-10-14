import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

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
  plugins:[VitePWA({
    // El service worker nuevo se activa solo; main.js decide cuándo recargar (onNeedReload) para no cortar un ejercicio
    registerType:'autoUpdate',
    injectRegister:false,
    includeAssets:['favicon.svg','icons/apple-touch-icon.png'],
    manifest:{
      // Identidad fija de la app instalada. El navegador resuelve id contra el ORIGEN (no contra start_url),
      // así que debe ser la ruta completa: /<repositorio>/ en GitHub Pages, igual a la que tenía sin id.
      id:base,
      name:'CiberLab',
      short_name:'CiberLab',
      description:'Estudia ciberseguridad, inglés, matemáticas y ciencia de datos con práctica, repaso espaciado y metas diarias.',
      lang:'es',
      start_url:'.',
      scope:'.',
      display:'standalone', // se instala como app (WebAPK) a pantalla completa, sin barra del navegador
      orientation:'any',
      theme_color:'#4652d0',
      background_color:'#ffffff',
      categories:['education'],
      // any: con esquinas redondeadas; maskable: a sangre, el launcher de Android lo recorta en su forma (círculo, etc.)
      icons:[
        {src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:'icons/icon-maskable-192.png',sizes:'192x192',type:'image/png',purpose:'maskable'},
        {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
      ]
    },
    workbox:{
      // Todo lo de la app queda en caché para funcionar sin internet (incluidas las fuentes de KaTeX en woff2)
      globPatterns:['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
      cleanupOutdatedCaches:true,
      // Actualización automática: la versión nueva se activa en cuanto se instala (sin esperar a cerrar todas las pestañas)
      skipWaiting:true,
      clientsClaim:true,
      // Las fuentes de Google se guardan la primera vez que se cargan con conexión
      runtimeCaching:[
        {urlPattern:({url})=>url.origin==='https://fonts.googleapis.com',handler:'StaleWhileRevalidate',
         options:{cacheName:'fuentes-css',cacheableResponse:{statuses:[0,200]}}},
        {urlPattern:({url})=>url.origin==='https://fonts.gstatic.com',handler:'CacheFirst',
         options:{cacheName:'fuentes-archivos',expiration:{maxEntries:30,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}}
      ]
    }
  })]
});
