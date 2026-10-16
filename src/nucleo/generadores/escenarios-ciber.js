/* Escenarios integradores de Ciberseguridad (redes): casos de 4 pasos con variantes. Conceptual y defensivo. Sin DOM. */
import {txt,paso,final,marca} from './extensiones/ingles-base.js';

const ctx=t=>`<p class="contexto">${t}</p>`;
const q=(contexto,que,{enunciado,acepta,errores,regla,x})=>({...txt({enunciado:ctx(contexto)+enunciado,acepta,errores,regla,es:true,pista:'Piensa qué necesitas lograr en este paso.',
  pasos:[paso('¿Qué pide este paso?',que,'Cada paso del caso usa un tema distinto.'),final('Escribe la respuesta',marca(acepta[0]),x)]}),profundidad:'escenario'});

// Conmutación y enrutamiento · Una oficina nueva: VLAN, trunk, STP y salida a internet
export function escenarioOficina(rng){
  const [v1,v2,v3]=rng.elegir([[10,20,30],[100,200,300],[11,21,31]]);
  const C=`Montas la red de una oficina nueva con dos switches: empleados (VLAN ${v1}), cámaras (VLAN ${v2}) e invitados (VLAN ${v3}). Hay un router con salida a internet.`;
  return [
    q(C,'Separar los grupos',{enunciado:`1/4 · La impresora de empleados se conecta a un puerto del switch. ¿Configuras ese puerto como acceso o como trunk?`,
      acepta:['acceso','access','puerto de acceso','de acceso'],errores:[['trunk','Un equipo final va en un puerto de acceso.']],regla:'Equipos finales en puertos de acceso; entre switches, trunk.',x:'Puerto de acceso en la VLAN de empleados.'}),
    q(C,'Unir los switches',{enunciado:`2/4 · El enlace entre los dos switches debe llevar las VLAN ${v1}, ${v2} y ${v3}. ¿Qué estándar etiqueta las tramas?`,
      acepta:['802.1Q','IEEE 802.1Q','dot1q'],errores:[['802.11','802.11 es Wi-Fi.'],['802.1D','802.1D es STP.']],regla:'Trunk con etiquetas 802.1Q.',x:'Trunk 802.1Q.'}),
    q(C,'Evitar bucles',{enunciado:'3/4 · Para redundancia pones dos cables entre los switches. ¿Qué protocolo evita que se forme un bucle?',
      acepta:['STP','spanning tree','RSTP','spanning tree protocol'],errores:[['OSPF','OSPF es de enrutamiento; los bucles de capa 2 los evita STP.']],regla:'STP / RSTP bloquea los caminos redundantes.',x:'STP o RSTP.'}),
    q(C,'Salir a internet',{enunciado:'4/4 · El router conoce las redes internas, pero nadie sale a internet. ¿Qué ruta le falta?',
      acepta:['la ruta por defecto','ruta por defecto','0.0.0.0/0','default route','una ruta por defecto'],errores:[['una VLAN','Para todo lo externo falta 0.0.0.0/0.']],regla:'Ruta por defecto 0.0.0.0/0 hacia el proveedor.',x:'0.0.0.0/0 hacia el proveedor.'})
  ];
}

// Operación y troubleshooting · «La red está lenta»: método, monitoreo y causa
export function escenarioRedLenta(rng){
  const [hora,dest]=rng.elegir([['3 a.m.','un servicio de almacenamiento desconocido'],['2 a.m.','una IP de otro país'],['4 a.m.','un servidor externo nunca visto']]);
  const C=`Varios usuarios dicen que «la red está lenta» desde esta mañana. Eres el técnico de guardia.`;
  return [
    q(C,'Paso 1 de la metodología',{enunciado:'1/4 · ¿Qué haces primero según la metodología de troubleshooting?',
      acepta:['identificar el problema','preguntar que cambio','recopilar informacion','identificar','preguntar y reproducir el problema'],errores:[['reiniciar el router','Primero identificar el problema.']],regla:'1 Identificar · 2 Teoría · 3 Probar · 4 Plan · 5 Implementar · 6 Verificar · 7 Documentar.',x:'Identificar el problema.'}),
    q(C,'Elegir la fuente de datos',{enunciado:'2/4 · Quieres saber qué equipo genera más tráfico y hacia dónde. ¿Qué fuente consultas?',
      acepta:['NetFlow','IPFIX','los flujos','sFlow'],errores:[['SNMP','SNMP da el uso de la interfaz, no quién ni a dónde.']],regla:'SNMP = métricas; syslog = eventos; NetFlow = flujos.',x:'NetFlow muestra quién habla con quién.'}),
    q(C,'Interpretar la anomalía',{enunciado:`3/4 · NetFlow muestra que un servidor envió 30 GB a las ${hora} hacia ${dest}; su línea base es casi 0. ¿Qué posible incidente es?`,
      acepta:['exfiltracion de datos','exfiltración','fuga de datos','exfiltracion'],errores:[['una actualizacion','La pista: muchos datos saliendo a un destino desconocido.']],regla:'Compara contra la línea base: un pico enorme hacia fuera sugiere exfiltración.',x:'Posible exfiltración.'}),
    q(C,'Primera acción defensiva',{enunciado:'4/4 · ¿Qué haces primero con ese servidor?',
      acepta:['aislarlo','aislarlo de la red','contenerlo','contener','desconectarlo de la red'],errores:[['formatearlo','Primero contener; formatear destruye la evidencia.']],regla:'Contener primero (aislar), conservar evidencia y escalar a seguridad.',x:'Aislar y escalar.'})
  ];
}

