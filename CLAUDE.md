# Estudio+ (repositorio ciberlab)

## Idioma

**Responde siempre en español**, también en explicaciones, mensajes de commit y comentarios de código. Los textos de la app están en español neutro (orientado a Latinoamérica); mantén ese tono.

## Qué es

App para estudiar cualquier tema, organizada en **materias**, que aplica métodos de estudio efectivos (ver "Método de aprendizaje"). Todo corre en el navegador: no hay backend y el progreso se guarda en `localStorage`.

- **Jerarquía**: área → materia → tema → habilidad (nodo del camino). El árbol completo (lo que existe y lo pendiente, con la referencia al temario de cada habilidad, su estado y la cobertura) está en **`src/contenido/PLAN.md`**, que **genera `npm run revisar`** a partir de cada `temas.js` (ver «Definición de terminado»). Aprender se organiza en 🎓 **Mis materias** (arriba), las áreas 📘 **Estudio** y 💼 **Cursos** y la tarjeta 🗳️ **Propuestas**. 💼 **Cursos** (formación práctica y profesional, `src/areas/cursos/`): 🛡️ **Ciberseguridad** (Fundamentos de redes, Conmutación y enrutamiento, Firewalls, VPN y criptografía, Seguridad defensiva, Escenarios y herramientas; hasta v9 era un área propia), 📊 **Excel** y una tarjeta «⚪ Próximamente…» que lleva a Propuestas. Una materia puede tener su propio color (`tono:'ciber'`) aunque su área tenga otro. 📘 **Estudio** (antes «Estudio y metas»: Inglés: A1, A2, B1, B2 y Hablar y escuchar; Matemáticas: Aritmética y prealgebra, Álgebra, Trigonometría, Álgebra lineal, Cálculo diferencial, Cálculo integral; Ciencia de datos: Estadística descriptiva, Probabilidad, Inferencia, Python para datos, Machine learning básico; 📚 Lectura, ⚪ próximamente).
- El recomendador "¿Qué sigue?", el repaso espaciado, la racha y la meta diaria son **globales**: cuentan todas las áreas.
- **Lecciones**: explicación corta, ejemplos y práctica en rondas, casi toda de producción.
- **Enganche**: racha de días cumpliendo una meta diaria (ejercicios o minutos), XP y nivel por materia, Repasar con repetición espaciada (SM-2) e intercalada, cofres y jefes en el camino, medallas en Logros, "Continuar donde te quedaste", el cuaderno de 📝 Notas y Perfil.
- **🎓 Mis materias**: cada quien crea sus materias de la escuela con su temario (escrito, pegado o en foto) y las fechas de examen; la app arma un plan día por día, empareja los temas con la práctica que ya tiene y, con IA opcional, genera lo que falta. Ver "Mis materias" más abajo.
- **Procedimientos**: cada ejercicio generado trae su solución paso a paso con sus propios números (📖 Ver procedimiento) y una explicación alternativa (🤔 No entendí).

## Método de aprendizaje

Estas reglas se aplican a **todas** las materias. Cualquier lección nueva debe cumplirlas; `npm run revisar` comprueba las que se pueden verificar automáticamente y falla si alguna no se cumple. Los umbrales están en `src/nucleo/metodo.js`.

1. **Examen de ubicación por materia.** Entre 10 y 15 preguntas de producción, sin pista, repartidas entre las lecciones (`repartoUbicacion`). Las lecciones en las que aciertas el 80 % de sus preguntas quedan **dominadas** y no hace falta estudiarlas. Las preguntas salen de la última ronda de cada lección, así la práctica posterior empieza con ejercicios nuevos. Lo que falles aquí no va al repaso: lo aprenderás en la lección. Hay un botón "No lo sé" para no adivinar.
2. **Mínimo 70 % de producción.** Producción = el usuario escribe la respuesta (completar, traducir, resolver): tipo `completar`. La opción múltiple solo sirve **para introducir**: como mucho una por ronda y siempre la primera. Las tarjetas no cuentan como producción.
3. **Contenido ordenado por utilidad.** En cada materia, lo que más se usa va primero: en Inglés, la gramática y el vocabulario de mayor frecuencia (to be → presente simple → can → there is → presente continuo → pasado → futuro → vocabulario de trabajo). La **explicación** de cada lección tiene como máximo **150 palabras**.
4. **Dominio.** Una habilidad está dominada con **≥ 80 % de las últimas 10 respuestas sin pista** y práctica en **2 días distintos** (`estadoDominio` en `metodo.js`). Usar la pista no cuenta y manda el ejercicio al repaso. Una habilidad nueva empieza con un **ejemplo resuelto**, sigue con uno **con hueco** y luego ejercicios solos; la **dificultad (1–5)** se adapta para acertar ~85 %; una vez por sesión se pide **"¿por qué?"** (autoexplicación). Todo el método, con su porqué, está en `src/nucleo/METODO.md`.
5. **Práctica intercalada y espaciada.** "Repasar" usa **SM-2** (cada ejercicio fallado y cada habilidad dominada tienen su próxima fecha según qué tan bien se recordó) e intercala materias y habilidades (`mezclar` en `repaso.js`). En el camino hay un **cofre** cada 3 habilidades (repaso mezclado de esas tres) y un **jefe** al final de cada tema (mezcla cronometrada).
6. **Cada error explica.** Al fallar se muestra lo que escribiste, **por qué está mal** (`porque` de cada opción incorrecta o `errores` típicos de la respuesta escrita) y **la regla correcta** (`regla`, obligatoria en cada ejercicio), además de la respuesta correcta. Los aciertos solo muestran "¡Correcto!" para no perder tiempo.
7. **Resumen propio.** Al dominar una habilidad se pide escribir un resumen de 1–2 frases que se guarda en el progreso (`notas`), se muestra al volver a ella y aparece también en el cuaderno de **📝 Notas**.

### Niveles de profundidad y retos

Cada ejercicio tiene una **profundidad** (independiente de la dificultad 1–5): **básico** (recordar un dato o aplicar una regla directa), **procedimiento** (método de varios pasos), **aplicación** (problema con contexto) o **escenario** (caso real integrador).

- **Generadores**: la profundidad sale de `generadores/profundidad.js` (`PROFUNDIDAD[id].nivel(n, p)`, o `profundidad`/`plantilla` en el propio generador); `crear()` la agrega a cada pregunta. Lecciones: `profundidad` en el ejercicio o en la lección (por defecto básico). Bancos: `PROF_BANCO` en `practica.js`.
- **Los básicos se retiran**: tras 2 aciertos sin pista en sesiones distintas (`registrarBasico` en `progreso.js`; en generadores aleatorios cuenta por **plantilla**, `g:<gen>:<plantilla>`, y pide además 3 seguidos; en listas fijas por ítem, `gi:`; en lecciones por ejercicio, `l:<ref>`). Vuelven solo como **refuerzo** (una vez, "🔁 Refuerzo de lo básico") al fallar algo de nivel superior de la misma habilidad, o a mano ("Volver a ver lo retirado" en la habilidad y en Perfil, por tema). Si todo lo de una habilidad está retirado, su pantalla lo dice y lleva a los retos.
- **El repaso** prioriza procedimiento > aplicación/escenario > básico (`PRIORIDAD` en `repaso.js`) y quita los básicos ya retirados.
- **🎯 Retos y escenarios** (`nucleo/retos.js`, vista `vista-retos.js`, rutas `<materia>/retos` y `<materia>/<tema>/retos`): aplicación y escenarios **no se gastan** (cada intento genera datos nuevos), no mandan fallos al repaso y no entran al repaso diario salvo que el usuario los marque con **⭐** (ref `<materia>/r/<reto>`). Filtros por tema, profundidad y dificultad. Un reto es `{id, materia, tema, titulo, desc, profundidad, dificultad, crear(rng) → [preguntas]}` o `{…, ir:'<ruta>'}` (abre una herramienta o el jefe de una unidad). El id va en el progreso: no lo cambies.
- **Estado de cada tema** (`nucleo/contenido.js`, chips en la materia y el tema): ✅ completo (cada habilidad con mini explicación, ejemplo resuelto, ejemplo con huecos y ejercicios básicos y de procedimiento; sin "Próximamente"; ≥1 reto), 🟡 en construcción, ⚪ próximamente.
- `npm run revisar` exige profundidad válida en los 5 niveles de cada generador y que cada reto genere preguntas válidas, y regenera PLAN.md y `estado.json` con la «Definición de terminado».

Para no perder tiempo: sesiones de 8 preguntas (5–10 minutos), todo se puede hacer con el teclado (Enter para comprobar y Enter para seguir), cada materia muestra arriba "👉 Lo siguiente para ti" y el examen de ubicación evita estudiar lo que ya sabes.

### Inglés: 4 vertientes de Nation

Inglés sigue además el marco de `src/materias/ingles/metodo.md`. Todo contenido nuevo de Inglés debe respetarlo:

- **Cada unidad cubre las 4 vertientes** (~25 % cada una): input comprensible (escucha con ~95–98 % de palabras conocidas), output con significado (hablar o escribir para comunicar: diálogos, jefe, IA), enfoque en la forma (lecciones y pronunciación) y fluidez (shadowing, ronda rápida, 4-3-2).
- **Orden de una unidad**: escucha → frases hechas (*chunks*) → forma (lección) → hablar (pronunciación + diálogo) → **jefe** (tarea real, TBLT). El jefe desbloquea la unidad siguiente.
- **Chunks antes que palabras sueltas**, en inglés real y natural, con explicación en español y el error típico de hispanohablantes.
- **Corrección "recast + pista"**: primer fallo → pista en español; segundo fallo → modelo + regla. Lo fallado al hablar también entra al repaso.
- **Niveles MCER** en cada unidad (`nivel: 'A1'`…). La ubicación coloca al usuario en el mapa.
- **Unidades** en `src/materias/ingles/hablar/unidades.js` (los ids se guardan en el progreso: agrega al final, no los cambies). Una unidad se abre al vencer al jefe anterior o si la ubicación demostró que dominas las lecciones de la unidad anterior.
- **Contenido de cada unidad** en `hablar/contenido.js` (`CONTENIDO[unidad]`): `escucha` (texto de 40–120 palabras que se oye antes de leerlo, con ≥3 preguntas escritas de comprensión; al 80 % el paso queda hecho), `chunks` (≥6 frases hechas `{en, es, uso}`) y `fluidez` (tema y guía para el 4-3-2: contar lo mismo en 60, 45 y 30 s; luego una ronda rápida de 60 s con los chunks). Las vistas están en `hablar/pasos.js`; los pasos hechos se guardan en `extra.unidades[unidad]`. El repaso guarda `e/<unidad>/<pregunta>` y `c/<unidad>/<chunk>`: agrega elementos al final de cada lista. La página de la unidad muestra 7 pasos: escucha → frases → forma → pronunciación → diálogos → fluidez → jefe.
- `npm run revisar` también valida Inglés · habla: cada turno de diálogo tiene ≥2 respuestas aceptadas, pista, modelo y regla; el modelo se acepta y cada error típico se detecta; cada sonido tiene ≥3 pares mínimos distintos; las unidades apuntan a lecciones, diálogos y sonidos existentes y tienen su contenido completo.
- **Calidad (Android Chrome primero)**: todo lo de Hablar debe funcionar a 360 px sin scroll horizontal y con toques de al menos 44 px. Si no hay reconocimiento de voz (`soporte.escuchar`), cada actividad ofrece la alternativa escrita (diálogos, IA, frases, repaso) y la fluidez queda como temporizador; si no hay síntesis (`soporte.hablar`), se muestra el texto en vez del audio. Lo que no usa la IA funciona sin conexión (PWA).
- **Estilo juego** (`hablar/juego.js`): hablar da 15 XP por frase con 80+ (escribir da 10); combo de frases seguidas ×1,5 desde 3, ×2 desde 5, ×3 desde 10, y se rompe al fallar; medallas (`MEDALLAS`, cada una con `logra(p, extra)`); sonidos con Web Audio que se pueden silenciar (`localStorage['ciberlab-ajustes']`). **Misión diaria de habla** (`MISION` en `progreso.js`): 20 frases en voz alta o una conversación de 5 turnos; cumplirla cumple la meta del día y suma a la racha.

