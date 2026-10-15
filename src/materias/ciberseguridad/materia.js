/* Materia Ciberseguridad: temas con habilidades (lecciones y ejercicios generados) y secciones interactivas propias
   (simuladores, laboratorio, examen), que se enlazan desde el tema Herramientas */
import * as redes from './secciones/redes.js';
import * as subred from './secciones/subredes.js';
import * as vlan from './secciones/vlans.js';
import * as fw from './secciones/firewall.js';
import * as vpn from './secciones/vpn.js';
import * as marcas from './secciones/marcas.js';
import * as forti from './secciones/fortigate.js';
import * as incidentes from './secciones/incidentes.js';
import * as quiz from './secciones/examen.js';
import {incidents} from './datos/incidentes.js';
import {quiz as preguntas} from './datos/preguntas.js';
import {escenarios} from './datos/vpn.js';
import {barra} from '../../nucleo/ui.js';
import {cargarTemas,habilidades} from '../../nucleo/cargar.js';
import defs from './temas.js';

const temas=cargarTemas(import.meta.glob('./temas/*/*.js',{eager:true}),defs);

// Las claves (redes, subred, fw…) forman la ruta (#cursos/ciberseguridad/fw; la vieja #ciberseguridad/fw redirige) y se guardan en el progreso: no las cambies.
// intro y como: cabecera común (main.js); habilidad: el botón "Practicar" lleva a esa habilidad del camino; propia: la sección pinta su cabecera
const secciones={
  redes:{titulo:'Redes',grupo:'Fundamentos',desc:'Modelo OSI, puertos y protocolos que todo firewall usa.',modulo:redes,intro:'Qué capas mira un firewall y qué puerto usa cada servicio.',como:['Recorre el modelo OSI de abajo hacia arriba.','Fíjate en qué capa trabaja cada protocolo.','Practica los puertos para recordarlos.'],habilidad:'puertos-y-servicios'},
  subred:{titulo:'Calculadora de subredes',grupo:'Fundamentos',desc:'Escribe una IP y máscara y ve red, broadcast y hosts.',modulo:subred,intro:'Escribe una IP con su prefijo y mira la red, el broadcast y los hosts.',como:['Escribe la IP (por ejemplo, 192.168.1.77).','Elige el prefijo.','Toca Calcular y compáralo con tu cuenta.'],habilidad:'subredes-cidr'},
  vlan:{titulo:'VLANs y Wi-Fi',grupo:'Fundamentos',desc:'Separa redes con 802.1Q y protege el Wi-Fi con WPA3 y redes de invitados.',modulo:vlan,intro:'Separa redes en un mismo switch y en el Wi-Fi; el firewall decide qué se habla.',como:['Lee cómo una VLAN divide el switch.','Mira qué SSID va a cada VLAN.','Fíjate en las reglas entre VLAN.']},
  fw:{titulo:'Simulador de políticas',grupo:'Firewalls',desc:'Crea reglas, envía un paquete y mira qué regla lo atrapa. Cambia entre FortiGate, Palo Alto, Cisco ASA y pfSense.',modulo:fw,intro:'Las reglas se revisan de arriba hacia abajo: gana la primera que coincide; si ninguna, se deniega.',como:['Lee la tabla de políticas.','Envía un paquete de prueba y mira qué regla lo atrapa.','Cambia el orden con ↑ ↓ y vuelve a probar.','Elige la marca para ver la misma regla en su sintaxis.'],habilidad:'politicas-firewall'},
  vpn:{titulo:'Simulador de VPN IPsec',grupo:'Firewalls',desc:'Configura las dos puntas de un túnel entre FortiGate, levántalo y descubre en qué fase falla.',modulo:vpn,intro:'Configura las dos puntas de un túnel IPsec y descubre en qué fase falla.',como:['Elige un escenario o empieza desde cero.','Completa los parámetros de las dos puntas.','Toca Levantar túnel y lee el registro.'],habilidad:'vpn-fases'},
  marcas:{titulo:'Comparar marcas',grupo:'Firewalls',desc:'Cómo se llama lo mismo en cada fabricante.',modulo:marcas,intro:'El mismo concepto se llama distinto en cada fabricante.',como:['Busca el concepto en la primera columna.','Lee su nombre en cada marca.'],habilidad:'marcas'},
  forti:{titulo:'FortiGate a fondo',grupo:'Firewalls',desc:'Políticas, NAT/VIP, VPN y perfiles de seguridad explicados.',modulo:forti,intro:'Políticas, NAT/VIP, VPN y perfiles, con la CLI de FortiOS.',como:['Elige un tema.','Lee la explicación y el comando.'],habilidad:'nat'},
  incidentes:{titulo:'Laboratorio de incidentes',grupo:'Seguridad',desc:'Lee registros simulados, identifica el ataque y elige la defensa correcta.',modulo:incidentes,intro:'Lee registros simulados, identifica el ataque y elige la defensa. Siempre defensivo.',como:['Lee el registro con calma.','Elige qué está pasando.','Elige la primera defensa.'],habilidad:'incidentes'},
  quiz:{titulo:'Examen rápido',grupo:'Seguridad',desc:'Pon a prueba lo aprendido.',modulo:quiz,propia:true,habilidad:'repaso-seguridad'}
};

