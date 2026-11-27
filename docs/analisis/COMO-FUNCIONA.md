# 🧭 Mi análisis: cómo funciona

Proyecto de Álgebra lineal dentro de Estudio+. La pantalla está en **Perfil → 🧭 Mi análisis** (`#perfil/analisis`).
Usa los datos que la app ya guarda de las actividades del alumno y responde tres preguntas con tres técnicas de álgebra lineal.
Todo se calcula en el dispositivo, sin librerías: el álgebra está escrita a mano.

## Los datos

Salen del progreso guardado en el dispositivo (`src/nucleo/progreso.js`) y de Mis materias (`src/nucleo/mias/datos.js`).

- **Matriz X** (`src/nucleo/analisis/datos.js:18`, `matrizHabilidades`): una fila por cada habilidad practicada con 3 o más respuestas. Tiene 6 columnas:
  - **acierto**: promedio de las últimas respuestas, donde 1 = bien sin pista;
  - **nivel**: la dificultad adaptativa, de 1 a 5;
  - **sesiones**;
  - **días**: días distintos de práctica;
  - **días sin practicar**;
  - **fallos**: los fallos guardados en el repaso.

  Hacen falta al menos 5 habilidades para el mapa.
- **Serie de avance** (`datos.js:32`, `serieAvance`): y(t) = habilidades dominadas acumuladas en el día t.
  - Desde la versión 12 del progreso, cada día guarda `dom` (`src/nucleo/progreso.js:175`) y la serie es exacta.
  - Los días anteriores se aproximan: una habilidad cuenta como dominada desde su segundo día de práctica.
- **Meta**: depende de si hay examen.
  - Con un examen próximo en Mis materias, la meta son las habilidades de sus temas.
  - Si no hay examen, la meta son todas las habilidades de la materia que más se practica.

## Las tres técnicas (y cómo se conectan)

| Técnica | Para qué | Dónde |
|---|---|---|
| **Gauss-Jordan en fracciones exactas** | Resolver las ecuaciones normales XᵀX·β = Xᵀy de la recta de mínimos cuadrados y pronosticar si se llega a la meta el día del examen | `src/nucleo/analisis/algebra.js:84` (`minimosCuadrados`), que usa `src/nucleo/matrices.js:102` (`gaussJordan`) |
| **Rango y kernel** | Si todos los datos son de un solo día, XᵀX tiene rango 1: la recta no queda determinada y su kernel lo explica. También detecta métricas que dicen lo mismo (el valor propio casi 0) | `algebra.js:25` (`gaussJordanNum`, con pivoteo parcial) y `algebra.js:45` (`nucleo`) |
| **PCA** | Mapa de habilidades en 2 ejes. Los ejes son los vectores propios de la matriz de correlación C = ZᵀZ/(n−1) | `algebra.js:69` (`estandarizar`), `algebra.js:76` (`correlacion`), `algebra.js:51` (`jacobi`, rotaciones de Jacobi) y `algebra.js:77` (`pca`) |

**La conexión.** Un vector propio v de C cumple (C − λI)·v = 0, es decir, **v es el kernel de C − λI**. Ese kernel se encuentra con Gauss-Jordan. Así, las tres piezas son la misma herramienta.

En la pantalla, «🔍 Ver el álgebra» del mapa lo muestra paso a paso (`src/nucleo/analisis/vista.js:148`):
1. arma C − λ₁I;
2. la reduce con Gauss-Jordan;
3. da rango 5, con una variable libre;
4. su kernel es exactamente v₁.

Otras partes:
- Los ejes reciben un nombre en palabras: se usan las métricas con peso de 0.4 o más en valor absoluto (`vista.js:57`, `nombreEje`).
- Las cuatro zonas del mapa están en `vista.js:67` (`zonas`).
- El panel del pronóstico está en `vista.js:121`.
- El de «Lo que dicen tus datos» está en `vista.js:161`.

## Datos de ejemplo

El botón «🧪 Ver con datos de ejemplo» carga 12 habilidades y una serie de 14 días (`src/nucleo/analisis/ejemplo.js`). Siempre se muestra la franja «Datos de ejemplo: no es tu progreso».

Con esos datos:
- **Valores propios**: λ = 4.840, 0.968, 0.089, 0.079, 0.020, 0.004.
- **Ejes**: el eje 1 («Dominio») explica el 80.7 % y el eje 2 («Tiempo sin practicar») el 16.1 %.
- **Ecuaciones normales**: [[14, 182 | 61], [182, 3406 | 1120]], que dan β₀ = 151/560 y β₁ = 327/1040.
- **Pronóstico**: en el día 40 llevaría 12.85 (13 de 14) habilidades; necesita 0.42 por día.

## Privacidad

- Nada del análisis se guarda ni se envía: es derivado y se recalcula del progreso.
- Lo único nuevo en el progreso es el número `dom` de cada día. Se sincroniza tomando el máximo entre dispositivos (`src/nucleo/sync/fusionar.js:118`).

## Pruebas

```
npm run analisis
```

Lo que comprueba la parte sin navegador (`scripts/analisis.mjs`):
- **Los números del ejemplo** contra los calculados con numpy: tolerancia de 0.01, y las fracciones exactas.
- **Cada par propio**:
  - ‖Cv − λv‖ < 1e-9;
  - los vectores son ortonormales;
  - Σλ = traza(C) = 6;
  - rango(C − λᵢI) = 5, con kernel ±vᵢ.
- **Jacobi**, en 50 matrices simétricas al azar.
- **Mínimos cuadrados**, contra la fórmula cerrada en 100 series.
- **Casos límite**:
  - el caso singular (un solo día): rango 1, con el kernel (Σt, −n);
  - una columna constante, que se quita;
  - menos de 5 habilidades;
  - la migración del progreso a v12 y la fusión de `dom`.

Lo que comprueba la parte en el navegador:
- **Pantalla en tres tamaños**: teléfono (360 px), Tab S10 y laptop, en modo claro y oscuro.
- **Privacidad**: ver el análisis no guarda nada y no hace peticiones de red.

Las capturas están en esta carpeta: `cerrado-*.png` (resultados) y `abierto-*.png` (con «Ver el álgebra» abierto).