En Ciberseguridad, los simuladores, el laboratorio y el examen rápido son herramientas de práctica, no lecciones. El examen rápido es de respuesta escrita (`datos/preguntas.js`, mismo formato que los ejercicios de lección, con `respuestas`, `errores` y `regla`). Sus preguntas y las del laboratorio entran al repaso mezclado, y cada error muestra la regla o la explicación del caso. El laboratorio de incidentes sigue siendo de elegir opción: es un caso práctico de diagnóstico, no un ejercicio de memoria.

## Estructura

```
index.html                Esqueleto: splash, barra superior (#barra), vista (#vista) y navegación inferior (#nav); usa %APP_NOMBRE%
vite.config.js            Puertos fijos (5173 dev, 4173 preview) con strictPort
scripts/
  revisar-contenido.mjs   npm run revisar: comprueba el método en todas las lecciones y el contenido de habla de Inglés
  iconos.mjs              node scripts/iconos.mjs: todos los PNG (any, maskable, monocromo, Apple) desde public/icons/icono.svg
public/
  icons/icono.svg         El ícono de la app (cuaderno abierto + chispa): fuente de todos los PNG y del favicon
  sw-recordatorio.js      Lo carga el service worker (importScripts): recordatorio diario con la app cerrada y clic en la notificación
android/twa-manifest.json Configuración del APK (Bubblewrap); el resto de android/ se genera y no se versiona
src/
  config.js               APP_NOMBRE y enlaces (web, repo, APK, invitación): un solo lugar para el nombre de la app
  main.js                 Rutas (resolver() sobre analizar()), migas, menú, delegación de eventos y conteo de minutos activos
  areas/<id>/area.js      Cada área: nombre, icono, tono de color, descripción, orden
  estilos/                CSS (lo importa main.js): tokens.css (colores, radios, espaciado, tipografía, modo oscuro),
                          base.css (armazón y navegación), componentes.css (botones 3D, tarjetas, sesión, hoja…), secciones.css
  utilidades.js           $, esc (escapar HTML) y utilidades IP
  nucleo/                 Motor común a todas las materias
    metodo.js             Reglas del método: umbrales, dominio, dificultad adaptativa (rating), SM-2, reparto de la ubicación
    METODO.md             El método de estudio explicado (qué hace la app y por qué)
    habilidad.js          Práctica de una habilidad (ejemplo → hueco → solo, adaptación, autoexplicación), cofres y jefes
    actividades.js        Variantes de una pregunta: ejemplo, hueco, opción (solo para introducir), verdadero/falso, error, ¿por qué?
    practica.js           De dónde salen las preguntas de una habilidad: generador, lección o banco (evita los básicos retirados)
    retos.js              🎯 Retos de aplicación y escenarios por materia y tema (no se gastan; ⭐ → repaso)
    vista-retos.js        Pantalla de retos: filtros, ⭐ y sesión
    contenido.js          Estado de cada tema (✅ completo · 🟡 parcial · ⚪ próximo) según el PLAN
    camino.js             Estados del camino: desbloqueo, cofres cada 3 habilidades y jefe del tema
    excel/                formulas.js (evaluador de fórmulas, sin DOM) y hoja.js (mini hoja táctil)
    rng.js                Números aleatorios con semilla (para reproducir y probar ejercicios)
    generadores/          Un generador por habilidad (ver "Escribir un generador"), verificación tolerante (verificar.js)
                          y profundidad.js (nivel de profundidad y plantilla de cada generador)
    ia.js                 Capa común de IA: pedir({sistema, mensajes, imagenes, esquemaJSON}) con Gemini o Claude (ver «IA»)
    ia-ajustes.js         Perfil → ✨ Inteligencia artificial (#ajustes-ia): proveedor, clave propia, probar y borrar
    ia-preguntas.js       "✨ Pregunta nueva con IA" (opcional, con la clave del usuario; sin clave se usa el generador)
    materias.js           Registro de áreas y materias, rutas canónicas (rutaMateria/rutaTema/rutaLeccion), analizar(ruta)
                          que entiende rutas nuevas y viejas, y búsqueda de ejercicios por referencia de repaso
    cargar.js             cargarLecciones() (carpeta lecciones/) y cargarTemas() (carpetas temas/<tema>/)
    progreso.js           Todo lo que se guarda: racha, meta, XP, lecciones, ubicación, repaso, notas, "continuar"
    ejercicios.js         Ejercicios escritos a mano → preguntas del motor (deBanco) y evaluación de lo hablado
    sesion.js             Motor de práctica: una pregunta por pantalla, ✕, Comprobar, hoja de feedback y actividades
                          (escribir, opción, ordenar, emparejar, verdadero/falso, elegir el error, ejemplo, hueco, por qué, hablar)
    formula.js            Fórmulas con KaTeX (\( … \) y \[ … \]); empaquetado, funciona sin conexión
    ajustes.js · sonido.js  Tema (auto/claro/oscuro), sonidos y vibración ('ciberlab-ajustes')
    comparar.js           coincide(): compara respuestas escritas (sin DOM; también lo usa npm run revisar)
    ubicacion.js          Examen de ubicación
    repaso.js             Pestaña Repasar: repetición espaciada con práctica intercalada
    app.js                Experiencia de app: bienvenida (3 pantallas la primera vez), Acerca de, instalar (beforeinstallprompt / iPhone),
                          invitar (Web Share + QR con qrcode-generator), avisos "sin conexión" y "versión nueva", recordatorio diario
    usuario.js            'ciberlab-usuario': nombre, materias elegidas (el recomendador las pone primero), bienvenida vista, recordatorio
    mias/                 🎓 Mis materias: esquema.js (formato y validación estricta), temario.js (leer un temario escrito), emparejar.js
                          (temas ↔ habilidades de la app, con sinónimos), plan.js (plan hasta cada examen), datos.js (IndexedDB + caché en
                          memoria, dominio, compartir), vistas.js (lista, asistente, materia, tema, simulacro), ia.js (IA opcional)
    notas.js              Pestaña 📝 Notas: lista (búsqueda, filtros, cuadernos área → materia → tema), editor con barra de formato,
                          fotos, dibujo, dictado, enlaces y tarjetas; modo "repasar nota"; resumen automático del tema; respaldo
    cuaderno/             Datos del cuaderno (sin vistas): db.js (IndexedDB 'ciberlab-notas': notas y archivos; persist()),
                          formato.js (marcas → HTML, sin DOM; tarjetas; deHtml() pasa pasos de la app a texto de nota),
                          notas.js (crear/guardar/borrar, copia de los resúmenes viejos, "📝 Guardar en mis notas" desde el estudio),
                          medios.js (comprimir fotos, lienzo de dibujo), respaldo.js (exportar/importar TODO en .json, sin la clave de IA),
                          foto.js ("📸 Foto a nota" y "🧠 Resuélvelo conmigo" con IA; sin clave, OCR local con Tesseract.js)
    procedimiento.js      Pantalla "📖 Procedimiento": pasos revelables, lo que cambia resaltado, diagramas, 🔊 y 📝 por paso
    portada.js            Portada (áreas), página de área, de materia (temas), camino de un tema, migas y barra superior
    miprogreso.js         Pestaña Perfil: progreso, meta diaria y ajustes
    logros.js             Pestaña Logros: medallas calculadas a partir del progreso y bloques de cada materia
    ui.js                 Componentes: barra, puntos, chip, boton, tarjetaNav, cabecera, intro (¿Cómo se usa?), vacio, hoja, confirmar
    recomendador.js       "👉 ¿Qué sigue?": 1 repasos (≥5) → 2 lo urgente de cada materia → 3 punto más débil → 4 continuar
                          → 5 siguiente lección → 6 retos; alterna materias tras 3 sesiones seguidas. Cada materia aporta
                          candidatos con recomendar(p) → [{regla, valor?, titulo, porque, ruta}]
    cierre.js             Pantalla de cierre común: XP ganada (xpHoy al empezar vs. al terminar), lo aprendido (1–3) y "Seguir"
    voz.js                Voz: hablar() (speechSynthesis en-US, normal/lento), escuchar() (SpeechRecognition, promesa con alternativas),
                          errores en español, botón de micrófono y frase coloreada; si no hay soporte, las vistas caen a modo escrito
    pronunciacion.js      Evaluador aproximado (sin DOM): normaliza (contracciones, números, homófonos), alinea palabra a palabra
                          y puntúa 0–100; encaja() para respuestas libres con patrones "my name is *"
  materias/
    ciberseguridad/       materia.js, lecciones/, secciones/ (simuladores), datos/, progreso.js (ganchos propios)
    ingles/               materia.js + temas.js + temas/<tema>/NN-….js, metodo.md (4 vertientes),
                          errores-pronunciacion.js (sonidos difíciles: causa, tip físico, pares mínimos, detecta())
                          hablar/: index.js (rutas), unidades.js, contenido.js, pasos.js (escucha, fluidez),
                          dialogos.js, frases.js, practica.js, dialogo.js, ia.js (conversación con IA), juego.js
    matematicas/          materia.js + temas.js (lista de temas) + temas/<tema>/NN-….js (antes "algebra": alias y migración v6)
    excel/                materia.js + temas.js + secciones/ (hoja libre, tabla dinámica, organizar)
    ciencia-datos/        materia.js + temas.js + temas/<tema>/NN-….js
    lectura/              materia.js (⚪ próximamente: proximo:true, sin lecciones; modelo de datos documentado)
  contenido/PLAN.md       Árbol completo del contenido (fuente de verdad; revisar lo compara con cada temas.js)
```

### Rutas (`#hash`)

