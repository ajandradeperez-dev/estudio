/* "🎯 Retos y escenarios": ejercicios de APLICACIÓN (problema con contexto) y ESCENARIOS (casos reales e integradores).
   No se gastan (nunca se retiran), varían en cada intento y no entran al repaso diario salvo que el usuario los marque con ⭐
   (ref '<materia>/r/<reto>'). Se abren desde "🎯 Retos y escenarios" en cada materia y tema, o como jefe del tema.
   Reto: {id (único y estable: va en el progreso), materia, tema, titulo, desc, profundidad:'aplicacion'|'escenario', dificultad 1–5,
          crear(rng) → [preguntas] (con contexto)  ó  ir:'<ruta>' (abre una herramienta o pantalla, p. ej. el laboratorio)}
   Sin DOM: npm run revisar comprueba que cada reto genere preguntas válidas y que cada tema completo tenga al menos uno. */
import {crear,BANCOS} from './generadores/index.js';
import {escenarioNegocio,escenarioCohete,escenarioPresa,escenarioCerro,escenarioFiesta} from './generadores/aplicaciones.js';
import {escenarioFabrica} from './generadores/aplicaciones-lineal.js';

const con=(contexto,p)=>p&&{...p,enunciado:`<p class="contexto">${contexto}</p>${p.enunciado}`};
const delGenerador=(id,niveles,contexto)=>rng=>niveles.map(n=>con(typeof contexto==='function'?contexto(rng):contexto,crear(id,n))).filter(Boolean);
const delBanco=(id,n)=>rng=>{const l=BANCOS[id]?.()||[];return rng.barajar(l).slice(0,n)};
// Varias preguntas de generadores de aplicación (cada una con su contexto en el enunciado)
const aplicacion=(id,niveles)=>()=>niveles.map(n=>crear(id,n)).filter(Boolean);
// Simulacro de un tema: n preguntas mezcladas de sus generadores, de nivel 2 a 4, sin repetir habilidad seguida
const simulacro=(gens,n=12)=>rng=>{const orden=rng.barajar(gens);return Array.from({length:n},(_,i)=>{const p=crear(orden[i%orden.length],2+(i%3));return p&&{...p,etiqueta:'📝 Simulacro'}}).filter(Boolean)};
const LINEAL=['al/vector-magnitud','al/vector-operaciones','al/producto-punto','al/angulo','al/producto-cruz','al/matriz-producto','al/gauss','al/gauss-jordan','al/determinante','al/inversa','al/combinacion-lineal','al/independencia','al/transformaciones','al/valores-propios'];
const DIFERENCIAL=['cd/limites','cd/continuidad','cd/definicion','cd/derivada-polinomio','cd/producto','cd/cociente','cd/cadena','cd/trascendentes','cd/implicita','cd/maximos','cd/optimizacion','cd/razon-cambio','cd/lhopital'];
const INTEGRAL=['ci/antiderivada','ci/definida','ci/sustitucion','ci/partes','ci/fracciones-parciales','ci/sustitucion-trig','ci/area','ci/volumenes','ci/impropias'];
const TRIGO=['tri/razones','tri/circulo','tri/identidades','tri/ecuaciones'];
const PREALGEBRA=['pre/fracciones','pre/porcentajes','pre/potencias','pre/operaciones','pre/cientifica'];
const REDES=['red/osi','red/ipv4','red/bases','red/subred','red/mascara','red/prefijo-hosts','red/vlsm','red/ipv6','red/puertos','red/dns','red/dhcp','red/arp'];
const ALGEBRA=['alg/expresiones','alg/ecuacion-lineal','alg/desigualdad','alg/sistema-2x2','alg/sistema-3x3','alg/productos-notables','alg/factorizacion','alg/fracciones-algebraicas','alg/cuadratica','alg/exponentes','alg/logaritmos','alg/funciones'];

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
  // ---------- Inglés: los jefes de cada unidad son escenarios (una tarea real en inglés) ----------
  ...[['presentarte','Presentarte en una reunión'],['rutina-trabajo','Contar tu rutina de trabajo'],['pedir-comprar','Pedir y comprar'],['ciudad-viajes','Moverte en otra ciudad'],
    ['contar-pasado','Contar lo que pasó'],['trabajo-ti','Una conversación de trabajo en TI']].map(([u,t],i)=>
    ({id:`en-jefe-${u}`,materia:'ingles',tema:'hablar-escuchar',titulo:t,profundidad:'escenario',dificultad:Math.min(5,1+Math.floor(i/1.5)),desc:'El jefe de la unidad: una tarea real hablando en inglés.',ir:`estudio/ingles/hablar/u/${u}`})),
  {id:'en-conversacion-ia',materia:'ingles',tema:'hablar-escuchar',titulo:'Conversación libre con IA',profundidad:'escenario',dificultad:4,desc:'Habla de lo que quieras (necesita tu clave de IA).',ir:'estudio/ingles/hablar/ia'}
].filter(r=>r.ir||r.crear);

export const reto=id=>RETOS.find(r=>r.id===id)||null;
export const retosDe=(materia,tema)=>RETOS.filter(r=>r.materia===materia&&(!tema||r.tema===tema));
