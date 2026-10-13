import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  // En GitHub Pages la app vive en /<repositorio>/: el workflow pasa BASE_PATH. En local es '/'.
  base:process.env.BASE_PATH||'/',
  // Versión visible en "Mi progreso" para saber cuál tienes instalada: el workflow pasa fecha + commit; en local, la fecha
  define:{__VERSION__:JSON.stringify(process.env.APP_VERSION||new Date().toISOString().slice(0,16).replace('T',' '))},
  // Puertos fijos: el progreso vive en localStorage, que depende del origen (incluido el puerto).
  // Si Vite cambiara de puerto al estar ocupado, la app abriría "vacía". Con strictPort falla en vez de cambiar.
  server:{port:5173,strictPort:true},
  preview:{port:4173,strictPort:true},
  plugins:[VitePWA({
    // El service worker nuevo se activa solo; main.js decide cuándo recargar (onNeedReload) para no cortar un ejercicio
    registerType:'autoUpdate',
    injectRegister:false,
    includeAssets:['favicon.svg','icons/apple-touch-icon.png'],
    manifest:{
      name:'CiberLab',
      short_name:'CiberLab',
      description:'Estudia ciberseguridad, inglés, álgebra y ciencia de datos con práctica, repaso espaciado y metas diarias.',
      lang:'es',
      start_url:'.',
      scope:'.',
      display:'standalone',
      orientation:'any',
      theme_color:'#0f7a5c',
      background_color:'#f3f5f4',
      categories:['education'],
      icons:[
        {src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},
        {src:'icons/icon-512.png',sizes:'512x512',type:'image/png'},
        {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
      ]
    },
    workbox:{
      // Todo lo de la app queda en caché para funcionar sin internet
      globPatterns:['**/*.{js,css,html,svg,png,webmanifest}'],
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