| Ruta | Vista |
|---|---|
| (vacía) | Pestaña Aprender: lo siguiente para ti, continuar y tarjetas de área |
| `repaso` / `logros` / `perfil` | Pestañas Repasar, Logros y Perfil (`#progreso` lleva a Perfil) |
| `acerca` / `bienvenida` | Acerca de (versión, privacidad, invitar con QR) · la bienvenida (sale sola la primera vez, sin progreso) |
| `notas` | Pestaña Notas: el cuaderno |
| `notas/n/<id>` · `notas/tema/<materia>/<tema>` | Editor de una nota · resumen automático de un tema |
| `notas/foto[/<materia>/<tema>]` | 📸 Foto a nota y 🧠 Resuélvelo conmigo (archiva en ese tema) |
| `mias` · `mias/nueva` · `mias/<id>[/editar]` | Mis materias: lista · asistente · materia (cuenta regresiva, hoy, preparación, plan) · editar |
| `mias/<id>/t/<tema>` · `mias/<id>/simulacro` · `mias/<id>/preguntar[/<tema>]` | Tema · simulacro de examen · "Pregúntale a tu temario" |
| `propuestas` · `propuestas/nueva` · `propuestas/admin` | 🗳️ Propuestas: votar · proponer · administrador (7 toques en la versión) |
| `<área>` | Página del área: tarjetas de materias (`#estudio`) |
| `<área>/<materia>` | Página de la materia: temas (o lecciones), ubicación y secciones (`#estudio/matematicas`) |
| `<área>/<materia>/<tema>` | Camino de lecciones del tema (`#estudio/matematicas/algebra-lineal`) |
| `…/<tema>/l/<lección>` | Lección de un tema; sin temas: `<área>/<materia>/l/<lección>` (`#estudio/ingles/l/can`) |
| `<área>/<materia>/ubicacion` | Examen de ubicación de la materia |
| `<área>/<materia>/retos` · `…/<tema>/retos` | 🎯 Retos y escenarios de la materia o del tema |
| `<área>/<materia>/<sección>[/…]` | Sección propia (`#estudio/ingles/hablar/u/presentarte`) |

Un área con una sola materia del mismo id no repite el nivel. Ciberseguridad está en Cursos: `#cursos/ciberseguridad/fw`; las rutas de cuando era un área (`#ciberseguridad/…`, `#fw`) se reescriben a esa. Todo lo resuelve `analizar()` en `nucleo/materias.js`; genera rutas solo con `rutaMateria`, `rutaTema` y `rutaLeccion` (las vistas de una materia, como Hablar, usan su raíz escrita a mano para no importar el registro). **Las rutas viejas siguen funcionando** y se reescriben a la canónica: `#<materia>/…` (`#ingles/l/can`), `#algebra/…` (alias de Matemáticas), `#<materia>/l/<lección>` de una materia con temas, y las de una palabra (`#fw`, `#vpn`). Arriba de cada pantalla, `htmlMigas()` pinta las migas de pan con un botón atrás grande (al nivel anterior).

## Agregar un área

Crea `src/areas/<id>/area.js` (el id va en la URL: no lo cambies después de publicarla) y agrégale materias con `area:'<id>'`:

```js
export default {
  nombre:'Idiomas',icono:'🌍',orden:3,tono:'estudio',   // tono: colores de la tarjeta (clases .area-<tono> en estilos/tokens.css)
  descripcion:'Una línea para la tarjeta de la portada.'
};
```

Para un color nuevo, agrega `--t-<tono>` y `--t-<tono>-soft` en `:root` y en los dos bloques de modo oscuro, y la clase `.area-<tono>{--area:…;--area-soft:…}`. `npm run revisar` falla si un área no tiene materias o una materia apunta a un área que no existe.

## Agregar una materia

Crea una carpeta en `src/materias/` y no toques nada más: se registra sola. **El nombre de la carpeta es el id** de la materia (va en la URL y en el progreso guardado), así que no lo cambies después de publicarla (si no queda otra, haz como con `algebra` → `matematicas`: `alias:['viejo']` en la materia y un paso en `migrar()` que renombre sus datos).

```
src/materias/fisica/
  materia.js
  lecciones/
    01-velocidad.js
    02-aceleracion.js
```

`materia.js`:

```js
import {cargarLecciones} from '../../nucleo/cargar.js';

export default {
  nombre:'Física',sigla:'FÍ',icono:'🧲',area:'estudio',orden:5,   // area: obligatoria; icono (o sigla de 2 letras) para las tarjetas
  descripcion:'Una línea para la tarjeta de la portada.',
  intro:'Párrafo opcional para la página de la materia.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
```

### Materia con temas y habilidades (nodos)

Jerarquía: área → materia → tema → **habilidad** (un nodo del camino: algo concreto, como «Producto punto» o «Máscara /24 a /30»). Si la materia se divide en temas, usa `temas/` en vez de `lecciones/` y una lista `temas.js` (datos puros: la leen la app y `npm run revisar`):

```
src/materias/fisica/
  materia.js
  temas.js
  temas/
    cinematica/01-velocidad.js      ← lección escrita (explicación + rondas) de la habilidad 'velocidad'
```

```js
// temas.js — en orden; el id del tema es su carpeta y va en la URL
export default [
  {id:'cinematica',titulo:'Cinemática',icono:'🏃',descripcion:'Posición, velocidad y aceleración.',nodos:[
    {id:'velocidad',gen:'fis/velocidad'},                         // habilidad con lección y generador
    {id:'aceleracion',titulo:'Aceleración',gen:'fis/aceleracion'},  // habilidad solo con generador (necesita titulo)
    {id:'casos',titulo:'Casos reales',banco:'fis/casos'},           // banco de ejercicios fijos
    {ir:'simulador',titulo:'Simulador de caída',icono:'🪂'},        // enlace a una sección de la materia
    {titulo:'Movimiento circular',proximo:true}                     // se ve bloqueado como "Próximamente"
  ]}
];

// materia.js
import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';
const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);
export default {nombre:'Física',icono:'🧲',area:'estudio',orden:5,descripcion:'…',temas,lecciones:habilidades(temas)};
```

- Una habilidad necesita al menos una fuente: su lección (`temas/<tema>/NN-<id>.js`), un generador (`gen`) o un banco (`banco`). Si su generador todavía no existe, se ve sola como "Próximamente" y aparece cuando lo registres.
- En el camino, la primera habilidad está abierta y cada una se desbloquea al practicar la anterior; las herramientas (`ir`) siempre están abiertas y no cuentan para el dominio.
- El progreso, el repaso y las notas se guardan por **materia + id de habilidad**, no por tema: puedes mover una habilidad de tema sin perder nada, pero su id tiene que ser **único en toda la materia** (y no puede ser un id reservado: `l`, `ubicacion`, `cofre`, `jefe`…).
- Para agregar un tema: añádelo a `temas.js` (con sus nodos) y crea su carpeta si tiene lecciones. `npm run revisar` valida ids, campos, carpetas sin declarar, enlaces a secciones que existan y avisa de las habilidades sin generador.

Opcionales, para materias con secciones propias como Ciberseguridad:

- `secciones: {clave:{titulo, grupo, desc, modulo, intro, como, habilidad, propia}}`: cada `modulo` exporta `vista()`, y si las necesita `alMostrar()`, `alClic(t, ir)`, `alEntrar()`, `alSalir()` e `inmersiva()`. `ir('otraClave')` navega dentro de la misma materia. La cabecera es común (`cabeceraSeccion` en `main.js`): título, `intro` (1–3 líneas), `como` (pasos de "¿Cómo se usa?") y, si tiene `habilidad`, el botón "🎯 Practicar" con ejercicios generados que cuentan para esa habilidad; con `propia:true` la sección pinta su cabecera. Desde la habilidad, `herramienta:'<clave>'` en su nodo agrega "🔧 Abrir". **El id de un tema no puede ser igual a la clave de una sección** (la ruta abriría el tema): `npm run revisar` lo comprueba.
- `ejercicioRepaso(clave)`: devuelve `{titulo, ej}` para las preguntas propias que guardaste en el repaso (incluye `regla`).
- `progresoHtml(datos)`: devuelve un bloque HTML que se muestra en Logros (p. ej. la misión, el mapa y las medallas de Hablar).

Una materia necesita al menos 5 lecciones para que el examen de ubicación tenga 10 preguntas con 2 por lección; con menos, cada lección aporta más preguntas (hasta 5 con 2 lecciones). `npm run revisar` avisa si a una lección le faltan preguntas de producción para la ubicación.

## Escribir un generador

Cada habilidad debería tener un generador: ejercicios nuevos al azar, por dificultad, en vez de preguntas fijas. Viven en `src/nucleo/generadores/` (un archivo por materia o tema: `algebra-basica.js`, `algebra-lineal.js`, `calculo.js`, `redes.js`, `seguridad.js`, `datos.js`, `ingles.js`), se registran en `index.js` y se enlazan desde un nodo con `gen:'<prefijo>/<habilidad>'`. Sin DOM: también los usa `npm run revisar`.

```js
import {igualNum} from './verificar.js';
import {lineal,frac} from './formato.js';

const ecuacion={
  titulo:'Ecuaciones lineales',
  explicacion:'Texto corto que se ve antes de practicar (si la habilidad no tiene lección escrita).',
  alternativa:'Otra forma de explicarlo, más básica o con una analogía (botón "🤔 No entendí").',
  generar(nivel,rng){                  // nivel 1–5; rng con semilla: rng.entero(a,b), rng.noCero, rng.elegir, rng.barajar, rng.prob
    const a=rng.entero(2,9),x=rng.noCero(-9,9),b=rng.noCero(-15,15);
    return {
      enunciado:`Resuelve: \\(${lineal([[a,'x'],[b,'']])} = ${a*x+b}\\)`,   // HTML; fórmulas KaTeX entre \( \) o \[ \]
      respuesta:`x = ${x}`,                 // lo que escribiría el usuario (también se muestra al fallar)
      verificar:e=>igualNum(e,x),           // tolerante: igualNum, equivalente, igualLista, igualTexto… (verificar.js)
      pasos:[paso('Pasa el número al otro lado',`\\(${a}x = ${c(a*x)}\\)`,'Lo que suma pasa restando.',{ojo:'Cambia el signo.'}),
             final('Divide',`\\(x = ${c(x)}\\)`,'Lo que multiplica pasa dividiendo.',`x = ${x}`)],  // pasos.js: {que, como, porque, ojo?}; el último con res
      diagrama:rectaNumerica(x),            // opcional: SVG de diagramas.js (planoVectores, areaCurva, rectaNumerica, bitsSubred)
      errores:[{valor:'x = 25',si:e=>igualNum(e,25),por:'Pasaste el número sin cambiar el signo.'}],  // error típico detectado por patrón
      pasoMal:{i:0,texto:'\\(…\\)',por:'…'},  // opcional: habilita "Encuentra el error"
      regla:'La regla en una frase.',pista:'Una ayuda que no regale la respuesta.',
      teclado:'mat'                         // opcional: 'mat' | 'ip' | 'vector'
      // tipo:'opcion' {opciones, correcta} · 'ordenar' {piezas} · 'emparejar' {pares} · forma:{filas,cols} + celdas (matrices)
      // lang:'en' + frase (Inglés): habilita responder hablando
    };
  }
};
export default {'alg/ecuacion-lineal':ecuacion};
```

