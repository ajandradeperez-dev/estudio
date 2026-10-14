/* Nombre y enlaces de la app, en un solo lugar. Los usan el manifest y el título (vite.config.js), la barra superior,
   Perfil, "Acerca de", invitar amigos y el APK (twa-manifest.json se genera con estos datos: ver CLAUDE.md).
   Si cambias el nombre: npm run build y regenera el APK (el nombre del APK solo cambia al regenerarlo). */
export const APP_NOMBRE='CiberLab';
export const APP_MARCA=['Ciber','Lab'];            // la barra superior pinta la segunda parte en color
export const APP_DESCRIPCION='Estudia ciberseguridad, inglés, matemáticas y ciencia de datos con práctica, repaso espaciado y metas diarias.';
export const APP_COLOR='#4652d0';                   // color del tema (barra de Android, pantalla de bienvenida)
export const APP_URL='https://ajandradeperez-dev.github.io/estudio/';
export const REPO_URL='https://github.com/ajandradeperez-dev/estudio';
// Android (Trusted Web Activity con Bubblewrap): paquete y descarga de la última versión publicada en GitHub Releases
export const APK_PAQUETE='io.github.ajandradeperez.estudio';
export const APK_URL=`${REPO_URL}/releases/latest/download/${APP_NOMBRE}.apk`;
export const INVITACION=`Estoy estudiando con ${APP_NOMBRE}: lecciones cortas, repaso espaciado y racha diaria. Es gratis, funciona sin internet y tus datos se quedan en tu teléfono.`;
