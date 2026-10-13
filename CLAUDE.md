# CiberLab

## Idioma

**Responde siempre en español**, también en explicaciones, mensajes de commit y comentarios de código. Los textos de la app están en español neutro (orientado a Latinoamérica); mantén ese tono.

## Qué es

App para estudiar cualquier tema, organizada en **materias**, que aplica métodos de estudio efectivos (ver "Método de aprendizaje"). Todo corre en el navegador: no hay backend y el progreso se guarda en `localStorage`.

- **Jerarquía**: área → materia → tema → lección. Áreas: 🛡️ **Ciberseguridad** (una sola materia: lecciones + simuladores de firewall/VPN, laboratorio de incidentes, examen) y 🎯 **Estudio y metas** (Inglés A1–A2 con Hablar; Matemáticas con temas Álgebra básica, Álgebra lineal, Cálculo diferencial y Cálculo integral; Ciencia de datos con temas Estadística, Probabilidad, Python y pandas, Visualización y Machine learning básico). Los temas son opcionales: Inglés y Ciberseguridad no los usan.
- El recomendador "¿Qué sigue?", el repaso espaciado, la racha y la meta diaria son **globales**: cuentan todas las áreas.
- **Lecciones**: explicación corta, ejemplos y práctica en rondas, casi toda de producción.
- **Enganche**: racha de días cumpliendo una meta diaria (ejercicios o minutos), XP y nivel por materia, "Repasar hoy" con repetición espaciada y práctica mezclada, "Continuar donde te quedaste", "Mis notas" y "Mi progreso".

## Método de aprendizaje

Estas reglas se aplican a **todas** las materias. Cualquier lección nueva debe cumplirlas; `npm run revisar` comprueba las que se pueden verificar automáticamente y falla si alguna no se cumple. Los umbrales están en `src/nucleo/metodo.js`.

1. **Examen de ubicación por materia.** Entre 10 y 15 preguntas de producción, sin pista, repartidas entre las lecciones (`repartoUbicacion`). Las lecciones en las que aciertas el 80 % de sus preguntas quedan **dominadas** y no hace falta estudiarlas. Las preguntas salen de la última ronda de cada lección, así la práctica posterior empieza con ejercicios nuevos. Lo que falles aquí no va al repaso: lo aprenderás en la lección. Hay un botón "No lo sé" para no adivinar.
2. **Mínimo 70 % de producción.** Producción = el usuario escribe la respuesta (completar, traducir, resolver): tipo `completar`. La opción múltiple solo sirve **para introducir**: como mucho una por ronda y siempre la primera. Las tarjetas no cuentan como producción.
3. **Contenido ordenado por utilidad.** En cada materia, lo que más se usa va primero: en Inglés, la gramática y el vocabulario de mayor frecuencia (to be → presente simple → can → there is → presente continuo → pasado → futuro → vocabulario de trabajo). La **explicación** de cada lección tiene como máximo **150 palabras**.
4. **Dominio.** Una lección cuenta como aprendida solo con **80 % de aciertos sin pista** en una ronda. Si no se llega, se repite con **otra ronda de ejercicios distintos** (cada lección tiene al menos 2). Usar la pista no cuenta para el dominio y manda el ejercicio al repaso.
5. **Práctica mezclada.** "Repasar hoy" intercala materias y, dentro de cada materia, lecciones (`mezclar` en `repaso.js`). Al dominar una lección, dos ejercicios de producción de otra ronda entran al repaso para el día siguiente.
6. **Cada error explica.** Al fallar se muestra lo que escribiste, **por qué está mal** (`porque` de cada opción incorrecta o `errores` típicos de la respuesta escrita) y **la regla correcta** (`regla`, obligatoria en cada ejercicio), además de la respuesta correcta. Los aciertos solo muestran "¡Correcto!" para no perder tiempo.
7. **Resumen propio.** Al dominar una lección se pide escribir un resumen de 1–2 frases que se guarda en **"Mis notas"** y se muestra al volver a la lección.