- La dificultad crece con el nivel (números más grandes, negativos, fracciones, más pasos). El nivel de cada usuario se ajusta solo (rating 1–5).
- **Pasos** (`pasos.js`): `paso(que, como, porque, {ojo})` con los números de ESE ejercicio, y `final(…, res)` al último, donde `res` es la respuesta tal como se escribiría (para `opcion`/`ordenar`/`emparejar`, igual a `respuesta`). En `como`, `c(x)` resalta lo que cambia dentro de una fórmula (`\cambio{}` de KaTeX) y `marca(x)` en texto. `npm run revisar` falla si un generador no da ≥ 2 pasos con `que/como/porque` en sus 5 niveles, si el último no da la respuesta o si falta `alternativa`.
- Con `errores` que tengan `valor`, el motor arma también "verdadero o falso" y la opción de introducción; con `pasos`, el ejemplo resuelto y el hueco; con `pasoMal`, "encuentra el error". Un error típico cuyo valor resulta correcto en un ejercicio se descarta solo.
- `npm run revisar` genera 200 ejercicios por nivel de cada generador y falla si alguno no pasa su propio `verificar`, si una fórmula no compila en KaTeX, si falta la regla o si hay menos de 8 ejercicios distintos por nivel. Las semillas son fijas: un fallo se puede reproducir con `crear(id, nivel, {semilla})`.
- Lo que no se puede generar (casos narrativos) va en `bancos.js` como preguntas con `ref` estable; se mezclan con lo generado.
- **Pregunta nueva con IA (opcional)**: si el usuario guardó su clave de Anthropic, en la práctica aparece ✨, que pide a Claude un ejercicio de la misma habilidad y nivel (`ia-preguntas.js`). Sin clave o si falla, sigue el generador local: la app funciona 100 % sin IA.

## Agregar una lección

Crea un archivo en `lecciones/` de la materia, o en `temas/<tema>/` si la materia tiene temas. El número del nombre define el orden (de lo más útil a lo menos) y el resto es el id: `09-comparativos.js` → `comparativos`. **No renombres el id de un archivo ya publicado**: el progreso, las notas y el repaso guardados lo usan. Para cambiar el orden, cambia solo el prefijo numérico.

```js
const R1='La regla que se muestra al fallar (una frase).';

export default {
  titulo:'Comparativos',nivel:'A2',            // nivel: opcional
  resumen:'Una línea bajo el título y en la tarjeta.',
  explicacion:['Párrafo 1 (HTML permitido: <b>, <i>, <code>)','Párrafo 2'],   // máximo 150 palabras en total
  ejemplos:[['bigger than','nota opcional'],['Texto sin nota']],
  rondas:[[                                    // al menos 2 rondas de al menos 5 ejercicios, todos distintos
    {tipo:'opcion',pregunta:'…',opciones:['a','b','c'],correcta:1,
     porque:{0:'Por qué a está mal',2:'Por qué c está mal'},regla:R1},          // solo como primer ejercicio
    {tipo:'completar',pregunta:'Completa: …',respuestas:['taller','is taller'],
     errores:{'more tall':'Por qué está mal'},pista:'opcional',regla:R1},
    // … hasta tener ≥ 70 % de completar en cada ronda
  ],[
    // segunda ronda: mismos objetivos, ejercicios distintos
  ]]
};
```

- Los textos son HTML escrito en el repositorio (contenido de confianza). Un fragmento de código largo va en `codigo:'…'` (se muestra escapado en un `<pre>`).
- `completar` compara sin distinguir mayúsculas, acentos, espacios sobrantes, signos ¿? ni punto final, y las comas son opcionales. Los números se comparan por valor y aceptan `x = 6`, `6`, `+6`, `0,5` o `1/2`. Los superíndices valen como `^` (`x⁵` = `x^5`). Pon en `respuestas` todas las variantes correctas (la primera es la que se muestra como solución) y en `errores` las respuestas incorrectas típicas con su explicación.
- **Matemáticas legibles en el teléfono**: notación Unicode y HTML simple, sin librerías (funciona sin conexión): `x²`, `x<sup>n</sup>`, `lím<sub>x→2</sub>`, `‖v‖`, `√`, `∫`, `ℝ³`, vectores en negrita (`<b>v</b>`). En las respuestas, el usuario escribe exponentes con `^` (`x^3/3 + C`) y vectores como `(5, −4)`: pon en `respuestas` las variantes razonables (`(5, −4)`, `5, −4`, `(1/5)x^5 + C`…). `npm run revisar` falla si un error típico coincide con una respuesta correcta.
- Los ejercicios se guardan en el repaso por su posición global en la lección (ronda 1 seguida de ronda 2…): agrega ejercicios nuevos **al final de la última ronda** para no desfasar el repaso existente.
- Pasa `npm run revisar` antes de hacer commit.

## Progreso (`src/nucleo/progreso.js`)

Todo vive en `localStorage['ciberlab-progreso']` (formato `v: 10`; los formatos anteriores se migran solos en `migrar()`. Si cambias el significado de algo guardado, sube `VERSION` y agrega su paso de migración). Cada cambio emite el evento `progreso` en `window` para que se actualice la barra superior.

- **Meta diaria**: 10/20/30 ejercicios o 5/10/15 minutos. Los minutos solo cuentan con la pestaña visible y actividad en el último minuto (`main.js`).
- **Racha**: días seguidos con la meta cumplida. Si hoy aún no se cumple, sigue viva desde ayer; hoy cuenta en cuanto la meta está cumplida. Los datos dependen del navegador: el APK usa el almacenamiento del navegador que lo abre (Chrome comparte con Chrome; con otro navegador son datos aparte). "Acerca de" muestra dónde se guardan y los últimos 7 días. Si otra pestaña cambia el progreso, el evento `storage` repinta la app.
- **XP**: 10 por acierto sin pista (5 con pista) en lecciones, ubicación y preguntas de Ciberseguridad; +20 la primera vez que se domina una lección; 5 por acierto en el repaso; 20 por cada caso del laboratorio y 15 por cada escenario de VPN, solo la primera vez. Para subir de nivel hacen falta 100, 300, 600, 1000… XP.
- `npm run revisar` carga un progreso v5 de ejemplo y falla si al migrar se pierden lecciones dominadas, XP, racha, repasos o notas: si agregas una versión, amplía esa comprobación.
- **v7** (método): los repasos pasan a SM-2 (`paso` → intervalo equivalente, misma fecha); cada habilidad guarda `ult` (últimas 10), `dias`, `rating` y `sesiones`; lo ya dominado entra al repaso de habilidades repartido en la semana. `enCurso` deja de usarse.
- **v6** (áreas y temas): `algebra` pasó a `matematicas` en `materias`, el repaso, las notas, `ultimo` e `historial`. Lo demás ya se guardaba por materia + id de lección, así que agrupar en temas no cambió nada.
- **Habilidades** (`materias.<id>.lecciones`, por compatibilidad con el nombre anterior): `{dominada, mejor, intentos, via, ult, dias, rating, sesiones}`; `via` indica si se dominó practicando o en la ubicación. En una lección escrita, la ronda que toca es `intentos % rondas.length`.
- **Repaso** (SM-2, `sm2` en `metodo.js`): `{rep, int, ef, proxima, fallos}`. Fallo → mañana; bien con pista, bien o bien y rápido → el intervalo crece (1, 3 y luego × facilidad). Un ejercicio sale al recordarlo a más de 60 días (`dominados`); las habilidades dominadas (`<materia>/h/<id>`) se siguen repasando con tope de 180 días. Los ejercicios generados se guardan como `<materia>/g/<habilidad>/<nivel>` y en el repaso se genera uno nuevo y parecido.
- **v9** (profundidad): `basicos` `{'<clave>': {ok:[fechas], racha, retirado, materia, habilidad}}` (claves `g:`, `gi:`, `l:`, `b:`), `refuerzos` `{'<materia>/<habilidad>': true}` (un básico retirado pendiente de volver) y `estrellas` `{'<reto>': fecha}` (retos ⭐, repasados con la ref `<materia>/r/<reto>`). Vacíos al migrar. "Reiniciar todo" conserva `estrellas`.
- **v10** (Cursos): Ciberseguridad pasa al área 💼 Cursos. Sus datos ya se guardaban por materia (`ciberseguridad`), así que solo se reescriben `ultimo.ruta` e `historial[].tipo` a `cursos/ciberseguridad/…`; `revisar` migra un v9 con XP, habilidades, repasos y notas de Ciberseguridad y comprueba que no se pierda nada.
- **v8** (cuaderno): `tarjetas` `{[id]: {q, a, nota, titulo, materia, fecha}}`, las líneas `🃏 pregunta | respuesta` de las notas; se repasan con la ref `<materia|notas>/t/<id>` (`ejercicioPorRef`).
- **Notas** (resúmenes): `{'<materia>/<lección>': {texto, fecha}}`. Se conservan en el progreso y se copian al cuaderno como notas con `origen:'resumen:<clave>'` (si la nota no se tocó, se actualiza al cambiar el resumen; borrarla en el cuaderno borra el resumen). "Reiniciar todo el progreso" conserva notas y tarjetas, porque son texto escrito por el usuario.
- **Cuaderno** (IndexedDB `ciberlab-notas`, no en `localStorage`): notas `{id, titulo, cuerpo, materia, tema, etiquetas, fijada, creada, editada}` y archivos `{id, nota, blob…}` (fotos JPEG ≤1600 px, dibujos PNG). El formato del cuerpo (negrita, fórmulas `$…$`, casillas, `![](img:<id>)`…) está en `cuaderno/formato.js`. Si cambias la estructura, sube `VERSION` en `db.js` y migra en `onupgradeneeded`. El respaldo `.json` (Perfil y Notas) incluye progreso, ajustes, notas e imágenes, nunca `ciberlab-ia`.
- En Ciberseguridad, los casos del laboratorio y los escenarios de VPN se guardan por posición: agrégalos al final de sus listas en `datos/`.
- Todo acceso a `localStorage` va en `try/catch` para que la app funcione aunque esté bloqueado.
- El progreso depende del origen (`localhost:5173` y `localhost:4173` tienen progresos distintos). Por eso los puertos están fijos con `strictPort`: si el 5173 está ocupado, Vite falla en vez de abrir otro puerto con el progreso vacío.

## PWA y publicación

