/* "🎯 Retos y escenarios": ejercicios de APLICACIÓN (problema con contexto) y ESCENARIOS (casos reales e integradores).
   No se gastan (nunca se retiran), varían en cada intento y no entran al repaso diario salvo que el usuario los marque con ⭐
   (ref '<materia>/r/<reto>'). Se abren desde "🎯 Retos y escenarios" en cada materia y tema, o como jefe del tema.
   Reto: {id (único y estable: va en el progreso), materia, tema, titulo, desc, profundidad:'aplicacion'|'escenario', dificultad 1–5,
          crear(rng) → [preguntas] (con contexto)  ó  ir:'<ruta>' (abre una herramienta o pantalla, p. ej. el laboratorio)}
   Sin DOM: npm run revisar comprueba que cada reto genere preguntas válidas y que cada tema completo tenga al menos uno. */
import {crear,BANCOS} from './generadores/index.js';

const con=(contexto,p)=>p&&{...p,enunciado:`<p class="contexto">${contexto}</p>${p.enunciado}`};
const delGenerador=(id,niveles,contexto)=>rng=>niveles.map(n=>con(typeof contexto==='function'?contexto(rng):contexto,crear(id,n))).filter(Boolean);
const delBanco=(id,n)=>rng=>{const l=BANCOS[id]?.()||[];return rng.barajar(l).slice(0,n)};

export const RETOS=[
  // ---------- Ciberseguridad ----------
  {id:'ciber-subredes-empresa',materia:'ciberseguridad',tema:'redes-y-protocolos',titulo:'Direccionar la red de una empresa',profundidad:'aplicacion',dificultad:3,
   desc:'Te dan el número de equipos por área: elige prefijos y calcula red, broadcast y hosts.',
   crear:rng=>{const area=rng.elegir(['ventas','soporte','contabilidad','desarrollo']);
     return [...delGenerador('red/prefijo-hosts',[3,4],`Una empresa abre una sucursal: el área de ${area} y la red de invitados necesitan su propia subred.`)(rng),
       ...delGenerador('red/subred',[4,5],'Ya asignaste los prefijos; ahora verifica las direcciones de cada subred.')(rng)]}},
  {id:'ciber-auditar-politica',materia:'ciberseguridad',tema:'firewalls',titulo:'Auditar una política de firewall',profundidad:'aplicacion',dificultad:3,
   desc:'Para cada paquete, decide qué regla se aplica: primera coincidencia y deny implícito.',
   crear:delGenerador('fw/reglas',[4,5,5],'Auditoría: el equipo de seguridad te pide comprobar qué hace la política con el tráfico real de hoy.')},
  {id:'ciber-simulador-fw',materia:'ciberseguridad',tema:'firewalls',titulo:'Simulador de políticas',profundidad:'escenario',dificultad:3,desc:'Arma reglas y mira qué pasa con cada paquete.',ir:'ciberseguridad/fw'},
  {id:'ciber-vpn-diagnostico',materia:'ciberseguridad',tema:'vpn-cripto',titulo:'¿Por qué no levanta el túnel?',profundidad:'aplicacion',dificultad:3,
   desc:'Compara la configuración de las dos sedes y encuentra en qué fase falla.',crear:delGenerador('vpn/fases',[3,4,5],'Mesa de ayuda: la VPN entre la oficina central y la sucursal no conecta.')},
  {id:'ciber-vpn-sedes',materia:'ciberseguridad',tema:'vpn-cripto',titulo:'Configurar una VPN entre sedes',profundidad:'escenario',dificultad:4,desc:'Simulador de VPN IPsec sitio a sitio.',ir:'ciberseguridad/vpn'},
  {id:'ciber-logs',materia:'ciberseguridad',tema:'defensa',titulo:'Turno en el SOC: lee los registros',profundidad:'aplicacion',dificultad:3,
   desc:'Encuentra el patrón en cada registro y decide qué hacer.',crear:delGenerador('def/logs',[3,4,5],'Estás de turno en el centro de operaciones de seguridad (SOC).')},
  {id:'ciber-incidentes-caso',materia:'ciberseguridad',tema:'defensa',titulo:'Casos de incidentes',profundidad:'escenario',dificultad:4,desc:'Diagnostica y responde casos reales (siempre defensivo).',crear:delBanco('ciber/incidentes',3)},
  {id:'ciber-laboratorio',materia:'ciberseguridad',tema:'defensa',titulo:'Laboratorio de incidentes',profundidad:'escenario',dificultad:4,desc:'Casos completos con evidencia, diagnóstico y respuesta.',ir:'ciberseguridad/incidentes'},
  // ---------- Inglés: los jefes de cada unidad son escenarios (una tarea real en inglés) ----------
  ...[['presentarte','Presentarte en una reunión'],['rutina-trabajo','Contar tu rutina de trabajo'],['pedir-comprar','Pedir y comprar'],['ciudad-viajes','Moverte en otra ciudad'],
    ['contar-pasado','Contar lo que pasó'],['trabajo-ti','Una conversación de trabajo en TI']].map(([u,t],i)=>
    ({id:`en-jefe-${u}`,materia:'ingles',tema:'hablar-escuchar',titulo:t,profundidad:'escenario',dificultad:Math.min(5,1+Math.floor(i/1.5)),desc:'El jefe de la unidad: una tarea real hablando en inglés.',ir:`estudio/ingles/hablar/u/${u}`})),
  {id:'en-conversacion-ia',materia:'ingles',tema:'hablar-escuchar',titulo:'Conversación libre con IA',profundidad:'escenario',dificultad:4,desc:'Habla de lo que quieras (necesita tu clave de IA).',ir:'estudio/ingles/hablar/ia'}
].filter(r=>r.ir||r.crear);

export const reto=id=>RETOS.find(r=>r.id===id)||null;
export const retosDe=(materia,tema)=>RETOS.filter(r=>r.materia===materia&&(!tema||r.tema===tema));