Para no perder tiempo: repetir una lección va directo a la práctica, todo se puede hacer con el teclado (Enter para comprobar y Enter para seguir), la página de cada materia tiene un botón a la siguiente lección pendiente y el examen de ubicación evita estudiar lo que ya sabes.

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
- **Calidad (Android Chrome primero)**: todo lo de Hablar debe funcionar a 360 px sin scroll horizontal y con controles de al menos 40 px de alto. Si no hay reconocimiento de voz (`soporte.escuchar`), cada actividad ofrece la alternativa escrita (diálogos, IA, frases, repaso) y la fluidez queda como temporizador; si no hay síntesis (`soporte.hablar`), se muestra el texto en vez del audio. Lo que no usa la IA funciona sin conexión (PWA).
- **Estilo juego** (`hablar/juego.js`): hablar da 15 XP por frase con 80+ (escribir da 10); combo de frases seguidas ×1,5 desde 3, ×2 desde 5, ×3 desde 10, y se rompe al fallar; medallas (`MEDALLAS`, cada una con `logra(p, extra)`); sonidos con Web Audio que se pueden silenciar (`localStorage['ciberlab-ajustes']`). **Misión diaria de habla** (`MISION` en `progreso.js`): 20 frases en voz alta o una conversación de 5 turnos; cumplirla cumple la meta del día y suma a la racha.

En Ciberseguridad, los simuladores, el laboratorio y el examen rápido son herramientas de práctica, no lecciones. El examen rápido es de respuesta escrita (`datos/preguntas.js`, mismo formato que los ejercicios de lección, con `respuestas`, `errores` y `regla`). Sus preguntas y las del laboratorio entran al repaso mezclado, y cada error muestra la regla o la explicación del caso. El laboratorio de incidentes sigue siendo de elegir opción: es un caso práctico de diagnóstico, no un ejercicio de memoria.

## Estructura

```
index.html                Esqueleto: menú (#nav), barra superior (#barra) y vista (#vista)
vite.config.js            Puertos fijos (5173 dev, 4173 preview) con strictPort
scripts/
  revisar-contenido.mjs   npm run revisar: comprueba el método en todas las lecciones y el contenido de habla de Inglés
src/
  main.js                 Rutas (resolver() sobre analizar()), migas, menú, delegación de eventos y conteo de minutos activos
  areas/<id>/area.js      Cada área: nombre, icono, tono de color, descripción, orden
  estilos.css             Todo el CSS (variables en :root, modo oscuro, responsive a 760px)
  utilidades.js           $, esc (escapar HTML) y utilidades IP
  nucleo/                 Motor común a todas las materias
    metodo.js             Reglas del método: umbrales, reparto de la ubicación, producción
    materias.js           Registro de áreas y materias, rutas canónicas (rutaMateria/rutaTema/rutaLeccion), analizar(ruta)
                          que entiende rutas nuevas y viejas, y búsqueda de ejercicios por referencia de repaso
    cargar.js             cargarLecciones() (carpeta lecciones/) y cargarTemas() (carpetas temas/<tema>/)
    progreso.js           Todo lo que se guarda: racha, meta, XP, lecciones, ubicación, repaso, notas, "continuar"
    ejercicios.js         Tipos de ejercicio: HTML, pista, corrección y explicación del error
    leccion.js            Vista de lección (aprender → ronda → resultado y resumen)
    ubicacion.js          Examen de ubicación
    repaso.js             "Repasar hoy" con práctica mezclada
    notas.js              "Mis notas"
    portada.js            Portada (áreas), página de área, de materia (temas), camino de un tema, migas y barra superior
    miprogreso.js         "Mi progreso"
    ui.js                 barra() de progreso
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
    ingles/               materia.js + lecciones/01-….js, metodo.md (4 vertientes),
                          errores-pronunciacion.js (sonidos difíciles: causa, tip físico, pares mínimos, detecta())
                          hablar/: index.js (rutas), unidades.js, contenido.js, pasos.js (escucha, fluidez),
                          dialogos.js, frases.js, practica.js, dialogo.js, ia.js + claude.js (API), juego.js
    matematicas/          materia.js + temas.js (lista de temas) + temas/<tema>/NN-….js (antes "algebra": alias y migración v6)
    ciencia-datos/        materia.js + temas.js + temas/<tema>/NN-….js
```

### Rutas (`#hash`)

| Ruta | Vista |
|---|---|
| (vacía) | Portada: lo siguiente para ti, continuar y tarjetas de área |
| `repaso` / `notas` / `progreso` | Repasar hoy / Mis notas / Mi progreso |
| `<área>` | Página del área: tarjetas de materias (`#estudio`) |
| `<área>/<materia>` | Página de la materia: temas (o lecciones), ubicación y secciones (`#estudio/matematicas`) |
| `<área>/<materia>/<tema>` | Camino de lecciones del tema (`#estudio/matematicas/algebra-lineal`) |
| `…/<tema>/l/<lección>` | Lección de un tema; sin temas: `<área>/<materia>/l/<lección>` (`#estudio/ingles/l/can`) |
| `<área>/<materia>/ubicacion` | Examen de ubicación de la materia |
| `<área>/<materia>/<sección>[/…]` | Sección propia (`#estudio/ingles/hablar/u/presentarte`) |