- **PWA** con `vite-plugin-pwa` (configuración en `vite.config.js`): manifest con nombre, colores e íconos (`public/icons/`, generados desde `public/favicon.svg`; el `maskable` no tiene esquinas redondeadas y deja el dibujo dentro del círculo seguro). El service worker guarda en caché toda la app (incluidos KaTeX y sus fuentes woff2) y, la primera vez que cargan, las fuentes de Google: funciona sin internet.
- **Actualización**: el HTML va **red primero** (`public/sw-paginas.js`, importado antes que las rutas de Workbox; `navigateFallback:null`): con conexión cada apertura trae el `index.html` nuevo, así que la versión nueva corre a la primera; sin conexión (o si la red tarda más de 4 s) se sirve el guardado. `skipWaiting` + `clientsClaim` activan el service worker nuevo al instalarse. Recarga controlada (`onNeedReload` en `main.js`): si la app está en segundo plano o en Aprender se recarga sola; si estás en otra pantalla aparece «✨ Hay una versión nueva · Actualizar» y se recarga sola al volver a la app (nunca a mitad de una práctica). Busca actualizaciones al volver a la app y cada hora. **Acerca de** muestra la versión exacta (fecha · commit corto, de `APP_VERSION` en el workflow), «✅ Al día» o «✨ Actualización disponible» y los botones «Buscar actualización» / «Actualizar ahora».
- **Nombre e ícono**: la app se llama **Estudio+** (antes CiberLab). Las claves de datos guardados (`ciberlab-progreso`, `ciberlab-notas`, `ciberlab-ia`…) conservan el prefijo viejo a propósito: cambiarlas haría perder los datos. El nombre sale de `src/config.js` (manifest, `<title>`, splash, barra superior, Acerca de, invitación, nombre del respaldo y del APK). El ícono es `public/icons/icono.svg`; si lo cambias, `node scripts/iconos.mjs` regenera todos los PNG (el maskable a sangre con el dibujo dentro del círculo seguro del 80 %, y el monocromo para los íconos temáticos de Android).
- **Sin conexión**: todo funciona salvo la IA y el reconocimiento de voz (en Chrome usa los servidores de Google); una franja avisa cuando no hay red.
- **Recordatorio diario** (Perfil): con permiso de notificaciones, a la hora elegida, si la meta del día no está cumplida, una notificación (una vez al día). Con la app abierta lo revisa `main.js` cada minuto; con la app cerrada, `sw-recordatorio.js` vía Periodic Background Sync (Chrome/Android con la app instalada; el navegador decide el momento, así que la hora es aproximada). El estado se comparte con el service worker en la caché `ciberlab-recordatorio`.
- En `npm run dev` no se registra el service worker (para que la caché no confunda al programar). Para probar la PWA: `npm run build` y `npm run preview`.
- **Publicación**: `.github/workflows/publicar.yml` publica en GitHub Pages en cada push a `main`. Pasa `npm run revisar` (si falla, no publica), compila con `BASE_PATH=/<repositorio>/` porque Pages sirve la app en `https://<usuario>.github.io/<repositorio>/`, y pone `APP_VERSION` con la fecha y el commit.
- Las rutas son con `#hash`, así que Pages no necesita `404.html`.
- El progreso de la versión publicada vive en el navegador de cada persona (origen `https://<usuario>.github.io`) y es independiente del de `localhost`.

## Mis materias (`src/nucleo/mias/`)

Materias propias del usuario a partir de su temario real. Todo funciona sin IA; la IA (clave propia) lee fotos y genera lo que falta.

- **Asistente de 4 pasos** (`mias/nueva`): nombre, escuela, color e ícono → temario (texto pegado, `leerTemario` reconoce «Unidad 2», «1.», «1.1», romanos, letras y viñetas; fotos adjuntas para transcribir con la foto a la vista o ✨ leer con IA) → exámenes con fecha y unidades, días y minutos por día, avisos → revisar (renombrar, arrastrar ⠿ o ↑↓, borrar, agregar, «✅ Ya lo sé», «🔥 Difícil» y la práctica emparejada, que se cambia eligiendo de la lista).
- **Formato de una materia** (IndexedDB `materias`, ver el comentario de `esquema.js`): `{formato:1, id:'mp-…', nombre, escuela, color, icono, unidades:[{id:'u-…', titulo, temas:[{id:'t-…', titulo, subtemas, sabe, dificil, habilidad:{materia,id}|null, emparejado}]}], examenes:[{id:'x-…', nombre, fecha, unidades}], disponibilidad:{dias, minutos}, avisos, fotos, referencias, simulacros, reportados}`. Los ids de tema guardan el avance: al editar el texto del temario, los temas con el mismo nombre conservan su id. `validarMateria` es estricta y `npm run revisar` la prueba.
- **Avance**: un tema emparejado usa la habilidad de la app (el dominio cuenta en los dos lados); uno practicado con su banco generado se guarda como habilidad de la materia propia (`progreso.materias['mp-…'].lecciones['t-…']`, repaso `'<mp-…>/e/<tema>/<ejercicio>'`); «Lo estudié» deja `estudiado` (dominio 0,3); los simulacros suman. `dominioTema` mezcla todo.
- **Plan** (`plan.js`, puro): se recalcula desde hoy cada vez (se reajusta solo, sin regañar). Cada tema se estudia antes del primer examen en que entra; los últimos días (la última semana si hay ≥ 10 días) son de repaso mezclado y simulacros; los temas difíciles y poco dominados reciben dos sesiones. `comprobarPlan` falla si algo queda el día del examen o después; `npm run revisar` lo prueba con 300 materias al azar. El plan de hoy entra en «👉 Lo siguiente para ti» (antes que lo demás) y cuenta para la meta y la racha. Avisos una semana y un día antes (app abierta y `sw-recordatorio.js`).
- **Simulacro**: mezcla práctica de la app y ejercicios generados de los temas del examen, con tiempo, sin pistas y sin feedback hasta el final (`crearSesion({sinFeedback:true})`); al final, calificación, revisión de cada error con su procedimiento y resultado guardado.
- **Compartir**: `paqueteMateria` → `.json` con el temario, las fechas y lo generado (sin fotos ni resultados) por Web Share o descarga; «📥 Importar» en Mis materias. El respaldo completo incluye materias y lo generado.

### IA: Gemini o Claude (`src/nucleo/ia.js`)

Todas las funciones con IA (conversación de Hablar, «Explícamelo de otra forma», pregunta nueva, Foto a nota, Resuélvelo conmigo, temario, ejercicios y simulacros de Mis materias) llaman a `pedir({sistema, mensajes, imagenes, esquemaJSON, maxTokens, nivel:'texto'|'vision', esfuerzo})` (o `pedirJSON` con el formato anterior) y funcionan igual con los dos proveedores, incluidas imágenes y respuestas JSON por esquema.

- **Gemini** (recomendado y por defecto): `gemini-3.8-flash` (el Flash estable más reciente; gratis en el plan gratuito) para texto e imágenes, con `generateContent` (`x-goog-api-key`, `systemInstruction`, `inlineData`, `generationConfig.responseJsonSchema` y `thinkingConfig.thinkingLevel`). Verificado en ai.google.dev en octubre de 2026. **En el plan gratuito, Google puede usar lo enviado para mejorar sus modelos**: Ajustes y Acerca de lo avisan.
- **Claude** (de pago): `claude-haiku-5-5` para texto (o Sonnet si se elige) y `claude-sonnet-5-5` para fotos, con la Messages API (`output_config.format` json_schema).
- **Clave**: `localStorage['ciberlab-ia']` = `{proveedor, claves:{gemini, claude}, modelo}`; el formato viejo `{clave, modelo}` se lee como clave de Claude (nadie pierde la suya). Solo en este teléfono, nunca en respaldos, código, git ni logs; solo se envía a la API de su proveedor. Se configura en `#ajustes-ia` (guía de 3 pasos con enlace a aistudio.google.com para la clave gratis de Gemini).
- **Errores amables**: 429 (límite de uso; en Gemini, «límite gratuito»), clave inválida, sin conexión, respuesta cortada o bloqueada. Costos estimados con `costoUSD` (0 con Gemini: los botones dicen «gratis con Gemini» y no piden confirmar).
- **Pruebas**: `revisar` simula las respuestas de los dos proveedores (formato de la petición, imágenes, JSON, turnos, tokens, 429, clave inválida, respuesta cortada, clave vieja).

### IA de Mis materias (`ia.js`, `cuaderno/foto.js`)

- **Modelos**: los de `nucleo/ia.js` según el proveedor (nivel `texto` para generar, `vision` para fotos). Con Claude, Haiku 5.5 ($0.10 / $0.50 por millón de tokens) y Sonnet 5.5 para fotos ($2 / $10): cada botón muestra el costo estimado (`costo()`) y si pasa de 2 centavos pide confirmar; con Gemini dice «gratis con Gemini». Las fotos se comprimen (1280 px) y solo se envían al tocar el botón.
- **Banco generado de un tema** (IndexedDB `generados`, id `'<materia>/<tema>'`): `{leccion:{idea, ejemplo:{enunciado, pasos}, hueco:{enunciado, pasos, pregunta, respuesta, alternativas}}, ejercicios:[{id, nivel:1–3, tipo:'numero'|'expresion'|'texto'|'opcion', enunciado, respuesta, tolerancia?, alternativas?, opciones?, correcta?, pasos:[{que,como,porque,ojo?}], errores:[{valor,por}], regla, pista}]}`. `validarBanco` descarta los ejercicios que no cumplen (la respuesta debe pasar su propia verificación y ningún error típico puede ser correcto) y exige lección completa y ≥ 10 ejercicios en ≥ 2 niveles; si no, se pide de nuevo **una vez** (también si el JSON llega inválido). `aPregunta` lo convierte en pregunta de `sesion.js` (número con tolerancia, expresión equivalente con sus variables, texto con alternativas u opción). Se paga una vez y funciona sin conexión. Etiqueta «✨ Generado con IA: revisa con tu libro o profesor» y «⚠️ Reportar error» (lo marca en `reportados` y lo saca del repaso).
- **Fixtures**: `scripts/fixtures/bancos.mjs` (trigonométricas, Independencia de México, molaridad, y uno inválido a propósito); `npm run revisar` los valida sin llamar a la API y las pruebas los usan como respuestas simuladas.
- **📸 Foto a nota**: Sonnet devuelve `{titulo, tema_sugerido, tipo, contenido_markdown, pasos, conceptos_clave, tarjetas, dudas_o_partes_ilegibles, posibles_errores_en_la_foto}`; vista previa editable con la foto, archivada en el tema sugerido (materias propias primero, luego el catálogo); los errores de la foto quedan como `> ⚠️` sin cambiar el texto; «🃏 Crear tarjetas» las agrega al repaso. **🧠 Resuélvelo conmigo**: el primer turno lleva la foto (Sonnet) y los siguientes solo texto (Haiku); preguntas, pistas graduales, el paso completo al segundo error en el mismo paso, solución en formato de procedimiento y 3 ejercicios parecidos (del generador de la app si empareja; si no, con IA y validados).
- **Sin clave**: todo lo demás funciona; los botones ✨ explican cómo obtenerla. OCR local con Tesseract.js 7 (dependencia exacta, se importa al usarlo; el motor y el idioma se bajan de jsDelivr la primera vez y el service worker los guarda en la caché `ocr`): funciona mal con fórmulas.

## APK para Android (Trusted Web Activity)

