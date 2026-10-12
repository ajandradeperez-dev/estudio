# CiberLab

## Idioma

**Responde siempre en español**, también en explicaciones, mensajes de commit y comentarios de código. Los textos de la app están en español neutro (orientado a Latinoamérica); mantén ese tono.

## Qué es

App educativa de seguridad de redes. Todo es simulado en el navegador (paquetes, firewalls, registros); no hay backend ni llamadas a equipos reales. Secciones:

| Clave (`data-s` / `#hash`) | Sección | Archivo |
|---|---|---|
| `inicio` | Portada con tarjetas a cada sección | `src/secciones/inicio.js` |
| `redes` | Modelo OSI, puertos comunes, stateful | `src/secciones/redes.js` |
| `subred` | Calculadora de subredes CIDR | `src/secciones/subredes.js` |
| `fw` | Simulador de políticas: tabla ordenable, alta de reglas, paquete de prueba y CLI en FortiGate / Palo Alto / Cisco ASA / pfSense | `src/secciones/firewall.js` |
| `marcas` | Tabla comparativa de conceptos entre fabricantes | `src/secciones/marcas.js` |
| `forti` | FortiGate a fondo (políticas, NAT/VIP, VPN, perfiles, diagnóstico) | `src/secciones/fortigate.js` |
| `incidentes` | Laboratorio de incidentes: leer logs, identificar el ataque y elegir la defensa | `src/secciones/incidentes.js` |
| `quiz` | Examen rápido | `src/secciones/examen.js` |

Las claves son internas y no deben cambiar: se usan en el menú, en el `#hash` de la URL y en `localStorage` (`ciberlab-s`, última sección visitada).

## Estructura

```
index.html            Esqueleto: <head>, menú lateral (#nav) y <main id="main">
src/
  main.js             Registro de secciones, navegación (go) y delegación de eventos
  estilos.css         Todo el CSS (variables en :root, modo oscuro, responsive a 760px)
  utilidades.js       $, esc (escapar HTML) y utilidades IP: ip2n, n2ip, mask, inNet
  secciones/          Una sección por archivo
  datos/
    politicas.js      Servicios, políticas iniciales, marcas y paquetes de ejemplo
    incidentes.js     Casos del laboratorio de incidentes
    preguntas.js      Preguntas del examen
    fortigate.js      Temas y ejemplos de CLI de "FortiGate a fondo"
```

## Cómo funciona una sección

Cada módulo de `src/secciones/` exporta:

- `vista()` → devuelve el HTML de la sección como string (se asigna a `#main.innerHTML`).
- `alMostrar()` (opcional) → se llama después de pintar; p. ej. el simulador dibuja la tabla y la calculadora calcula el valor inicial.
- `alClic(t, ir)` (opcional) → recibe el elemento clicado (`button`, `[data-go]` o `tr[data-pid]`) y la función `ir(clave)` para volver a renderizar o cambiar de sección.

`main.js` tiene un único listener de clic sobre `#main` y lo reenvía a la sección activa. El estado (políticas, marca elegida, pregunta actual, caso de incidente…) vive en variables de cada módulo y se pierde al recargar la página, igual que en la versión original de un solo archivo.

Para agregar una sección: crea el módulo, impórtalo y regístralo en el objeto `S` de `main.js`, y añade su botón `data-s` en `index.html`.

## Convenciones

- JavaScript puro con módulos ES, sin frameworks ni dependencias de runtime; Vite solo para desarrollo y build.
- Estilo compacto heredado del original: plantillas con template strings y `.map(...).join('')`.
- Todo texto que venga del usuario se pasa por `esc()` antes de meterlo en HTML.
- Los colores siempre salen de las variables CSS (`--accent`, `--ok`, `--bad`…) para que funcione el modo oscuro.
- El laboratorio de incidentes es **defensivo**: identificar ataques y elegir respuestas, nunca enseñar a ejecutarlos.

## Comandos

```
npm install       # primera vez
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # genera dist/
npm run preview   # sirve dist/ para probar el build
```