Un área con una sola materia del mismo id no repite el nivel: Ciberseguridad es `#ciberseguridad/fw`. Todo lo resuelve `analizar()` en `nucleo/materias.js`; genera rutas solo con `rutaMateria`, `rutaTema` y `rutaLeccion` (las vistas de una materia, como Hablar, usan su raíz escrita a mano para no importar el registro). **Las rutas viejas siguen funcionando** y se reescriben a la canónica: `#<materia>/…` (`#ingles/l/can`), `#algebra/…` (alias de Matemáticas), `#<materia>/l/<lección>` de una materia con temas, y las de una palabra (`#fw`, `#vpn`). Arriba de cada pantalla, `htmlMigas()` pinta las migas de pan con un botón atrás grande (al nivel anterior).

## Agregar un área

Crea `src/areas/<id>/area.js` (el id va en la URL: no lo cambies después de publicarla) y agrégale materias con `area:'<id>'`:

```js
export default {
  nombre:'Idiomas',icono:'🌍',orden:3,tono:'estudio',   // tono: colores de la tarjeta (clases .area-<tono> en estilos.css)
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

### Materia con temas

Si la materia se divide en temas, usa `temas/` en vez de `lecciones/` y una lista `temas.js` (datos puros: la leen la app y `npm run revisar`):

```
src/materias/fisica/
  materia.js
  temas.js
  temas/
    cinematica/01-velocidad.js
    dinamica/01-leyes-de-newton.js
```

```js
// temas.js — en orden; el id es la carpeta y va en la URL
export default [
  {id:'cinematica',titulo:'Cinemática',icono:'🏃',descripcion:'Posición, velocidad y aceleración.'},
  {id:'dinamica',titulo:'Dinámica',icono:'🧲',descripcion:'Fuerzas y leyes de Newton.',
   proximas:['Trabajo y energía']}             // títulos que aún no existen: se ven bloqueados como "Próximamente"
];

