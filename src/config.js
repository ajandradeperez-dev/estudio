/* Nombre y enlaces de la app, en un solo lugar. Los usan el manifest y el título (vite.config.js), la barra superior,
   Perfil, "Acerca de", invitar amigos y el APK (twa-manifest.json se genera con estos datos: ver CLAUDE.md).
   Si cambias el nombre: npm run build y regenera el APK (el nombre del APK solo cambia al regenerarlo).
   Las claves de los datos guardados ('ciberlab-progreso', 'ciberlab-notas'…) NO cambian con el nombre: así nadie pierde nada. */
export const APP_NOMBRE='Estudio+';
export const APP_MARCA=['Estudio','+'];             // la barra superior pinta la segunda parte en color
export const APP_DESCRIPCION='Estudia ciberseguridad, inglés, matemáticas y ciencia de datos con práctica, repaso espaciado y metas diarias.';
export const APP_COLOR='#4652d0';                   // color del tema (barra de Android, pantalla de bienvenida)
export const APP_URL='https://ajandradeperez-dev.github.io/estudio/';
export const REPO_URL='https://github.com/ajandradeperez-dev/estudio';
// Android (Trusted Web Activity con Bubblewrap): paquete y descarga de la última versión publicada en GitHub Releases
export const APK_PAQUETE='io.github.ajandradeperez.estudio';
// nombre del archivo en la Release (sin "+" ni espacios para que la URL sea limpia); las Releases nuevas también suben CiberLab.apk
// para que sigan funcionando los enlaces viejos que alguien haya compartido
export const APK_ARCHIVO='EstudioPlus';
export const APK_URL=`${REPO_URL}/releases/latest/download/${APK_ARCHIVO}.apk`;
export const INVITACION=`Estoy estudiando con ${APP_NOMBRE}: lecciones cortas, repaso espaciado y racha diaria. Es gratis, funciona sin internet y tus datos se quedan en tu teléfono.`;
// 🗳️ Propuestas y votos (Supabase, plan gratuito). Pega aquí la URL del proyecto y su clave PÚBLICA (anon o publishable):
// es pública por diseño; la seguridad está en la base (supabase/propuestas.sql, Row Level Security). La clave service_role
// NUNCA va aquí ni en git. Vacías = la sección muestra las propuestas iniciales y dice que la votación se activa pronto.
// Proyecto: Settings → API. (npm run cuenta compila copias de prueba con VITE_SUPABASE_URL/VITE_SUPABASE_CLAVE: apuntando
// a un Supabase simulado, o 'ninguno' para probar la app sin Supabase)
const envUrl=import.meta.env?.VITE_SUPABASE_URL,envClave=import.meta.env?.VITE_SUPABASE_CLAVE;
export const SUPABASE_URL=envUrl==='ninguno'?'':envUrl||'https://nwqnizvugvfxuizfkmyu.supabase.co';
export const SUPABASE_CLAVE_PUBLICA=envUrl==='ninguno'?'':envClave||'sb_publishable_kWXgVxgb_EMGLw6Jy1w0Vg_Nkl4iATv';
// ☁️ Sincronizar entre dispositivos usa el MISMO proyecto (supabase/sync.sql). Vacías = Perfil dice «Próximamente».
// true si activaste el inicio de sesión con Google en Supabase → Authentication → Providers (si no, correo y contraseña o código por correo)
export const SUPABASE_GOOGLE=false||import.meta.env?.VITE_SUPABASE_GOOGLE==='1';