El APK es una **Trusted Web Activity** hecha con Bubblewrap: abre `https://ajandradeperez-dev.github.io/estudio/` a pantalla completa, sin barra del navegador. Como carga la web, **cada push a `main` llega solo a quienes tienen el APK**; solo hay que regenerarlo si cambian el nombre, el ícono, los colores, el paquete o los atajos.

- **Configuración**: `android/twa-manifest.json` (lo único de `android/` que se versiona; el proyecto Gradle se genera). Nombre visible **Estudio+** (antes CiberLab; el paquete nunca cambia para que el APK se instale encima). Paquete `io.github.ajandradeperez.estudio`, `minSdkVersion` 24 (Android 7.0; la librería de Bubblewrap lo exige).
- **Llave de firma**: `C:\Users\angel\.ciberlab-firma\` (`ciberlab.keystore`, alias `ciberlab`; contraseña en `contraseñas.txt` y huella en `huella-sha256.txt`). **Nunca** va al repositorio (`.gitignore` bloquea `*.keystore`, `*.jks`, contraseñas, `*.apk`, `*.aab`). Si se pierde, no se pueden publicar actualizaciones con el mismo paquete: hay que tener una copia de respaldo de esa carpeta.
- **Verificación del dominio**: el repo `ajandradeperez-dev/ajandradeperez-dev.github.io` sirve `/.well-known/assetlinks.json` (paquete + huella SHA-256 del certificado, pública por diseño) y `.nojekyll`. Sin él, Android muestra la barra de dirección. Se comprueba con
  `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://ajandradeperez-dev.github.io&relation=delegate_permission/common.handle_all_urls`.
- **Herramientas** (fuera del repo, en `~/.bubblewrap/`): Temurin JDK 17 **x64** (Bubblewrap exige 17 exacto; en Windows su instalador baja uno de 32 bits que se queda sin memoria con Gradle) y el Android SDK con `build-tools;36.1.0` y `platforms;android-36`. `~/.bubblewrap/config.json` apunta a los dos.
- **Regenerar** (en Windows, desde `android/`; Bubblewrap 1.25.0 o posterior):
  1. Sube `appVersionCode` (y `appVersionName`) en `android/twa-manifest.json`; cambia lo que haga falta. Si cambiaste el nombre en `src/config.js`, cámbialo también aquí (`name`, `launcherName`).
  2. `npx @bubblewrap/cli@1.25.0 update` (regenera el proyecto desde `twa-manifest.json`; acepta la pregunta).
  3. Con las contraseñas en `BUBBLEWRAP_KEYSTORE_PASSWORD` y `BUBBLEWRAP_KEY_PASSWORD`, el `bin` del JDK 17 al principio del `PATH` (Bubblewrap llama a `jarsigner` por nombre) y **sin** la variable `NoDefaultCurrentDirectoryInExePath` (si existe, `cmd` no encuentra `gradlew.bat`): `npx @bubblewrap/cli@1.25.0 build --skipPwaValidation`.
  4. Salen `app-release-signed.apk` y `app-release-bundle.aab`. Comprueba la firma con `apksigner verify --print-certs` (la huella debe ser la de `huella-sha256.txt`).
  5. Publica una Release en este repo con los archivos renombrados a `EstudioPlus.apk` y `EstudioPlus.aab` (el enlace de Perfil es `…/releases/latest/download/EstudioPlus.apk`, de `APK_ARCHIVO`/`APK_URL` en `src/config.js`) y una copia `CiberLab.apk` para los enlaces viejos: `gh release create android-<versión> EstudioPlus.apk EstudioPlus.aab CiberLab.apk --latest`.
  6. Versiones publicadas: 1.0.0 (código 1, CiberLab) y 1.1.0 (código 2, Estudio+). Cada APK nuevo necesita un `appVersionCode` mayor y la misma llave, o Android no lo instala encima.
- Si algún día cambia la llave (o se sube a Play Store con la firma de Google), agrega la huella nueva a `assetlinks.json` del repo `ajandradeperez-dev.github.io`.

## Sincronizar entre dispositivos (no implementado)

Hoy cada teléfono guarda lo suyo (no hay cuentas) y se pasa de uno a otro con **Exportar todo / Importar**. Si algún día se quiere sincronizar:

- **Supabase** (recomendado: Postgres, autenticación por correo o Google, plan gratis): una tabla `respaldos(usuario uuid, actualizado timestamptz, datos jsonb)` con Row Level Security (`usuario = auth.uid()`), y las fotos en Supabase Storage en una carpeta por usuario. La app subiría el mismo JSON de `cuaderno/respaldo.js` (sin la clave de IA) al cambiar algo (con espera de unos segundos) y lo bajaría al iniciar sesión; para fusionar, gana lo más reciente por nota (`editada`) y, en el progreso, el máximo de XP/racha y la unión de repasos.
- **Firebase** (Firestore + Auth + Storage) sirve igual: un documento por usuario con el progreso y una subcolección `notas`, con reglas `request.auth.uid == userId`.
- En ambos casos: la clave pública del proyecto puede ir en el código (no es secreta), pero nunca la de servicio; la sincronización debe ser opcional y la app tiene que seguir funcionando sin conexión.

## Convenciones

- **Nunca subas claves ni secretos** (API keys de Anthropic u otras, archivos `.env`, tokens) al repositorio: es público. La clave de la conversación con IA la pega el usuario en la app y vive solo en el `localStorage` de su dispositivo. No la escribas en el código, en logs ni en mensajes de error. Revisa `git diff` antes de cada commit.
- JavaScript puro con módulos ES, sin frameworks. Dependencias de runtime (versión exacta, empaquetadas para funcionar sin conexión): KaTeX (fórmulas), qrcode-generator (el QR de "Invitar amigos") y Tesseract.js (OCR sin IA; su motor y el idioma se descargan al usarlo). Vite solo para desarrollo y build; playwright-core solo para `scripts/iconos.mjs`.
- Estilo compacto: plantillas con template strings y `.map(...).join('')`.
- Todo texto que escriba el usuario (respuestas, notas) se pasa por `esc()` antes de meterlo en HTML.
- Los colores siempre salen de las variables CSS (`--accent`, `--ok`, `--bad`…) para que funcione el modo oscuro.
- **Sistema de diseño** (estilo app de idiomas, paleta propia): todo color, radio y espacio sale de `estilos/tokens.css`; los componentes de `nucleo/ui.js` y `estilos/componentes.css` se reutilizan en vez de escribir estilos sueltos. Botón principal 3D (`.btn`), secundario (`.btn.ghost`), del área (`.btn.area`). Móvil primero a 360 px, toques de **44 px** como mínimo, sin scroll horizontal, contraste AA (cada color de fondo tiene su `--on-…`). Animaciones de 250 ms o menos, desactivadas con `prefers-reduced-motion`. Cada área tiene su color (`--t-<tono>`): dentro de `.area-<tono>` barras, nodos y `.btn.area` lo usan.
- **Navegación**: barra inferior fija con 5 pestañas (Aprender, Repasar con el número de repasos de hoy, Notas, Logros, Perfil); al editar una nota se oculta y la barra de formato queda encima del teclado (`--teclado`, `interactive-widget=resizes-content`); en pantallas anchas pasa a la izquierda. Una vista con `inmersiva: true` (sesión de práctica) oculta las barras. Las migas de pan con botón ← ubican dentro de Aprender.
- **Botón Atrás** (Android, APK/TWA, PWA, laptop y el ← de las migas; `main.js`): el historial del navegador ES la pila de pantallas. **Una entrada por cada navegación que hace la persona**, con `pushState` síncrono dentro de su toque o clic (lleva la activación del usuario: Chrome en Android se salta con el botón Atrás las entradas agregadas sin ella, «history manipulation intervention»; por eso fallaron la «trampa» y el colchón de entradas). Navegaciones automáticas (rutas viejas, redirecciones, la vuelta de un enlace, el primer pintado) usan `replaceState`. **Sin entradas de relleno.**
  - `go(ruta,{modo})`: `'push'` (la persona navegó), `'replace'` (automático) o `'pop'` (Atrás: solo pinta). Salir de una práctica o capa a la misma ruta vuelve de un salto a su entrada (`desde`) en vez de agregar otra.
  - **popstate solo pinta** la ruta guardada en la entrada (`{app, i, ruta, inm?, capa?, desde?}`) o cierra las capas que ya no tienen entrada; nunca hace push ni replace (el diagnóstico lo marca con `enPop` y `npm run atras` lo comprueba).
  - **Capas** (modal, hoja de feedback, procedimiento, dibujo, visor): un `MutationObserver` les da su propia entrada al aparecer (aparecen con un toque); Atrás las cierra; si se cierran con su botón, la app quita su entrada con `history.back()`.
  - **Práctica** (vista inmersiva sobre la misma ruta): al empezarla con un toque se agrega una entrada; Atrás sale de ella (lo respondido ya quedó guardado).
  - **Enlace directo o recarga en una ruta profunda**: al **primer toque** se reconstruye la cadena de padres (`padreDe()`: lección → tema → materia → área → Aprender) con `pushState`, ya con activación. Antes del primer toque, un Atrás sale de la app (no se puede evitar sin entradas creadas por la persona).
  - **Portada de Aprender**: al primer toque queda una entrada «base» debajo; Atrás llega a ella y muestra «Toca otra vez para salir»; el siguiente cierra la app (en la laptop, sale de la página).
  - Ninguna pantalla cambia `location.hash` ni usa `location.replace`: navegan con `go()`, `data-go` o `document.dispatchEvent(new CustomEvent('ir',{detail:ruta|{ruta,reemplazar}}))`.
  - **Diagnóstico**: `nucleo/diagnostico.js` guarda los últimos 30 eventos (carga, nav, push, replace, popstate, back, cadena) con `history.length`, posición, `navigator.userActivation` (hasBeenActive/isActive), si es TWA (`document.referrer` `android-app://`) y la versión de Chrome. Se ve en Perfil → Acerca de → **3 toques en la versión**, con «📋 Copiar» (7 toques siguen abriendo el administrador de Propuestas).
  - **Pruebas**: `npm run atras` (teléfono y escritorio, Atrás del navegador con `page.goBack()`): 6 niveles hasta el procedimiento y 8 Atrás, práctica con varias preguntas y «¿Salir?», enlace directo + primer toque, recarga, ← de las migas y el diagnóstico. El navegador automatizado no aplica la protección de Chrome: la prueba final es en el teléfono.
  - **Cómo probarlo en el teléfono**: 1) Perfil → Acerca de: la versión debe ser la del último commit y decir «✅ Al día»; 2) toca la versión 3 veces y luego «🗑️ Borrar» para empezar limpio; 3) Aprender → Estudio → Matemáticas → un tema → una lección → Practicar, responde una y abre «📖 Ver procedimiento»; 4) presiona Atrás sin tocar la pantalla: procedimiento, hoja, práctica, lección, tema, Matemáticas, Estudio, Aprender y «Toca otra vez para salir»; 5) si algo falla, vuelve a Acerca de, toca la versión 3 veces y «📋 Copiar», y envía el texto.
