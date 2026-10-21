# Configurar Supabase (votos de Propuestas y sincronizar entre dispositivos)

Guía para hacerlo una sola vez, sin experiencia previa. Toma unos 15 minutos. Todo es gratis (plan Free).
Hasta que la termines, la app funciona igual: Propuestas muestra las ideas iniciales y Perfil → ☁️ Cuenta dice
«Próximamente», y el respaldo `.estudio` (Perfil → 💾 Mis datos) sigue sirviendo para pasar datos de un teléfono a otro.

> **Regla de oro:** a la app y a git solo va la clave **pública** (`anon` o `publishable`). La clave `service_role`
> (o `sb_secret_…`) **nunca** se copia a ningún archivo: da acceso total a la base.

## 1. Crear el proyecto

1. Entra a <https://supabase.com> → **Start your project** → inicia sesión con tu cuenta de GitHub.
2. **New project**:
   - *Name*: `estudio` (el que quieras).
   - *Database Password*: toca **Generate a password** y guárdala en tu gestor de contraseñas (no la vas a necesitar
     en la app, pero sí si algún día administras la base).
   - *Region*: la más cercana a tus usuarios (para México, **East US (North Virginia)**).
   - *Plan*: **Free**.
3. Espera 1–2 minutos a que diga que el proyecto está listo.

## 2. Crear las tablas (SQL Editor)

1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre `supabase/propuestas.sql` de este repositorio, copia **todo**, pégalo y toca **Run**. Debe decir *Success*.
3. Otra **New query** con todo `supabase/sync.sql` → **Run** → *Success*.
   - Crea `perfiles`, `progreso` y `notas` con **Row Level Security** (cada quien ve y cambia solo lo suyo), el bucket
     privado `notas-fotos` y las funciones `uso_fotos()` y `borrar_mi_cuenta()`.
   - Los dos archivos se pueden volver a correr sin perder datos (por ejemplo, si actualizas la app).
4. Comprueba: **Table Editor** muestra `propuestas`, `votos`, `admins`, `perfiles`, `progreso` y `notas` con el
   candado de RLS activado; **Storage** muestra el bucket `notas-fotos` (privado).

## 3. Inicio de sesión (Authentication)

1. **Authentication → Sign In / Providers → Email**: déjalo **activado** (así llega el enlace mágico al correo; no
   hay contraseñas).
2. **Authentication → URL Configuration**:
   - *Site URL*: `https://ajandradeperez-dev.github.io/estudio/`
   - *Redirect URLs* → **Add URL**, una por una:
     - `https://ajandradeperez-dev.github.io/estudio/**`  (la web y el **APK**: el APK abre esta misma dirección)
     - `http://localhost:4173/**`  (para probar con `npm run preview`)
     - `http://localhost:5173/**`  (para probar con `npm run dev`)
   - El APK no necesita otra dirección: es la web publicada dentro de Chrome. Si el enlace del correo se abre en
     Chrome en vez de en la app, entra ahí: el APK usa el mismo almacenamiento de Chrome y también queda con la sesión.
3. **Correos**: el servicio de correo incluido en Supabase manda **pocos correos por hora** (sirve para probar y para
   pocos usuarios). Si muchas personas van a entrar, configura un SMTP propio en **Authentication → Emails → SMTP
   Settings** (por ejemplo Resend o Brevo, que tienen plan gratuito).
4. **Google (opcional)**:
   1. En <https://console.cloud.google.com> → crea un proyecto → **APIs y servicios → Pantalla de consentimiento de
      OAuth** (tipo *Externo*, nombre «Estudio+», tu correo).
   2. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**. En *URI de redireccionamiento
      autorizados* pega `https://<tu-proyecto>.supabase.co/auth/v1/callback` (está en Supabase → Authentication →
      Providers → Google como *Callback URL*).
   3. Copia el *Client ID* y el *Client Secret* en Supabase → **Authentication → Providers → Google** y actívalo.
      El *Client Secret* se queda **solo en Supabase** (nunca en el repositorio).
   4. En `src/config.js` cambia `SUPABASE_GOOGLE=false` por `true`: aparece «Entrar con Google».

## 4. Conectar la app (`src/config.js`)

1. Supabase → **Project Settings → API Keys** (o **Data API**).
2. Copia el **Project URL** (`https://xxxx.supabase.co`) y la clave **anon / publishable** (empieza con `eyJ…` o
   `sb_publishable_…`). **No** copies la `service_role` / `sb_secret_…`.
3. En `src/config.js`:
   ```js
   export const SUPABASE_URL='https://xxxx.supabase.co'||import.meta.env?.VITE_SUPABASE_URL||'';
   export const SUPABASE_CLAVE_PUBLICA='eyJ...'||import.meta.env?.VITE_SUPABASE_CLAVE||'';
   ```
4. `npm run revisar` (busca claves privadas por si acaso), revisa `git diff`, haz commit y push. La publicación en
   GitHub Pages tarda 1–2 minutos y el APK la recibe sola.

## 5. Probarlo

1. En el teléfono: **Perfil → ☁️ Cuenta y sincronización** → escribe tu correo → **Enviarme el enlace**.
2. Abre el correo **en el mismo teléfono** y toca el enlace: vuelve a la app, entra y muestra «🔀 Tus datos quedaron
   combinados» con lo que había en la nube, lo de este teléfono y el resultado.
3. Repite en la laptop (o en el navegador del teléfono si usas el APK). Practica en uno, toca «🔄 Sincronizar ahora» en
   el otro (o ciérralo y ábrelo): la XP, la racha, las notas y las fotos deben coincidir sin duplicarse.
4. Pon el teléfono en modo avión, practica y escribe una nota: dirá «📴 Sin conexión: se enviará luego»; al volver la
   red se envía solo.
5. Para administrar Propuestas: Perfil → Acerca de → toca 7 veces la versión (ver CLAUDE.md, «Propuestas y votos») y,
   la primera vez, en el SQL Editor:
   `insert into public.admins(usuario) select id from auth.users where email = '<tu correo>';`

## Límites del plan gratuito (para tenerlos en cuenta)

- **Storage: 1 GB** para todas las fotos de todos los usuarios. La app comprime cada foto (1600 px, JPEG 80 %), muestra
  cuánto ocupan las tuyas y avisa al llegar al 80 % del total; al 95 % deja de subir fotos nuevas (las notas siguen).
- **Base de datos: 500 MB.** El progreso y las notas son texto: alcanza para muchas personas.
- Un proyecto gratuito **se pausa tras una semana sin uso**; se reactiva desde el panel de Supabase. Mientras está en
  pausa, la app sigue funcionando sin conexión y sincroniza cuando vuelva.
- **Borrar mi cuenta** (en ☁️ Cuenta) borra las fotos de Storage y luego la cuenta; `perfiles`, `progreso` y `notas` se
  borran solos (on delete cascade).
