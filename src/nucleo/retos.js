/* "🎯 Retos y escenarios": ejercicios de APLICACIÓN (problema con contexto) y ESCENARIOS (casos reales e integradores).
   No se gastan (nunca se retiran), varían en cada intento y no entran al repaso diario salvo que el usuario los marque con ⭐
   (ref '<materia>/r/<reto>'). Se abren desde "🎯 Retos y escenarios" en cada materia y tema, o como jefe del tema.
   Reto: {id (único y estable: va en el progreso), materia, tema, titulo, desc, profundidad:'aplicacion'|'escenario', dificultad 1–5,
          crear(rng) → [preguntas] (con contexto)  ó  ir:'<ruta>' (abre una herramienta o pantalla, p. ej. el laboratorio)}
   Sin DOM: npm run revisar comprueba que cada reto genere preguntas válidas y que cada tema completo tenga al menos uno. */
import {crear,BANCOS} from './generadores/index.js';
import {escenarioNegocio,escenarioCohete,escenarioPresa,escenarioCerro,escenarioFiesta} from './generadores/aplicaciones.js';
import {escenarioFabrica} from './generadores/aplicaciones-lineal.js';
import {escenarioApp} from './generadores/escenarios-mat.js';
import {escenarioPrimerDia,escenarioViaje,escenarioPhishing,escenarioPostmortem,escenarioEvaluacion} from './generadores/escenarios-en.js';
import {escenarioReporteVentas,escenarioGastos,escenarioCalificaciones,escenarioInventario} from './generadores/excel-escenarios.js';