export default {
  nombre:'Ciberseguridad',sigla:'CS',icono:'🛡️',area:'cursos',tono:'ciber',orden:1,
  descripcion:'Redes, firewalls (FortiGate, Palo Alto, Cisco ASA y pfSense), VPN e incidentes, con simuladores.',
  intro:'Aprende seguridad de redes practicando. Primero las lecciones con lo que más se usa; después, los simuladores y el laboratorio. Los paquetes, firewalls y registros son simulados, así que puedes experimentar sin tocar ningún equipo real.',
  temas,
  lecciones:habilidades(temas),
  secciones,

  // Ejercicios que vuelven en "Repasar hoy": 'examen/<i>' e 'incidentes/<caso>/<a|b>'
  ejercicioRepaso(clave){
    const [tipo,i,etapa]=clave.split('/');
    if(tipo==='examen'){const q=preguntas[+i];return q&&{titulo:'Examen rápido',ej:q}}
    if(tipo==='incidentes'){const x=incidents[+i];if(!x)return null;
      return {titulo:`Incidente: ${x.t}`,ej:etapa==='b'?{tipo:'opcion',pregunta:`Ya sabes qué ocurre: <strong>${x.o[x.a]}</strong>. ${x.d}`,codigo:x.log,opciones:x.do,correcta:x.da,explicacion:x.ex}
        :{tipo:'opcion',pregunta:x.q,codigo:x.log,opciones:x.o,correcta:x.a,explicacion:x.ex}}}
    return null;
  },

  // Bloque de esta materia en "Mi progreso" (lo que antes era el panel de Inicio)
  progresoHtml(d){
    const keys=Object.keys(secciones),vis=keys.filter(k=>d.visitadas.includes(k)).length;
    const casos=d.extra.casos||[],vpnOk=d.extra.vpn||[],e=d.extra.examen;
    const bloque=(k,v,b)=>`<div><div class="prog-k">${k}</div><div class="prog-v">${v}</div>${b}</div>`;
    return `<div class="prog-grid">
 ${bloque('Herramientas visitadas',`${vis} <small>de ${keys.length}</small>`,barra(vis,keys.length))}
 ${bloque('Mejor examen',e?`${e.aciertos} <small>de ${e.total} (${Math.round(e.aciertos/e.total*100)}%)</small>`:`— <small>aún no lo terminas (${preguntas.length} preguntas)</small>`,barra(e?e.aciertos:0,e?e.total:1))}
 ${bloque('Escenarios de VPN resueltos',`${escenarios.filter((_,i)=>vpnOk.includes(i)).length} <small>de ${escenarios.length}</small>`,barra(escenarios.filter((_,i)=>vpnOk.includes(i)).length,escenarios.length))}
</div>
<div class="prog-k" style="margin-top:14px">Casos resueltos del laboratorio: ${incidents.filter((_,i)=>casos.includes(i)).length} de ${incidents.length}</div>
<div class="chips">${incidents.map((c,i)=>`<span class="tag${casos.includes(i)?' on':''}" title="${c.t}">${casos.includes(i)?'✓ ':''}Caso ${i+1}</span>`).join('')}</div>`;
  }
};