- **Pantalla de práctica**: siempre con `crearSesion()` (una pregunta por pantalla, ✕, barra de progreso, "Comprobar" abajo, hoja verde o roja con la respuesta correcta, el porqué, el error típico y la regla). No escribas pantallas de ejercicios a mano.
- El laboratorio de incidentes es **defensivo**: identificar ataques y elegir respuestas, nunca enseñar a ejecutarlos.

## 📊 Curso de Excel (`src/materias/excel/`, área 💼 Cursos)

12 temas (Interfaz y datos → Fórmulas y referencias → Resumen → Lógica → Condicionales → Búsqueda → Texto y fechas → Ordenar, filtrar y formato → Tablas dinámicas → Gráficos → Atajos → Escenarios y herramientas), 25 habilidades `xl/…`, todas ✅.

- **Evaluador** (`nucleo/excel/formulas.js`, sin DOM ni librerías): referencias relativas/absolutas/mixtas, rangos, operadores con la precedencia de Excel (`=-2^2` = 4), `;` o `,` como separador (con `;` la coma es decimal), funciones en español y en inglés (`SUMA`/`SUM`, `BUSCARV`/`VLOOKUP`…; lista en `FUNCIONES`), fechas como número de serie (`serial`, `HOY` usa `hoja.hoy` si está fijo), criterios de CONTAR.SI con operadores y comodines, y errores reales (`#¡DIV/0!`, `#N/A`, `#¿NOMBRE?`, `#¡REF!` también para referencias circulares, `#¡VALOR!`, `#¡ERROR!` = fórmula mal escrita). `copiarFormula(f, de, a)` mueve lo relativo. Casos de prueba en `scripts/fixtures/excel-casos.mjs` (150, con resultado esperado; `revisar` exige un caso por función y por error).
- **Mini hoja** (`nucleo/excel/hoja.js`): `htmlHoja(h)`, `activarHoja` y `insertarRef`. Un toque en una celda escribe su referencia en la respuesta; otro toque enseguida la convierte en rango (A2 → A2:A9); con mouse se puede arrastrar. Solo la hoja se desplaza de lado (`.xl-marco`), filas de 40 px. En la práctica (`sesion.js`) una pregunta con `hoja` la muestra bajo el enunciado; con `teclado:'xl'` los toques escriben referencias, hay teclado de símbolos y la hoja muestra en vivo el resultado (y el de sus copias).
- **Generadores** (`generadores/excel-base.js`, `excel.js`, `excel2.js`): tablas realistas (`tablaVentas`, `tablaCalif` con «Pendiente», `tablaInventario`, `tablaNomina`; clientes y gastos en sus archivos). `formulaQ` verifica **por resultado**: la fórmula del usuario se evalúa en la hoja que ve y en otra con otros datos (y en todas sus copias si se copia hacia abajo, `copiar:n`, o a un rectángulo, `destinos`; con `virtual:true` se evalúa sin escribirla, para reglas de formato condicional) y debe dar lo mismo que la correcta; `esperado(d)` es el segundo cálculo independiente en JavaScript (`comprobar`). Los errores típicos son fórmulas (`[fórmula, por]`) que se detectan por su resultado, más avisos genéricos de #¿NOMBRE?, #N/A, fórmula incompleta y «no fijaste con $». `valorQ` es para preguntas con la hoja a la vista y respuesta escrita. Niveles 1–2 básicos, 3–5 procedimiento.
- **Retos** (`retos.js`): una aplicación por tema y, en Escenarios, 4 escenarios de 4 fórmulas sobre la misma hoja (`excel-escenarios.js`: reporte de ventas, gastos personales, calificaciones, inventario con alertas) y un simulacro.
- **Herramientas** (secciones): `hoja` (hoja libre con datos de ejemplo, barra de fórmulas y explicación de cada error; se guarda en `localStorage['ciberlab-excel']`), `dinamica` (simulador de tabla dinámica: filas, columnas, Suma/Cuenta/Promedio y filtro de mes) y `organizar` (ordenar, filtrar, formato condicional, barras de datos y validación).

## Definición de terminado (estándar de calidad del contenido)

`src/nucleo/terminado.js` (sin DOM) define cuándo algo está ✅; `npm run revisar` lo aplica a todo, escribe **`src/contenido/estado.json`** (lo lee la app: `nucleo/contenido.js`) y **`src/contenido/PLAN.md`** (no se edita a mano), y **falla si una habilidad marcada `completa:true` en su `temas.js` no cumple los 10 puntos**.

- **Habilidad ✅** (los 10 puntos): 1 `obj` («Al terminar puedes…») y `ref` (referencia al temario: «Stewart 3.4 – Regla de la cadena», «MO-200 4.2 – …», «Security+ 4.8 – …») en su nodo de `temas.js`; 2 explicación de una pantalla (`explicacion` + `alternativa` + `regla`); 3 dos ejemplos resueltos (pasos en niveles 1–2 y 4–5); 4 ejemplo con huecos; 5 generador de 5 niveles con **≥ 3 plantillas por nivel**; 6 **≥ 3 errores típicos**; 7 **≥ 2 problemas de aplicación** (retos de aplicación o escenario que usan su generador; un generador de aplicaciones declara a quién aplica con `aplica:['alg/…']` y un reto puede declarar `habilidades:['gen/…']`); 8 explicación alternativa; 9 **≥ 3 `tarjetas`** `[[pregunta, respuesta]…]` en el generador (conceptos clave, fórmulas; entran al repaso espaciado con la ref `<materia>/k/<habilidad>/<i>` desde la primera práctica); 10 profundidades básico, procedimiento y aplicación.
- **Tema ✅**: todas sus habilidades ✅, sin «Próximamente», ≥ 1 reto `escenario` integrador, un reto `simulacro:true` de 10–15 preguntas (con tiempo, sin pistas, calificación y revisión: `sesionExamen` en `nucleo/examen.js`), la hoja del tema (`notas/tema/<materia>/<tema>`: objetivos, reglas y conceptos clave, se puede guardar como nota) y 1–3 `referencias` («📚 Para profundizar»). Los temas de solo herramientas (🔧) no cuentan.
- **Materia ✅**: todos sus temas ✅, **examen final acumulativo** (`<materia>/examen-final`: 20 preguntas de todas sus habilidades, 30 min, sin pistas; guarda el mejor resultado en `materias.<id>.extra.examenFinal`) y **certificado interno** (`<materia>/certificado`, con 70 % o más; constancia de práctica, **sin valor oficial**: lo dice la pantalla).
- **Cobertura del temario** = habilidades ✅ / total del plan (incluye las «Próximamente»). Se ve en la página de cada materia (barra y estado), de cada tema (cobertura, «¿Qué falta para ✅?», 📄 Hoja del tema y 📚 Para profundizar) y en Perfil.
- Nunca marques algo como ✅ a mano: si no cumple, queda 🟡 y PLAN.md dice qué le falta.

## Renombrar la app (pendiente: el nombre todavía no está elegido)

El nombre vive en un solo lugar: `APP_NOMBRE` y `APP_MARCA` en `src/config.js`. Al tener el nombre nuevo, hay que tocar:
1. `src/config.js`: `APP_NOMBRE`, `APP_MARCA` (barra superior), `APP_DESCRIPCION`, `INVITACION`; y si cambia el nombre del archivo del APK, `APK_ARCHIVO`.
2. Se actualizan solos con el build: manifest (`name`, `short_name`), `<title>`, splash e `index.html` (%APP_NOMBRE%), barra superior, Acerca de, invitación y QR, nombre del respaldo `.json`.
3. `android/twa-manifest.json`: `name` y `launcherName` (y subir `appVersionCode`/`appVersionName`); regenerar y firmar el APK con la **misma llave y el mismo paquete** (`io.github.ajandradeperez.estudio`, que NO cambia).
4. Release nueva en GitHub con el APK y el AAB con el nombre nuevo, además de copias con los nombres viejos (`EstudioPlus.apk`, `CiberLab.apk`) para los enlaces ya compartidos.
5. Textos: `README` (si existe), este CLAUDE.md, la descripción del repositorio y la bienvenida si menciona el nombre (`grep -rn "Estudio+" src`).
6. NO cambian: las claves de datos (`ciberlab-progreso`, `ciberlab-notas`, `ciberlab-ia`…), el id del manifest, la URL ni el paquete del APK (cambiarlos haría perder datos o instalaciones).

## 🗳️ Propuestas y votos (`src/nucleo/propuestas/`, Supabase)

Lo único de la app que usa un servidor: los votos tienen que ser compartidos. Todo lo demás sigue solo en el teléfono.

- **Configuración**: `SUPABASE_URL` y `SUPABASE_CLAVE_PUBLICA` en `src/config.js` (la clave **anon/publishable**, pública por diseño). Vacías → la sección muestra las propuestas iniciales (`SEMILLA`) y «La votación todavía no está activa». La clave **service_role / sb_secret** nunca va al código ni a git (`revisar` busca claves privadas en los archivos versionados).
- **Base de datos**: `supabase/propuestas.sql` (se pega en Supabase → SQL Editor; se puede volver a correr). Tablas `propuestas(id, tipo curso|tema|libro, titulo ≤60, descripcion ≤280, estado, motivo, respuesta, enlace, autor uuid, creada, actualizada, aprobada_en)`, `votos(dispositivo, propuesta)` con llave primaria compuesta (1 voto por propuesta por dispositivo) y `admins(usuario → auth.users)`. Estados: `pendiente` (no se ve) → `votacion` → `aprobada` (sola, al llegar a 5 votos) → `preparacion` → `disponible`; o `descartada` (con motivo) / `rechazada` (spam, no se ve).
- **RLS**: con la clave pública no se puede leer ni escribir ninguna tabla directamente; solo las funciones `security definer`: `listar_propuestas()` (publicadas, con votos, sin autor), `mis_votos(dispositivo)`, `votar()` (bloquea la fila, 1 por propuesta, **máximo 3 votos activos**, aprueba a los 5), `quitar_voto()` (solo en votación) y `proponer()` (largos, tipo, filtro de palabras `ofensivo()` y **2 por dispositivo cada 7 días**; entra como `pendiente`). El administrador (usuario autenticado que está en `admins`) puede leer y cambiar todo en `propuestas` por la política `admin_todo`. Límite honesto: el identificador anónimo se puede regenerar borrando los datos del navegador; el administrador revisa antes de publicar y puede corregir.
- **App**: `logica.js` (reglas y mensajes, sin DOM), `api.js` (fetch a `/rest/v1/rpc/…` y Auth; 429 → «espera un minuto»), `estado.js` (identificador anónimo `ciberlab-dispositivo`, último estado `ciberlab-propuestas` para verlo sin conexión, cola de votos/propuestas que se envía al volver la red, avisos ya vistos), `vistas.js` (rutas `propuestas`, `propuestas/nueva`, `propuestas/admin`, `propuestas/abrir/<id>`). Nada de esto entra al respaldo. La portada muestra «🎉 ¡Ya está lo que pediste!» cuando algo que este teléfono votó pasa a disponible.
- **Administrar**: Perfil → Acerca de → tocar **7 veces** la versión → correo → enlace mágico (Supabase Auth; vuelve a la app con `#access_token=…`, que `main.js` guarda en `ciberlab-admin` y lleva a `#propuestas/admin`). La primera vez, en el SQL Editor: `insert into public.admins(usuario) select id from auth.users where email = '<tu correo>';` (el correo no se escribe en el repositorio). La pantalla muestra cuántas hay pendientes de revisión y aprobadas por preparar; ✅ Publicar / ⛔ Rechazar, estado, respuesta, motivo y enlace. Para un correo automático al aprobarse algo: Supabase → Database → Webhooks sobre `propuestas` (update) hacia una Edge Function o un servicio de correo (opcional).
- **Pruebas**: `scripts/fixtures/supabase-simulado.mjs` imita las funciones con las mismas reglas; `revisar` prueba límites, duplicados, aprobación a los 5, cola sin conexión, 429, propuestas pendientes ocultas y el aviso de disponible.