const con=(contexto,p)=>p&&{...p,enunciado:`<p class="contexto">${contexto}</p>${p.enunciado}`};
const delGenerador=(id,niveles,contexto)=>rng=>niveles.map(n=>con(typeof contexto==='function'?contexto(rng):contexto,crear(id,n))).filter(Boolean);
// Varias preguntas de distintos generadores [[id, nivel]…], todas con el mismo contexto
const delGenerador2=(lista,contexto)=>()=>lista.map(([id,n])=>con(contexto,crear(id,n))).filter(Boolean);
const delBanco=(id,n)=>rng=>{const l=BANCOS[id]?.()||[];return rng.barajar(l).slice(0,n)};
// Varias preguntas de generadores de aplicación (cada una con su contexto en el enunciado)
const aplicacion=(id,niveles)=>()=>niveles.map(n=>crear(id,n)).filter(Boolean);
// Simulacro de un tema: n preguntas mezcladas de sus generadores, de nivel 2 a 4, sin repetir habilidad seguida
const simulacro=(gens,n=12)=>rng=>{const orden=rng.barajar(gens);return Array.from({length:n},(_,i)=>{const p=crear(orden[i%orden.length],2+(i%3));return p&&{...p,etiqueta:'📝 Simulacro'}}).filter(Boolean)};
const LINEAL=['al/gauss','al/gauss-jordan','al/matriz-producto','al/inversa','al/determinante','al/vector-magnitud','al/vector-operaciones','al/producto-punto','al/angulo','al/producto-cruz','al/rectas-planos','al/combinacion-lineal','al/independencia','al/base-dimension','al/rango','al/transformaciones','al/nucleo-imagen','al/valores-propios','al/diagonalizacion','al/gram-schmidt'];
const DIFERENCIAL=['cd/limites','cd/limites-infinito','cd/continuidad','cd/definicion','cd/derivada-polinomio','cd/producto','cd/cociente','cd/cadena','cd/trascendentes','cd/implicita','cd/inversas-log','cd/razon-cambio','cd/linealizacion','cd/maximos','cd/valor-medio','cd/trazado-curvas','cd/optimizacion','cd/lhopital'];
const INTEGRAL=['ci/antiderivada','ci/riemann','ci/definida','ci/sustitucion','ci/partes','ci/trigonometricas','ci/sustitucion-trig','ci/fracciones-parciales','ci/impropias','ci/area','ci/volumenes','ci/cascarones','ci/longitud-arco','ci/valor-promedio','ci/aplicaciones'];
const TRIGO=['tri/radianes','tri/razones','tri/circulo','tri/graficas','tri/identidades','tri/suma-doble','tri/ecuaciones','tri/leyes'];
const PREALGEBRA=['pre/fracciones','pre/decimales','pre/porcentajes','pre/razones','pre/potencias','pre/operaciones','pre/cientifica'];
const REDES=['red/osi','red/ipv4','red/bases','red/subred','red/mascara','red/prefijo-hosts','red/vlsm','red/ipv6','red/puertos','red/dns','red/dhcp','red/arp'];
const EXCEL=['xl/operadores','xl/referencias','xl/suma-promedio','xl/contar-max-min','xl/redondear','xl/si','xl/y-o','xl/si-anidado','xl/si-error','xl/contar-si','xl/sumar-si','xl/buscarv','xl/buscarx','xl/indice-coincidir','xl/texto','xl/fechas','xl/formato-condicional','xl/tabla-dinamica'];
const PRECALCULO=['alg/funciones','fun/transformaciones','fun/composicion-inversa','fun/polinomiales','fun/racionales','fun/exponenciales','alg/logaritmos','fun/modelado'];
const EN_A1=['en/saludos','en/numeros','en/to-be','en/presente-simple','en/articulos','en/plurales','en/posesivos','en/there-is','en/can','en/preposiciones','en/imperativos','en/familia','en/rutinas','en/casa','en/comida','en/ciudad','en/chunks','en/lecturas-a1','en/escritura-a1'];
const EN_A2=['en/pasado-simple','en/presente-continuo','en/futuro','en/comparativos','en/contables','en/frecuencia','en/should','en/viajes','en/salud','en/trabajo','en/clima','en/experiencias','en/pronunciacion-a2','en/ordenar','en/traducir','en/lecturas-a2','en/escritura-a2'];
const EN_B1=['en/presente-perfecto','en/pasado-continuo','en/condicionales','en/pasiva','en/modales','en/relativas','en/gerundio-infinitivo','en/phrasal-verbs','en/tecnologia','en/medio-ambiente','en/correos','en/historias','en/opinar','en/entrevista','en/lecturas-b1'];
const EN_B2=['en/condicional-3','en/reported-speech','en/pasiva-avanzada','en/deduccion','en/wish','en/conectores','en/collocations','en/ti','en/presentaciones','en/debates','en/audios'];
const EN_EXAMENES=['en/prueba-nivel','en/simulacro-a2','en/simulacro-b1','en/simulacro-b2'];
const ALGEBRA=['alg/expresiones','alg/productos-notables','alg/factorizacion','alg/fracciones-algebraicas','alg/ecuacion-lineal','alg/cuadratica','alg/radicales-absoluto','alg/desigualdad','alg/desigualdad-no-lineal','alg/sistema-2x2','alg/sistema-3x3','alg/exponentes'];