// Fundamentos de redes · Diseña la red de una pyme: direccionamiento, NAT, DMZ y Wi-Fi de invitados
export function escenarioPyme(rng){
  const [emp,pref,hosts]=rng.elegir([[50,'/26','62'],[25,'/27','30'],[100,'/25','126']]);
  const C=`Una pyme de ${emp} empleados te pide su red: oficinas, un servidor web público, Wi-Fi de invitados y una sola IP pública del proveedor.`;
  return [
    q(C,'Elegir el tamaño de la red de empleados',{enunciado:`1/4 · ¿Qué prefijo, el más pequeño posible, alcanza para ${emp} empleados?`,
      acepta:[pref,pref.slice(1)],errores:[['/24','Alcanza, pero desperdicia direcciones; se pide el más pequeño.']],regla:`Hosts utilizables = 2^h − 2; ${pref} da ${hosts}.`,x:`${pref}: ${hosts} hosts.`}),
    q(C,'Salir a internet con una sola IP',{enunciado:'2/4 · Todos deben navegar con la única IP pública. ¿Qué tipo de NAT usas?',
      acepta:['PAT','NAT overload','sobrecarga','NAT con sobrecarga'],errores:[['NAT estatico','El estático es 1 a 1.']],regla:'PAT: muchas privadas con una pública, por puertos.',x:'PAT.'}),
    q(C,'Ubicar el servidor web',{enunciado:'3/4 · ¿En qué zona pones el servidor web público?',
      acepta:['DMZ','en la DMZ','zona desmilitarizada'],errores:[['red interna','En la interna expondrías a todos.']],regla:'Lo publicado va en la DMZ, separado de la red interna.',x:'DMZ.'}),
    q(C,'Separar a los invitados',{enunciado:'4/4 · ¿Cómo separas el Wi-Fi de invitados de la red de empleados?',
      acepta:['en otra VLAN','una VLAN aparte','VLAN separada','VLAN de invitados','con una VLAN distinta'],errores:[['misma red con otra contraseña','Una contraseña distinta no separa las redes.']],regla:'Invitados en su propia VLAN, con reglas que solo permitan internet.',x:'VLAN de invitados.'})
  ];
}

// Security+ · Arma el plan de respuesta a incidentes de la empresa
export function escenarioPlanIR(rng){
  const tipo=rng.elegir(['ransomware','robo de credenciales','fuga de datos']);
  const C=`La dirección te pide un plan de respuesta a incidentes; el escenario de práctica es un caso de ${tipo}.`;
  return [
    q(C,'Antes del incidente',{enunciado:'1/4 · ¿Cómo se llama la fase en la que defines roles, contactos, herramientas y simulacros, antes de que pase algo?',
      acepta:['preparacion','preparación'],errores:[['contencion','La contención es durante el incidente.']],regla:'Preparación → detección/análisis → contención, erradicación y recuperación → lecciones aprendidas.',x:'Preparación.'}),
    q(C,'Primer paso al confirmarlo',{enunciado:'2/4 · Confirmado el incidente, ¿qué haces primero para que el daño no crezca?',
      acepta:['contener','contencion','contención','aislar los equipos','aislar'],errores:[['recuperar','Primero contener.'],['borrar todo','Se perdería la evidencia.']],regla:'Contener primero (aislar, deshabilitar cuentas).',x:'Contención.'}),
    q(C,'Quién habla hacia fuera',{enunciado:'3/4 · ¿Quién debe comunicar el incidente a clientes y prensa?',
      acepta:['el vocero designado','el responsable de comunicacion','el portavoz','comunicacion','el vocero'],errores:[['cualquier empleado','Solo el vocero definido en el plan.']],regla:'El plan define roles y un único vocero.',x:'Vocero designado.'}),
    q(C,'Después del incidente',{enunciado:'4/4 · ¿Cómo se llama la reunión final para mejorar y que no se repita?',
      acepta:['lecciones aprendidas','post mortem','postmortem','revision posterior'],errores:[['preparacion','Es la de lecciones aprendidas (que alimenta la preparación).']],regla:'Lecciones aprendidas: causa raíz, qué funcionó y qué cambiar.',x:'Lecciones aprendidas.'})
  ];
}