## 📚 Lectura (⚪ próximamente)

`src/materias/lectura/materia.js` con `proximo:true`: la tarjeta del área dice "⚪ Próximamente" y su página muestra solo "Agrega tus libros, marca tu avance por capítulos, guarda citas y notas, y repasa ideas clave" con "➕ Agregar libro" deshabilitado. No cuenta para metas ni racha, no sale en la bienvenida, en Perfil ni en "Lo siguiente". Modelo previsto (irá en `materias.lectura.extra`; al implementarlo, sube `VERSION`):

```js
libros:[{id, titulo, autor, portada?, capitulos:[{titulo, leido}], notas:[{texto, capitulo?, fecha}], citas:[{texto, pagina?, fecha}], meta_paginas_dia}]
```

## Avance del contenido

Se trabaja por bloques (cada uno: `npm run revisar`, build, commit y push). **Si se corta el trabajo, continúa desde el último bloque terminado.**

| Bloque | Estado |
|---|---|
| 1 · Profundidad (básicos que se retiran, refuerzo, retos ⭐), PLAN.md, estados ✅🟡⚪, 📚 Lectura | ✅ terminado |
| 2a · Matemáticas · Álgebra (12 habilidades, 3 plantillas por nivel, 5 retos + simulacro) | ✅ terminado |
| 2b · Matemáticas · Álgebra lineal (14 habilidades, 3 plantillas por nivel, 3 retos + escenario + simulacro) | ✅ terminado |
| 2c · Matemáticas · Cálculo diferencial (13 habilidades, 3 plantillas por nivel, 3 retos + escenario + simulacro) | ✅ terminado |
| 2d · Matemáticas · Cálculo integral (9 habilidades, 3 plantillas por nivel, 3 retos + escenario + simulacro) | ✅ terminado |
| 2e · Matemáticas · Trigonometría (4) y Aritmética y prealgebra (5), con retos, escenarios y simulacros | ✅ terminado: **Matemáticas completa (6 temas ✅)** |
| 3a · Ciberseguridad · Fundamentos de redes (12 habilidades: OSI, IPv4, VLSM, IPv6, DNS, DHCP, ARP nuevas; 2 retos + escenario + simulacro) | ✅ terminado |
| Cursos fase 1 · Ciberseguridad pasa a 💼 Cursos (progreso v10) | ✅ terminado |
| Cursos fase 2 · Curso de Excel: evaluador, mini hoja, 25 generadores, 12 retos/escenarios, 3 herramientas | ✅ terminado |
| Cursos fase 3 · 🗳️ Propuestas y votos (Supabase; falta crear el proyecto y pegar URL y clave pública) | ✅ código listo |
| Cursos fase 4 · IA con Gemini (gratis, por defecto) o Claude, capa común `nucleo/ia.js`; pruebas de todo lo nuevo | ✅ terminado |
| **Nuevo orden (PROMPT «Cursos completos y efectivos», reemplaza el de PROMPT-CONTENIDO.md)** | |
| P0 · Arreglos: Atrás en el APK (colchón de historial contra la protección de Chrome), versión y «al día» en Acerca de, HTML red primero, assetlinks verificado (todo coincide), lista para renombrar | ✅ terminado (Atrás: falta confirmarlo en el teléfono) |
| P1 · Infraestructura: Definición de terminado (terminado.js → estado.json y PLAN.md), cobertura visible, 📚 Para profundizar, hoja del tema, tarjetas al repaso, simulacros con tiempo, examen final y certificado interno; temarios completos con referencias (Stewart, Lay, Grossman, Cambridge/Murphy, Network+/Security+/CCNA, MO-200, OpenIntro/McKinney/ISLR) | ✅ terminado · cobertura con el estándar nuevo: Matemáticas 0/88, Inglés 0/66, Ciberseguridad 0/55, Excel 0/29, Ciencia de datos 0/44 (a todas les faltan sobre todo tarjetas, aplicaciones y plantillas) |
| P2 · Matemáticas: Álgebra → Funciones → Álgebra lineal → Cálculo diferencial → Cálculo integral → Trigonometría → Prealgebra | ⏳ siguiente: Álgebra (tarjetas, aplicaciones por habilidad, ecuaciones con radicales/valor absoluto y desigualdades no lineales) |
| P3 · Inglés A1 → A2 → B1 → B2 + simulacros + prueba de nivel | pendiente |
| P4 · Ciberseguridad: Redes → Firewalls → Cripto y VPN → Security+ → escenarios | pendiente |
| P5 · Excel alineado a MO-200 + examen final | pendiente |
| P6 · Ciencia de datos: Descriptiva → Probabilidad → Inferencia → Python → ML → proyecto | pendiente |
| 4 · Inglés: completar A1 y A2, luego B1 | pendiente |
| 5 · Ciencia de datos: Descriptiva → Probabilidad → Python → resto | pendiente |
| 6 · Inglés B2 y temas avanzados | pendiente |

Conteos al terminar el bloque 1: 22 temas (✅ 0 · 🟡 15 · ⚪ 7), 50 generadores, 2 bancos, 15 retos (8 de Ciberseguridad, 7 de Inglés). Conteos al terminar el bloque 2a: ✅ 1 (Álgebra) · 🟡 14 · ⚪ 7, 62 generadores, 21 retos. Bloque 2b: ✅ 2 · 🟡 13 · ⚪ 7, 71 generadores, 26 retos. Bloque 2c: ✅ 3 · 🟡 12 · ⚪ 7, 80 generadores, 31 retos. Bloque 2e: ✅ 6 · 🟡 11 · ⚪ 5, 97 generadores, 46 retos. Bloque 2d: ✅ 4 · 🟡 11 · ⚪ 7, 86 generadores, 36 retos; el lector de expresiones acepta arcsen/arctan y |x|, y las antiderivadas se verifican derivando (`antiOk` en calculo-int.js), así vale cualquier forma correcta (ln|x| o ln(x)). En las respuestas de expresiones se acepta `sen` (además de `sin`) y `bonito()` (calculo-dif.js) muestra la respuesta como la escribiría una persona.

Cómo se hace un tema de Matemáticas (ver Álgebra): generadores en `generadores/algebra-temas*.js` con `plantillas(rng,{nombre:()=>…})` (3 por nivel, `p.plantilla`), `profundidad(n)`, `referencia`, ≥3 errores con `valor` y `comprobar()` (segundo cálculo independiente: sustituir, probar puntos; `revisar` falla si da false). Para mejorar un generador viejo sin cambiar su id: `conVariantes(g, {nivel:{plantilla:rng=>…}}, comprobar, {regla,pista,teclado})` de `algebra-variantes.js` (ejemplos: `algebra-variantes.js`, `algebra-lineal-variantes.js`), registrado al FINAL de `GENERADORES` en `index.js` para que pise al original. Compara números calculados con una tolerancia directa, no con `celdasIguales` (su lector de texto no entiende `1e-16`). Aplicaciones con contexto en `generadores/aplicaciones.js` (`apl/…`) y retos, escenario y simulacro (`simulacro(gens)`) en `retos.js`. Matemáticas empieza cada habilidad con 2 ejemplos resueltos (`ejemplosResueltos:2` en su materia.js). `revisar` avisa de los generadores de Matemáticas con menos de 3 plantillas y de lo que le falta a cada tema 🟡.

Meta por habilidad de Matemáticas: 2 ejemplos resueltos, 1 con huecos, generador de 5 niveles con ≥3 plantillas por nivel, ≥3 errores típicos; por tema ≥3 aplicaciones, ≥1 escenario y un simulacro de 10–15 preguntas. Por unidad de Inglés: escucha de 80–150 palabras con 5 preguntas, ≥12 chunks, 2 gramáticas con generador, 2 diálogos, pronunciación, 4-3-2, jefe, ≥40 palabras de vocabulario y ≥3 lecturas graduadas por nivel.

## Calidad

- `npm run revisar` (también lo corre la publicación): método de las lecciones, jerarquía (áreas, temas, nodos, enlaces a secciones, ids), contenido de habla de Inglés, migración del progreso, los generadores (200 ejercicios por nivel que pasan su `verificar`, fórmulas KaTeX válidas, regla, profundidad, comprobación independiente y variedad), PLAN.md ↔ temas.js y los retos.
- `npm run calidad` (`scripts/calidad.mjs`) detecta textos encimados comparando los rectángulos de cada texto visible (`getClientRects`), además de scroll horizontal y toques chicos. Evita anchos fijos y posiciones absolutas en elementos con texto; usa filas con `flex-wrap` (como el Mapa MCER). No reutilices nombres de clase genéricos entre secciones (`.casilla` del mapa chocó con las casillas del cuaderno): usa un prefijo (`mapa-`, `nota-`).
- Antes de publicar un cambio de interfaz, revísalo a **360 × 800**, en claro y en oscuro: sin scroll horizontal, toques ≥ 44 px, fórmulas largas dentro de su caja; y sin conexión (la app, KaTeX y sus fuentes están en la caché del service worker).
- Si cambias el formato guardado, sube `VERSION` en `progreso.js`, agrega su paso en `migrar()` y amplía la comprobación de migración de `revisar` (lecciones dominadas, XP, racha, repasos, notas, medallas; los ajustes y la clave de IA viven en otras claves y no se tocan).
- No arranques el servidor de desarrollo para dejarlo corriendo: para probar, `npm run build` + `npm run preview` (o un `vite preview` puntual) y apágalo al terminar.

## Comandos

```
npm install       # primera vez
npm run dev       # servidor de desarrollo: http://localhost:5173 (puerto fijo)
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4173 (puerto fijo)
npm run revisar   # método, jerarquía, contenido de habla, migración del progreso, los 50 generadores y Mis materias (esquema, plan, fixtures) (~10 s)
npm run atras     # botón Atrás nivel por nivel (6 niveles y 7 Atrás, enlace directo, recarga, otras ramas) en teléfono y escritorio
npm run calidad   # 360 y 412 px, claro y oscuro: textos encimados, scroll horizontal y toques < 44 px en Aprender, Logros, Perfil, Notas y cada materia y tema (compila y levanta su propio preview; necesita Chrome o Edge)
```