export const RETOS=[
  // ---------- Ciberseguridad ----------
  {id:'ciber-subredes-empresa',materia:'ciberseguridad',tema:'redes-y-protocolos',titulo:'Direccionar la red de una empresa',profundidad:'aplicacion',dificultad:3,
   desc:'Te dan el número de equipos por área: elige prefijos y calcula red, broadcast y hosts.',
   crear:rng=>{const area=rng.elegir(['ventas','soporte','contabilidad','desarrollo']);
     return [...delGenerador('red/prefijo-hosts',[3,4],`Una empresa abre una sucursal: el área de ${area} y la red de invitados necesitan su propia subred.`)(rng),
       ...delGenerador('red/subred',[4,5],'Ya asignaste los prefijos; ahora verifica las direcciones de cada subred.')(rng)]}},
  {id:'ciber-vlsm-campus',materia:'ciberseguridad',tema:'redes-y-protocolos',titulo:'Reparte la red de un campus con VLSM',profundidad:'aplicacion',dificultad:4,
   desc:'Laboratorios, oficinas y enlaces de distintos tamaños en una sola /24.',crear:delGenerador('red/vlsm',[2,3,4,5],'El campus tiene una sola red /24 y varias áreas de distinto tamaño.')},
  {id:'ciber-sin-internet',materia:'ciberseguridad',tema:'redes-y-protocolos',titulo:'"No tengo internet": diagnóstico',profundidad:'escenario',dificultad:3,
   desc:'Un usuario no navega: revisa capa por capa, DHCP, ARP y DNS.',
   crear:rng=>[...delGenerador('red/osi',[4],'Mesa de ayuda: un usuario dice que "no tiene internet". Empieza por ubicar la capa.')(rng),
     ...delGenerador('red/ipv4',[1],'Su equipo muestra una dirección 169.254.x.x: revisa qué significa.')(rng),
     ...delGenerador('red/dhcp',[3],'Sospechas del servidor DHCP de la oficina.')(rng),
     ...delGenerador('red/arp',[3],'Revisas la tabla ARP del equipo por si hay algo raro.')(rng),
     ...delGenerador('red/dns',[3],'Ya tiene IP, pero los nombres no resuelven bien.')(rng)]},
  {id:'ciber-simulacro-redes',materia:'ciberseguridad',tema:'redes-y-protocolos',titulo:'Simulacro de Fundamentos de redes',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema.',crear:simulacro(REDES)},
  {id:'ciber-auditar-politica',materia:'ciberseguridad',tema:'firewalls',titulo:'Auditar una política de firewall',profundidad:'aplicacion',dificultad:3,
   desc:'Para cada paquete, decide qué regla se aplica: primera coincidencia y deny implícito.',
   crear:delGenerador('fw/reglas',[4,5,5],'Auditoría: el equipo de seguridad te pide comprobar qué hace la política con el tráfico real de hoy.')},
  {id:'ciber-simulador-fw',materia:'ciberseguridad',tema:'firewalls',titulo:'Simulador de políticas',profundidad:'escenario',dificultad:3,desc:'Arma reglas y mira qué pasa con cada paquete.',ir:'cursos/ciberseguridad/fw'},
  {id:'ciber-vpn-diagnostico',materia:'ciberseguridad',tema:'vpn-cripto',titulo:'¿Por qué no levanta el túnel?',profundidad:'aplicacion',dificultad:3,
   desc:'Compara la configuración de las dos sedes y encuentra en qué fase falla.',crear:delGenerador('vpn/fases',[3,4,5],'Mesa de ayuda: la VPN entre la oficina central y la sucursal no conecta.')},
  {id:'ciber-vpn-sedes',materia:'ciberseguridad',tema:'vpn-cripto',titulo:'Configurar una VPN entre sedes',profundidad:'escenario',dificultad:4,desc:'Simulador de VPN IPsec sitio a sitio.',ir:'cursos/ciberseguridad/vpn'},
  {id:'ciber-logs',materia:'ciberseguridad',tema:'defensa',titulo:'Turno en el SOC: lee los registros',profundidad:'aplicacion',dificultad:3,
   desc:'Encuentra el patrón en cada registro y decide qué hacer.',crear:delGenerador('def/logs',[3,4,5],'Estás de turno en el centro de operaciones de seguridad (SOC).')},
  {id:'ciber-incidentes-caso',materia:'ciberseguridad',tema:'defensa',titulo:'Casos de incidentes',profundidad:'escenario',dificultad:4,desc:'Diagnostica y responde casos reales (siempre defensivo).',crear:delBanco('ciber/incidentes',3)},
  {id:'ciber-laboratorio',materia:'ciberseguridad',tema:'defensa',titulo:'Laboratorio de incidentes',profundidad:'escenario',dificultad:4,desc:'Casos completos con evidencia, diagnóstico y respuesta.',ir:'cursos/ciberseguridad/incidentes'},
  // ---------- Curso de Excel ----------
  {id:'xl-captura',materia:'excel',tema:'interfaz',titulo:'Revisa una hoja de captura',profundidad:'aplicacion',dificultad:2,
   desc:'Rangos, tipos de datos y formatos de una hoja que te pasaron.',crear:delGenerador2([['xl/celdas',5],['xl/tipos-datos',4],['xl/formato',4],['xl/formato',5]],'Te pasan una hoja de captura y tienes que revisarla antes de usarla.')},
  {id:'xl-cotizacion',materia:'excel',tema:'formulas',titulo:'Arma una cotización',profundidad:'aplicacion',dificultad:3,
   desc:'Totales, IVA, descuentos y un tipo de cambio fijo con $.',crear:delGenerador2([['xl/operadores',2],['xl/operadores',3],['xl/referencias',3],['xl/referencias',5]],'Un cliente pide una cotización: arma las fórmulas para que se puedan copiar.')},
  {id:'xl-resumen-grupo',materia:'excel',tema:'resumen',titulo:'Resumen de un grupo',profundidad:'aplicacion',dificultad:2,
   desc:'Totales, promedios, cuántos entregaron, el más alto y el más bajo.',crear:delGenerador2([['xl/suma-promedio',3],['xl/suma-promedio',4],['xl/contar-max-min',3],['xl/contar-max-min',5]],'La coordinación pide el resumen de calificaciones del grupo.')},
  {id:'xl-reglas-negocio',materia:'excel',tema:'logica',titulo:'Reglas de la empresa',profundidad:'aplicacion',dificultad:3,
   desc:'Descuentos por volumen, comisiones por tramos y alertas, sin errores en pantalla.',crear:delGenerador2([['xl/si',4],['xl/y-o',4],['xl/si-anidado',4],['xl/si-error',2]],'Recursos humanos y ventas te dan sus reglas para automatizarlas.')},
  {id:'xl-tablero-region',materia:'excel',tema:'condicionales',titulo:'Tablero por región',profundidad:'aplicacion',dificultad:3,
   desc:'Cuántas ventas y cuántas unidades por región y por condición.',crear:delGenerador2([['xl/contar-si',3],['xl/contar-si',5],['xl/sumar-si',3],['xl/sumar-si',4]],'Arma el tablero semanal de ventas por región.')},
  {id:'xl-catalogo',materia:'excel',tema:'busqueda',titulo:'Consulta el catálogo',profundidad:'aplicacion',dificultad:3,
   desc:'Busca datos por nombre o código con BUSCARV, BUSCARX e INDICE + COINCIDIR.',crear:delGenerador2([['xl/buscarv',3],['xl/buscarx',3],['xl/indice-coincidir',4],['xl/indice-coincidir',5]],'Atención a clientes necesita consultar datos rápido.')},
  {id:'xl-limpiar-base',materia:'excel',tema:'texto-fechas',titulo:'Limpia una base de clientes',profundidad:'aplicacion',dificultad:3,
   desc:'Nombres, códigos y antigüedad listos para un reporte.',crear:delGenerador2([['xl/texto',3],['xl/texto',5],['xl/fechas',2],['xl/fechas',4]],'La base de datos llegó desordenada: déjala lista para el reporte.')},
  {id:'xl-depurar',materia:'excel',tema:'organizar-datos',titulo:'Depura el inventario',profundidad:'aplicacion',dificultad:3,
   desc:'Ordena, filtra, resalta lo urgente y valida lo que se captura.',crear:delGenerador2([['xl/ordenar-filtrar',4],['xl/ordenar-filtrar',5],['xl/formato-condicional',3],['xl/validacion',4]],'Antes de la junta, deja el inventario fácil de leer.')},
  {id:'xl-pivote-ventas',materia:'excel',tema:'dinamicas',titulo:'Resume las ventas con una tabla dinámica',profundidad:'aplicacion',dificultad:3,
   desc:'Suma, cuenta, cruces y filtros sobre las ventas del trimestre.',crear:delGenerador2([['xl/tabla-dinamica',3],['xl/tabla-dinamica',4],['xl/tabla-dinamica',5]],'Dirección quiere las ventas del trimestre resumidas.')},
  {id:'xl-simulador-dinamica',materia:'excel',tema:'dinamicas',titulo:'Simulador de tabla dinámica',profundidad:'escenario',dificultad:2,desc:'Arma tu propia tabla dinámica.',ir:'cursos/excel/dinamica'},
  {id:'xl-graficos-reporte',materia:'excel',tema:'graficos',titulo:'Gráficos para un reporte',profundidad:'aplicacion',dificultad:2,
   desc:'Elige el gráfico correcto para cada pregunta y detecta los engañosos.',crear:delGenerador2([['xl/graficos',2],['xl/graficos',3],['xl/graficos',4]],'Preparas las gráficas del informe mensual.')},
  {id:'xl-atajos-dia',materia:'excel',tema:'atajos-teclado',titulo:'Un día con atajos',profundidad:'aplicacion',dificultad:2,
   desc:'Secuencias de atajos para tareas comunes.',crear:delGenerador2([['xl/atajos',3],['xl/atajos',4],['xl/atajos',5]],'Quieres terminar tu reporte sin tocar el mouse.')},
  {id:'xl-reporte-ventas',materia:'excel',tema:'escenarios',titulo:'Reporte de ventas',profundidad:'escenario',dificultad:4,desc:'Totales, ventas por región, el mejor vendedor y quién superó el promedio: 4 fórmulas.',crear:escenarioReporteVentas},
  {id:'xl-gastos',materia:'excel',tema:'escenarios',titulo:'Control de gastos personales',profundidad:'escenario',dificultad:3,desc:'Total, por categoría, alerta de presupuesto y % de renta: 4 fórmulas.',crear:escenarioGastos},
  {id:'xl-calificaciones',materia:'excel',tema:'escenarios',titulo:'Calificaciones de un grupo',profundidad:'escenario',dificultad:3,desc:'Promedios, estado, aprobados y mejor alumno: 4 fórmulas.',crear:escenarioCalificaciones},
  {id:'xl-inventario',materia:'excel',tema:'escenarios',titulo:'Inventario con alertas',profundidad:'escenario',dificultad:3,desc:'Alertas, cuánto pedir, cuántos pedir y existencias por categoría: 4 fórmulas.',crear:escenarioInventario},
  {id:'xl-simulacro',materia:'excel',tema:'escenarios',titulo:'Simulacro de Excel',profundidad:'escenario',dificultad:3,simulacro:true,desc:'12 fórmulas mezcladas de todo el curso.',crear:simulacro(EXCEL)},
  // ---------- Matemáticas · Aritmética y prealgebra ----------
  {id:'mat-compras',materia:'matematicas',tema:'prealgebra',titulo:'De compras: ofertas, recetas y cuentas',profundidad:'aplicacion',dificultad:2,
   desc:'Ofertas 3×2 contra descuentos, recetas a escala y la cuenta con IVA y propina.',crear:aplicacion('apl/compras',[1,3,5])},
  {id:'mat-descuentos',materia:'matematicas',tema:'prealgebra',titulo:'Descuentos, aumentos e intereses',profundidad:'aplicacion',dificultad:2,
   desc:'Porcentajes de la vida diaria.',crear:aplicacion('pre/porcentajes',[2,3,4,5])},
  {id:'mat-ciencia-numeros',materia:'matematicas',tema:'prealgebra',titulo:'Números enormes y diminutos',profundidad:'aplicacion',dificultad:3,
   desc:'La luz, los átomos y las distancias con notación científica.',crear:aplicacion('pre/cientifica',[3,4,5])},
  {id:'mat-fiesta',materia:'matematicas',tema:'prealgebra',titulo:'Organiza la fiesta',profundidad:'escenario',dificultad:2,
   desc:'Pizzas, refrescos, descuento y cuánto pone cada quien: 4 preguntas.',crear:escenarioFiesta},
  {id:'mat-simulacro-prealgebra',materia:'matematicas',tema:'prealgebra',titulo:'Simulacro de Aritmética y prealgebra',profundidad:'escenario',dificultad:2,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema.',crear:simulacro(PREALGEBRA)},
  // ---------- Matemáticas · Precálculo ----------
  {id:'mat-modelos',materia:'matematicas',tema:'precalculo',titulo:'Modelos del mundo real',profundidad:'aplicacion',dificultad:3,
   desc:'Ajusta funciones lineales, cuadráticas y exponenciales a datos reales.',crear:aplicacion('fun/modelado',[3,4,5])},
  {id:'mat-app',materia:'matematicas',tema:'precalculo',titulo:'Tu app de suscripción',profundidad:'escenario',dificultad:3,
   desc:'Crecimiento exponencial, equilibrio, composición y logaritmos: un caso en 4 preguntas.',crear:escenarioApp},
  {id:'mat-simulacro-precalculo',materia:'matematicas',tema:'precalculo',titulo:'Simulacro de Precálculo',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema, como un examen.',crear:simulacro(PRECALCULO)},
  // ---------- Matemáticas · Trigonometría ----------
  {id:'mat-alturas',materia:'matematicas',tema:'trigonometria',titulo:'Edificios, rampas y escaleras',profundidad:'aplicacion',dificultad:2,
   desc:'Alturas y distancias con seno, coseno y tangente.',crear:aplicacion('apl/triangulos',[1,2,3])},
  {id:'mat-angulos',materia:'matematicas',tema:'trigonometria',titulo:'¿Qué ángulo es?',profundidad:'aplicacion',dificultad:3,
   desc:'Ángulos de rampas y elevaciones a partir de medidas.',crear:aplicacion('apl/triangulos',[4,5,5])},
  {id:'mat-razones-reales',materia:'matematicas',tema:'trigonometria',titulo:'Triángulos del mundo real',profundidad:'aplicacion',dificultad:3,
   desc:'Árboles, rampas y sombras resueltos con razones trigonométricas.',crear:aplicacion('tri/razones',[2,3,4])},
  {id:'mat-cerro',materia:'matematicas',tema:'trigonometria',titulo:'Mide un cerro sin subirlo',profundidad:'escenario',dificultad:4,
   desc:'Dos ángulos de elevación y una caminata: 3 preguntas.',crear:escenarioCerro},
  {id:'mat-simulacro-trigo',materia:'matematicas',tema:'trigonometria',titulo:'Simulacro de Trigonometría',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema.',crear:simulacro(TRIGO)},
  // ---------- Matemáticas · Álgebra ----------
  {id:'mat-planes',materia:'matematicas',tema:'algebra-basica',titulo:'¿Qué plan me conviene?',profundidad:'aplicacion',dificultad:2,
   desc:'Celular, gimnasio o taxi: costo fijo + precio por uso. Encuentra dónde conviene cada uno.',crear:aplicacion('apl/planes',[1,2,3,5])},
  {id:'mat-boletos',materia:'matematicas',tema:'algebra-basica',titulo:'Boletos, cafés y monedas',profundidad:'aplicacion',dificultad:3,
   desc:'Problemas de dos incógnitas que se resuelven con un sistema 2×2.',crear:aplicacion('apl/boletos',[1,3,5])},
  {id:'mat-areas',materia:'matematicas',tema:'algebra-basica',titulo:'Terrenos, marcos y pelotas',profundidad:'aplicacion',dificultad:3,
   desc:'Áreas y lanzamientos que llevan a una ecuación cuadrática.',crear:aplicacion('apl/areas',[2,3,5])},
  {id:'mat-crecimiento',materia:'matematicas',tema:'algebra-basica',titulo:'Bacterias, intereses y depreciación',profundidad:'aplicacion',dificultad:4,
   desc:'Crecimiento y decrecimiento exponencial; logaritmos para despejar el tiempo.',crear:aplicacion('apl/crecimiento',[1,3,4,5])},
  {id:'mat-negocio',materia:'matematicas',tema:'algebra-basica',titulo:'Tu propio negocio',profundidad:'escenario',dificultad:3,
   desc:'Costos, ganancia, punto de equilibrio y meta del mes: un caso completo en 4 preguntas.',crear:escenarioNegocio},
  {id:'mat-simulacro-algebra',materia:'matematicas',tema:'algebra-basica',titulo:'Simulacro de Álgebra',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema, como un examen.',crear:simulacro(ALGEBRA)},
  // ---------- Matemáticas · Álgebra lineal ----------
  {id:'mat-mezclas',materia:'matematicas',tema:'algebra-lineal',titulo:'Dietas, mezclas y recursos',profundidad:'aplicacion',dificultad:3,
   desc:'Tablas de aportes que se vuelven un sistema 3×3.',crear:aplicacion('apl/mezclas',[1,3,5])},
  {id:'mat-markov',materia:'matematicas',tema:'algebra-lineal',titulo:'¿Quién se muda? Cadenas de Markov',profundidad:'aplicacion',dificultad:4,
   desc:'Matriz de transición por vector: el futuro y el estado estable.',crear:aplicacion('apl/markov',[1,3,5])},
  {id:'mat-graficos',materia:'matematicas',tema:'algebra-lineal',titulo:'Gráficos de videojuegos y apps',profundidad:'aplicacion',dificultad:2,
   desc:'Escalar, rotar y reflejar con matrices; el determinante y el área.',crear:aplicacion('apl/graficos',[1,3,4])},
  {id:'mat-fabrica',materia:'matematicas',tema:'algebra-lineal',titulo:'La fábrica de muebles',profundidad:'escenario',dificultad:3,
   desc:'Recursos, costos, ganancia y producción con matrices: un caso en 4 preguntas.',crear:escenarioFabrica},
  {id:'mat-simulacro-lineal',materia:'matematicas',tema:'algebra-lineal',titulo:'Simulacro de Álgebra lineal',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema, como un examen.',crear:simulacro(LINEAL)},
  // ---------- Matemáticas · Cálculo diferencial ----------
  {id:'mat-optimizar',materia:'matematicas',tema:'calculo-diferencial',titulo:'Optimiza: cercas, cajas y ganancias',profundidad:'aplicacion',dificultad:3,
   desc:'Problemas reales de máximo y mínimo resueltos con la derivada.',crear:aplicacion('cd/optimizacion',[2,3,4,5])},
  {id:'mat-razones',materia:'matematicas',tema:'calculo-diferencial',titulo:'Globos, escaleras y conos',profundidad:'aplicacion',dificultad:4,
   desc:'Razones de cambio relacionadas: cómo cambia una cosa cuando cambia otra.',crear:aplicacion('cd/razon-cambio',[2,3,4,5])},
  {id:'mat-movimiento',materia:'matematicas',tema:'calculo-diferencial',titulo:'Pelotas, autos y cohetes',profundidad:'aplicacion',dificultad:2,
   desc:'Velocidad, aceleración, cuándo se detiene y altura máxima.',crear:aplicacion('apl/movimiento',[1,2,3,4])},
  {id:'mat-cohete',materia:'matematicas',tema:'calculo-diferencial',titulo:'El cohete de agua',profundidad:'escenario',dificultad:3,
   desc:'Un lanzamiento completo en 4 preguntas: velocidad, cima, altura máxima y caída.',crear:escenarioCohete},
  {id:'mat-simulacro-diferencial',materia:'matematicas',tema:'calculo-diferencial',titulo:'Simulacro de Cálculo diferencial',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema, como un examen.',crear:simulacro(DIFERENCIAL)},
  // ---------- Matemáticas · Cálculo integral ----------
  {id:'mat-acumulacion',materia:'matematicas',tema:'calculo-integral',titulo:'Distancias, tanques y costos',profundidad:'aplicacion',dificultad:2,
   desc:'La integral como total acumulado: de la velocidad a la distancia, del caudal a los litros.',crear:aplicacion('apl/acumulacion',[1,2,3,4])},
  {id:'mat-volumenes',materia:'matematicas',tema:'calculo-integral',titulo:'Sólidos que giran',profundidad:'aplicacion',dificultad:3,
   desc:'Volúmenes de conos, esferas y vasijas con discos, arandelas y casquetes.',crear:aplicacion('ci/volumenes',[1,2,3,4])},
  {id:'mat-areas-integral',materia:'matematicas',tema:'calculo-integral',titulo:'Áreas entre curvas',profundidad:'aplicacion',dificultad:3,
   desc:'Regiones encerradas por dos curvas o que cruzan el eje.',crear:aplicacion('ci/area',[3,4,5])},
  {id:'mat-presa',materia:'matematicas',tema:'calculo-integral',titulo:'La presa en temporada de lluvias',profundidad:'escenario',dificultad:3,
   desc:'Entrada, salida y agua acumulada en 3 preguntas.',crear:escenarioPresa},
  {id:'mat-simulacro-integral',materia:'matematicas',tema:'calculo-integral',titulo:'Simulacro de Cálculo integral',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el tema, como un examen.',crear:simulacro(INTEGRAL)},
  // ---------- Inglés · A1 ----------
  {id:'en-primer-dia',materia:'ingles',tema:'a1',titulo:'Tu primer día en la oficina',profundidad:'escenario',dificultad:2,
   desc:'Presentarte, preguntar dónde están las cosas, pedir en la cafetería y despedirte: 4 pasos.',crear:escenarioPrimerDia},
  {id:'en-simulacro-a1',materia:'ingles',tema:'a1',titulo:'Simulacro A1',profundidad:'escenario',dificultad:2,simulacro:true,
   desc:'12 preguntas mezcladas de todo el nivel A1, como un examen.',crear:simulacro(EN_A1)},
  // ---------- Inglés · A2 ----------
  {id:'en-viaje',materia:'ingles',tema:'a2',titulo:'Viaje de trabajo',profundidad:'escenario',dificultad:3,
   desc:'Vuelo retrasado, aviso al cliente, hotel y contar cómo te fue: 4 pasos.',crear:escenarioViaje},
  {id:'en-simulacro-a2',materia:'ingles',tema:'a2',titulo:'Simulacro A2',profundidad:'escenario',dificultad:3,simulacro:true,
   desc:'12 preguntas mezcladas de todo el nivel A2, como un examen.',crear:simulacro(EN_A2)},
  // ---------- Inglés · B1 ----------
  {id:'en-phishing',materia:'ingles',tema:'b1',titulo:'Aviso de phishing en tu empresa',profundidad:'escenario',dificultad:4,
   desc:'Reporte en pasiva, una regla, un condicional y el cierre de un correo formal: 4 pasos.',crear:escenarioPhishing},
  {id:'en-simulacro-b1',materia:'ingles',tema:'b1',titulo:'Simulacro B1',profundidad:'escenario',dificultad:4,simulacro:true,
   desc:'12 preguntas mezcladas de todo el nivel B1, como un examen.',crear:simulacro(EN_B1)},
  // ---------- Inglés · B2 ----------
  {id:'en-postmortem',materia:'ingles',tema:'b2',titulo:'Presenta la revisión de un incidente',profundidad:'escenario',dificultad:5,
   desc:'Apertura, reported speech, tercer condicional y conectores en una presentación: 4 pasos.',crear:escenarioPostmortem},
  {id:'en-simulacro-b2',materia:'ingles',tema:'b2',titulo:'Simulacro B2',profundidad:'escenario',dificultad:5,simulacro:true,
   desc:'12 preguntas mezcladas de todo el nivel B2, como un examen.',crear:simulacro(EN_B2)},
  // ---------- Inglés · Prueba de nivel y simulacros ----------
  {id:'en-evaluacion',materia:'ingles',tema:'examenes',titulo:'Evaluación de inglés en tu trabajo',profundidad:'escenario',dificultad:4,
   desc:'Una tarea de cada nivel, de A2 a B2: correo, opinión, transformación y deducción.',crear:escenarioEvaluacion},
  {id:'en-simulacro-examenes',materia:'ingles',tema:'examenes',titulo:'Simulacro general A1–B2',profundidad:'escenario',dificultad:4,simulacro:true,
   desc:'12 preguntas de todos los niveles mezcladas, como un examen (no oficial).',crear:simulacro(EN_EXAMENES)},
  // ---------- Inglés: los jefes de cada unidad son escenarios (una tarea real en inglés) ----------
  ...[['presentarte','Presentarte en una reunión'],['rutina-trabajo','Contar tu rutina de trabajo'],['pedir-comprar','Pedir y comprar'],['ciudad-viajes','Moverte en otra ciudad'],
    ['contar-pasado','Contar lo que pasó'],['trabajo-ti','Una conversación de trabajo en TI']].map(([u,t],i)=>
    ({id:`en-jefe-${u}`,materia:'ingles',tema:'hablar-escuchar',titulo:t,profundidad:'escenario',dificultad:Math.min(5,1+Math.floor(i/1.5)),desc:'El jefe de la unidad: una tarea real hablando en inglés.',ir:`estudio/ingles/hablar/u/${u}`})),
  {id:'en-conversacion-ia',materia:'ingles',tema:'hablar-escuchar',titulo:'Conversación libre con IA',profundidad:'escenario',dificultad:4,desc:'Habla de lo que quieras (necesita tu clave de IA).',ir:'estudio/ingles/hablar/ia'}
].filter(r=>r.ir||r.crear);

export const reto=id=>RETOS.find(r=>r.id===id)||null;
export const retosDe=(materia,tema)=>RETOS.filter(r=>r.materia===materia&&(!tema||r.tema===tema));