// materia.js
import {cargarTemas} from '../../nucleo/cargar.js';
import defs from './temas.js';
const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);
export default {nombre:'Física',icono:'🧲',area:'estudio',orden:5,descripcion:'…',temas,lecciones:temas.flatMap(t=>t.lecciones)};
```

- El progreso, el repaso y las notas se guardan por **materia + id de lección**, no por tema: puedes mover una lección de tema sin perder nada, pero su id tiene que ser **único en toda la materia**.
- Un tema sin lecciones (solo `proximas`) se ve entero como "Próximamente". El examen de ubicación es de toda la materia.
- Para agregar un tema: añádelo a `temas.js` y crea su carpeta. `npm run revisar` valida ids únicos y válidos, campos obligatorios, carpetas sin declarar, ids de lección repetidos y temas sin lecciones ni próximas.

Opcionales, para materias con secciones propias como Ciberseguridad:

- `secciones: {clave:{titulo, grupo, desc, modulo}}`: cada `modulo` exporta `vista()`, y si las necesita `alMostrar()` y `alClic(t, ir)`. `ir('otraClave')` navega dentro de la misma materia.
- `ejercicioRepaso(clave)`: devuelve `{titulo, ej}` para las preguntas propias que guardaste en el repaso (incluye `regla`).
- `progresoHtml(datos)`: devuelve un bloque HTML para "Mi progreso".

Una materia necesita al menos 5 lecciones para que el examen de ubicación tenga 10 preguntas con 2 por lección; con menos, cada lección aporta más preguntas (hasta 5 con 2 lecciones). `npm run revisar` avisa si a una lección le faltan preguntas de producción para la ubicación.

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
- `completar` compara sin distinguir mayúsculas, acentos, espacios sobrantes, signos ¿? ni punto final, y las comas son opcionales. Los números se comparan por valor y aceptan `x = 6`, `6`, `+6`, `0,5` o `1/2`. Pon en `respuestas` todas las variantes correctas (la primera es la que se muestra como solución) y en `errores` las respuestas incorrectas típicas con su explicación.
- Los ejercicios se guardan en el repaso por su posición global en la lección (ronda 1 seguida de ronda 2…): agrega ejercicios nuevos **al final de la última ronda** para no desfasar el repaso existente.
- Pasa `npm run revisar` antes de hacer commit.

## Progreso (`src/nucleo/progreso.js`)

Todo vive en `localStorage['ciberlab-progreso']` (formato `v: 6`; los formatos anteriores se migran solos en `migrar()`. Si cambias el significado de algo guardado, sube `VERSION` y agrega su paso de migración). Cada cambio emite el evento `progreso` en `window` para que se actualice la barra superior.

- **Meta diaria**: 10/20/30 ejercicios o 5/10/15 minutos. Los minutos solo cuentan con la pestaña visible y actividad en el último minuto (`main.js`).
- **Racha**: días seguidos con la meta cumplida. Si hoy aún no se cumple, sigue viva desde ayer.
- **XP**: 10 por acierto sin pista (5 con pista) en lecciones, ubicación y preguntas de Ciberseguridad; +20 la primera vez que se domina una lección; 5 por acierto en el repaso; 20 por cada caso del laboratorio y 15 por cada escenario de VPN, solo la primera vez. Para subir de nivel hacen falta 100, 300, 600, 1000… XP.
- **v6** (áreas y temas): `algebra` pasó a `matematicas` en `materias`, el repaso, las notas, `ultimo` e `historial`. Lo demás ya se guardaba por materia + id de lección, así que agrupar en temas no cambió nada.
- **Lecciones**: `{dominada, mejor, intentos, via}`; `via` indica si se dominó practicando o en la ubicación. La ronda que toca es `intentos % rondas.length`.
- **Repaso**: un ejercicio fallado (o acertado con pista) entra para hoy. Si lo aciertas sin pista, vuelve en 1, 3, 7, 14 y 30 días; tras acertarlo a los 30 días queda dominado y sale. Si lo fallas, vuelve mañana y empieza de nuevo.
- **Notas**: `{'<materia>/<lección>': {texto, fecha}}`. "Reiniciar todo el progreso" las conserva, porque son texto escrito por el usuario.
- En Ciberseguridad, los casos del laboratorio y los escenarios de VPN se guardan por posición: agrégalos al final de sus listas en `datos/`.
- Todo acceso a `localStorage` va en `try/catch` para que la app funcione aunque esté bloqueado.
- El progreso depende del origen (`localhost:5173` y `localhost:4173` tienen progresos distintos). Por eso los puertos están fijos con `strictPort`: si el 5173 está ocupado, Vite falla en vez de abrir otro puerto con el progreso vacío.

## PWA y publicación

- **PWA** con `vite-plugin-pwa` (configuración en `vite.config.js`): manifest con nombre, colores e íconos (`public/icons/`, generados desde `public/favicon.svg`; el `maskable` no tiene esquinas redondeadas y deja el dibujo dentro del círculo seguro). El service worker guarda en caché toda la app y, la primera vez que cargan, las fuentes de Google: funciona sin internet.
- **Actualización automática**: `skipWaiting` + `clientsClaim` activan la versión nueva en cuanto se instala. `main.js` no recarga de golpe: espera a que el usuario cambie de pantalla (`go()` con otra ruta) para no cortar un ejercicio. Busca actualizaciones al volver a la app y cada hora. La versión instalada se ve al final de "Mi progreso".
- En `npm run dev` no se registra el service worker (para que la caché no confunda al programar). Para probar la PWA: `npm run build` y `npm run preview`.
- **Publicación**: `.github/workflows/publicar.yml` publica en GitHub Pages en cada push a `main`. Pasa `npm run revisar` (si falla, no publica), compila con `BASE_PATH=/<repositorio>/` porque Pages sirve la app en `https://<usuario>.github.io/<repositorio>/`, y pone `APP_VERSION` con la fecha y el commit.
- Las rutas son con `#hash`, así que Pages no necesita `404.html`.
- El progreso de la versión publicada vive en el navegador de cada persona (origen `https://<usuario>.github.io`) y es independiente del de `localhost`.

## Convenciones

- **Nunca subas claves ni secretos** (API keys de Anthropic u otras, archivos `.env`, tokens) al repositorio: es público. La clave de la conversación con IA la pega el usuario en la app y vive solo en el `localStorage` de su dispositivo. No la escribas en el código, en logs ni en mensajes de error. Revisa `git diff` antes de cada commit.
- JavaScript puro con módulos ES, sin frameworks ni dependencias de runtime; Vite solo para desarrollo y build.
- Estilo compacto: plantillas con template strings y `.map(...).join('')`.
- Todo texto que escriba el usuario (respuestas, notas) se pasa por `esc()` antes de meterlo en HTML.
- Los colores siempre salen de las variables CSS (`--accent`, `--ok`, `--bad`…) para que funcione el modo oscuro.
- El laboratorio de incidentes es **defensivo**: identificar ataques y elegir respuestas, nunca enseñar a ejecutarlos.

## Comandos

```
npm install       # primera vez
npm run dev       # servidor de desarrollo: http://localhost:5173 (puerto fijo)
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4173 (puerto fijo)
npm run revisar   # comprueba que las lecciones cumplen el método de aprendizaje
```
