import {esc} from '../utilidades.js';
import {progreso,reiniciarProgreso} from '../progreso.js';
import {incidents} from '../datos/incidentes.js';
import {quiz} from '../datos/preguntas.js';

const tarjetas=[['redes','Redes','Modelo OSI, puertos y protocolos que todo firewall usa.'],
    ['subred','Calculadora de subredes','Escribe una IP y máscara y ve red, broadcast y hosts.'],
    ['vlan','VLANs y Wi-Fi','Separa redes con 802.1Q y protege el Wi-Fi con WPA3 y redes de invitados.'],
    ['fw','Simulador de políticas','Crea reglas, envía un paquete y mira qué regla lo atrapa. Cambia entre FortiGate, Palo Alto, Cisco ASA y pfSense.'],
    ['vpn','Simulador de VPN IPsec','Configura las dos puntas de un túnel entre FortiGate, levántalo y descubre en qué fase falla.'],
    ['marcas','Comparar marcas','Cómo se llama lo mismo en cada fabricante.'],
    ['forti','FortiGate a fondo','Políticas, NAT/VIP, VPN y perfiles de seguridad explicados.'],
    ['incidentes','Laboratorio de incidentes','Lee registros simulados, identifica el ataque y elige la defensa correcta.'],
    ['quiz','Examen rápido','Pon a prueba lo aprendido.']];

const barra=(n,de)=>`<div class="barra" aria-hidden="true"><span style="width:${de?Math.round(n/de*100):0}%"></span></div>`;

function panel(){
  const p=progreso();
  const vis=tarjetas.filter(([k])=>p.visitadas.includes(k)).length;
  const casos=incidents.filter((_,i)=>p.casos.includes(i)).length;
  const e=p.examen;
  return `<section class="card prog" aria-labelledby="ptit">
 <div class="prog-top"><h3 id="ptit">Tu progreso</h3><button class="btn ghost" id="preset">Reiniciar progreso</button></div>
 <div class="prog-grid">
  <div><div class="prog-k">Secciones visitadas</div><div class="prog-v">${vis} <small>de ${tarjetas.length}</small></div>${barra(vis,tarjetas.length)}</div>
  <div><div class="prog-k">Mejor examen</div>${e?`<div class="prog-v">${e.aciertos} <small>de ${e.total} (${Math.round(e.aciertos/e.total*100)}%)</small></div>${barra(e.aciertos,e.total)}`:`<div class="prog-v">— <small>aún no lo terminas (${quiz.length} preguntas)</small></div>${barra(0,1)}`}</div>
  <div><div class="prog-k">Casos resueltos</div><div class="prog-v">${casos} <small>de ${incidents.length}</small></div>${barra(casos,incidents.length)}
   <div class="chips">${incidents.map((c,i)=>`<span class="tag${p.casos.includes(i)?' on':''}" title="${esc(c.t)}">${p.casos.includes(i)?'✓ ':''}Caso ${i+1}</span>`).join('')}</div></div>
 </div>
</section>`;
}

export const vista=()=>{
 const p=progreso();
 return `
<h1>Aprende seguridad de redes practicando</h1>
<p class="lead">Elige una sección. Todo ocurre dentro de esta página: los paquetes, firewalls y registros son simulados, así que puedes experimentar sin tocar ningún equipo real.</p>
${panel()}
<div class="grid">
 ${tarjetas.map(([k,t,d])=>`<div class="card click" data-go="${k}" tabindex="0"><h3>${t}${p.visitadas.includes(k)?' <span class="tag on">✓ Visitada</span>':''}</h3><p style="margin:0;color:var(--muted)">${d}</p></div>`).join('')}
</div>`;
};

export function alClic(t,ir){
  if(t.id==='preset'){if(confirm('¿Borrar tu progreso guardado en este navegador?')){reiniciarProgreso();ir('inicio')}return true}
}
