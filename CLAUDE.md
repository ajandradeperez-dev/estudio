# CiberLab

## Idioma

**Responde siempre en español**, también en explicaciones, mensajes de commit y comentarios de código. Los textos de la app están en español neutro (orientado a Latinoamérica); mantén ese tono.

## Qué es

App para estudiar cualquier tema, organizada en **materias**. Todo corre en el navegador: no hay backend y el progreso se guarda en `localStorage`.

- **Materias**: Ciberseguridad (simuladores de firewall/VPN, laboratorio de incidentes, examen), Inglés, Álgebra y Ciencia de datos.
- **Lecciones en formato común**: explicación corta, ejemplos y práctica (opción múltiple, completar respuesta o tarjetas).
- **Enganche**: racha de días cumpliendo una meta diaria (ejercicios o minutos), XP y nivel por materia, "Repasar hoy" con repetición espaciada, "Continuar donde te quedaste" y la página "Mi progreso".

## Estructura

```
index.html                Esqueleto: menú (#nav), barra superior (#barra) y vista (#vista)
vite.config.js            Puertos fijos (5173 dev, 4173 preview) con strictPort
src/
  main.js                 Rutas, menú, delegación de eventos y conteo de minutos activos
  estilos.css             Todo el CSS (variables en :root, modo oscuro, responsive a 760px)
  utilidades.js           $, esc (escapar HTML) y utilidades IP
  nucleo/                 Motor común a todas las materias
    materias.js           Registro automático de materias (import.meta.glob) y búsqueda de ejercicios por referencia
    cargar.js             cargarLecciones(): carga la carpeta lecciones/ de una materia
    progreso.js           Todo lo que se guarda: racha, meta, XP, lecciones, repaso, "continuar"
    ejercicios.js         Los tres tipos de ejercicio: HTML, corrección y resultado
    leccion.js            Vista de lección (aprender → practicar → resumen)
    repaso.js             "Repasar hoy"
    portada.js            Portada, página de materia y barra superior
    miprogreso.js         "Mi progreso"
    ui.js                 barra() de progreso
  materias/
    ciberseguridad/       materia.js, secciones/ (simuladores), datos/, progreso.js (ganchos propios)
    ingles/               materia.js + lecciones/01-….js
    algebra/
    ciencia-datos/
```

### Rutas (`#hash`)

| Ruta | Vista |
|---|---|
| (vacía) | Portada: continuar + materias |
| `repaso` / `progreso` | Repasar hoy / Mi progreso |
| `<materia>` | Página de la materia: nivel, lecciones y secciones |
| `<materia>/l/<lección>` | Lección en formato común |
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
- `ejercicioRepaso(clave)`: devuelve `{titulo, ej}` para las preguntas propias que guardaste en el repaso.
- `progresoHtml(datos)`: devuelve un bloque HTML para "Mi progreso".

## Agregar una lección

Crea un archivo en `lecciones/` de la materia. El número del nombre define el orden y el resto es el id: `04-futuro.js` → `futuro`. **No renombres un archivo ya publicado**: el progreso y el repaso guardados usan ese id. Para insertar una lección en medio, usa el siguiente número libre o renumera solo el prefijo, nunca el resto del nombre.

```js
export default {
  titulo:'Futuro con will',
  resumen:'Una línea que aparece bajo el título y en la tarjeta.',
  explicacion:['Párrafo 1 (HTML permitido: <b>, <i>, <code>)','Párrafo 2'],
  ejemplos:[['I will call you.','nota opcional'],['Texto sin nota']],
  practica:[
    {tipo:'opcion',pregunta:'…',opciones:['a','b','c'],correcta:1,explicacion:'opcional'},
    {tipo:'completar',pregunta:'…',respuestas:['will go',"'ll go"],pista:'opcional',explicacion:'opcional'},
    {tipo:'tarjeta',frente:'¿…?',reverso:'Respuesta'}
  ]
};
```

- Los textos son HTML escrito en el repositorio (contenido de confianza). Un fragmento de código largo va en `codigo:'…'` (se muestra escapado en un `<pre>`).
- `completar` compara sin distinguir mayúsculas, acentos, espacios sobrantes ni punto final. Los números se comparan por valor y aceptan `x = 6`, `6`, `+6`, `0,5` o `1/2`. Pon en `respuestas` todas las variantes válidas; la primera es la que se muestra como solución.
- Los ejercicios se guardan en el repaso por su posición (`<materia>/l/<lección>/<índice>`): agrega ejercicios nuevos **al final** de `practica` para no desfasar el repaso existente.

## Progreso (`src/nucleo/progreso.js`)

Todo vive en `localStorage['ciberlab-progreso']` (formato `v: 2`; el formato anterior, de cuando solo existía Ciberseguridad, se migra solo). Cada cambio emite el evento `progreso` en `window` para que se actualice la barra superior.

- **Meta diaria**: 10/20/30 ejercicios o 5/10/15 minutos. Los minutos solo cuentan con la pestaña visible y actividad en el último minuto (`main.js`).
- **Racha**: días seguidos con la meta cumplida. Si hoy aún no se cumple, sigue viva desde ayer.
- **XP**: 10 por acierto en lecciones y en las preguntas de Ciberseguridad, +20 la primera vez que se termina una lección, 5 por acierto en el repaso; 20 por cada caso del laboratorio y 15 por cada escenario de VPN, solo la primera vez. Para subir de nivel hacen falta 100, 300, 600, 1000… XP.
- **Repaso**: un ejercicio fallado entra para hoy. Si lo aciertas en el repaso, vuelve en 1, 3, 7, 14 y 30 días; tras acertarlo a los 30 días queda dominado y sale del repaso. Si lo fallas, vuelve mañana y empieza de nuevo.
- En Ciberseguridad, los casos del laboratorio y los escenarios de VPN se guardan por posición: agrégalos al final de sus listas en `datos/`.
- Todo acceso a `localStorage` va en `try/catch` para que la app funcione aunque esté bloqueado.
- El progreso depende del origen (`localhost:5173` y `localhost:4173` tienen progresos distintos). Por eso los puertos están fijos con `strictPort`: si el 5173 está ocupado, Vite falla en vez de abrir otro puerto con el progreso vacío.

## Convenciones

- JavaScript puro con módulos ES, sin frameworks ni dependencias de runtime; Vite solo para desarrollo y build.
- Estilo compacto: plantillas con template strings y `.map(...).join('')`.
- Todo texto que escriba el usuario se pasa por `esc()` antes de meterlo en HTML.
- Los colores siempre salen de las variables CSS (`--accent`, `--ok`, `--bad`…) para que funcione el modo oscuro.
- El laboratorio de incidentes es **defensivo**: identificar ataques y elegir respuestas, nunca enseñar a ejecutarlos.

## Comandos

```
npm install       # primera vez
npm run dev       # servidor de desarrollo: http://localhost:5173 (puerto fijo)
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4173 (puerto fijo)
```
