# CiberLab

## Idioma

**Responde siempre en español**, también en explicaciones, mensajes de commit y comentarios de código. Los textos de la app están en español neutro (orientado a Latinoamérica); mantén ese tono.

## Qué es

App para estudiar cualquier tema, organizada en **materias**, que aplica métodos de estudio efectivos (ver "Método de aprendizaje"). Todo corre en el navegador: no hay backend y el progreso se guarda en `localStorage`.

- **Materias**: Ciberseguridad (lecciones + simuladores de firewall/VPN, laboratorio de incidentes, examen), Inglés (A1–A2), Álgebra y Ciencia de datos.
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

En Ciberseguridad, los simuladores, el laboratorio y el examen rápido son herramientas de práctica, no lecciones. El examen rápido es de respuesta escrita (`datos/preguntas.js`, mismo formato que los ejercicios de lección, con `respuestas`, `errores` y `regla`). Sus preguntas y las del laboratorio entran al repaso mezclado, y cada error muestra la regla o la explicación del caso. El laboratorio de incidentes sigue siendo de elegir opción: es un caso práctico de diagnóstico, no un ejercicio de memoria.

## Estructura

```
index.html                Esqueleto: menú (#nav), barra superior (#barra) y vista (#vista)
vite.config.js            Puertos fijos (5173 dev, 4173 preview) con strictPort
scripts/
  revisar-contenido.mjs   npm run revisar: comprueba el método en todas las lecciones
src/
  main.js                 Rutas, menú, delegación de eventos y conteo de minutos activos
  estilos.css             Todo el CSS (variables en :root, modo oscuro, responsive a 760px)
  utilidades.js           $, esc (escapar HTML) y utilidades IP
  nucleo/                 Motor común a todas las materias
    metodo.js             Reglas del método: umbrales, reparto de la ubicación, producción
    materias.js           Registro automático de materias (import.meta.glob) y búsqueda de ejercicios por referencia
    cargar.js             cargarLecciones(): carga la carpeta lecciones/ de una materia
    progreso.js           Todo lo que se guarda: racha, meta, XP, lecciones, ubicación, repaso, notas, "continuar"
    ejercicios.js         Tipos de ejercicio: HTML, pista, corrección y explicación del error
    leccion.js            Vista de lección (aprender → ronda → resultado y resumen)
    ubicacion.js          Examen de ubicación
    repaso.js             "Repasar hoy" con práctica mezclada
    notas.js              "Mis notas"
    portada.js            Portada, página de materia y barra superior
    miprogreso.js         "Mi progreso"
    ui.js                 barra() de progreso
  materias/
    ciberseguridad/       materia.js, lecciones/, secciones/ (simuladores), datos/, progreso.js (ganchos propios)
    ingles/               materia.js + lecciones/01-….js
    algebra/
    ciencia-datos/
```

### Rutas (`#hash`)

| Ruta | Vista |
|---|---|
| (vacía) | Portada: continuar + materias |
| `repaso` / `notas` / `progreso` | Repasar hoy / Mis notas / Mi progreso |
| `<materia>` | Página de la materia: siguiente lección, ubicación, lecciones y secciones |
| `<materia>/ubicacion` | Examen de ubicación |
| `<materia>/l/<lección>` | Lección |
| `<materia>/<sección>` | Sección propia (p. ej. `ciberseguridad/fw`) |

Las rutas antiguas de una palabra (`#fw`, `#vpn`…) siguen funcionando y llevan a Ciberseguridad.

## Agregar una materia

Crea una carpeta en `src/materias/` y no toques nada más: se registra sola. **El nombre de la carpeta es el id** de la materia (va en la URL y en el progreso guardado), así que no lo cambies después de publicarla.

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
  nombre:'Física',sigla:'FÍ',orden:5,          // sigla: 2 letras para el ícono; orden: posición en la portada
  descripcion:'Una línea para la tarjeta de la portada.',
  intro:'Párrafo opcional para la página de la materia.',
  lecciones:cargarLecciones(import.meta.glob('./lecciones/*.js',{eager:true}))
};
```

Opcionales, para materias con secciones propias como Ciberseguridad:

- `secciones: {clave:{titulo, grupo, desc, modulo}}`: cada `modulo` exporta `vista()`, y si las necesita `alMostrar()` y `alClic(t, ir)`. `ir('otraClave')` navega dentro de la misma materia.
- `ejercicioRepaso(clave)`: devuelve `{titulo, ej}` para las preguntas propias que guardaste en el repaso (incluye `regla`).
- `progresoHtml(datos)`: devuelve un bloque HTML para "Mi progreso".

Una materia necesita al menos 5 lecciones para que el examen de ubicación tenga 10 preguntas con 2 por lección; con menos, cada lección aporta más preguntas (hasta 5 con 2 lecciones). `npm run revisar` avisa si a una lección le faltan preguntas de producción para la ubicación.

## Agregar una lección

Crea un archivo en `lecciones/` de la materia. El número del nombre define el orden (de lo más útil a lo menos) y el resto es el id: `09-comparativos.js` → `comparativos`. **No renombres el id de un archivo ya publicado**: el progreso, las notas y el repaso guardados lo usan. Para cambiar el orden, cambia solo el prefijo numérico.

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

Todo vive en `localStorage['ciberlab-progreso']` (formato `v: 3`; los formatos anteriores se migran solos). Cada cambio emite el evento `progreso` en `window` para que se actualice la barra superior.

- **Meta diaria**: 10/20/30 ejercicios o 5/10/15 minutos. Los minutos solo cuentan con la pestaña visible y actividad en el último minuto (`main.js`).
- **Racha**: días seguidos con la meta cumplida. Si hoy aún no se cumple, sigue viva desde ayer.
- **XP**: 10 por acierto sin pista (5 con pista) en lecciones, ubicación y preguntas de Ciberseguridad; +20 la primera vez que se domina una lección; 5 por acierto en el repaso; 20 por cada caso del laboratorio y 15 por cada escenario de VPN, solo la primera vez. Para subir de nivel hacen falta 100, 300, 600, 1000… XP.
- **Lecciones**: `{dominada, mejor, intentos, via}`; `via` indica si se dominó practicando o en la ubicación. La ronda que toca es `intentos % rondas.length`.
- **Repaso**: un ejercicio fallado (o acertado con pista) entra para hoy. Si lo aciertas sin pista, vuelve en 1, 3, 7, 14 y 30 días; tras acertarlo a los 30 días queda dominado y sale. Si lo fallas, vuelve mañana y empieza de nuevo.
- **Notas**: `{'<materia>/<lección>': {texto, fecha}}`. "Reiniciar todo el progreso" las conserva, porque son texto escrito por el usuario.
- En Ciberseguridad, los casos del laboratorio y los escenarios de VPN se guardan por posición: agrégalos al final de sus listas en `datos/`.
- Todo acceso a `localStorage` va en `try/catch` para que la app funcione aunque esté bloqueado.
- El progreso depende del origen (`localhost:5173` y `localhost:4173` tienen progresos distintos). Por eso los puertos están fijos con `strictPort`: si el 5173 está ocupado, Vite falla en vez de abrir otro puerto con el progreso vacío.

## Convenciones

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
