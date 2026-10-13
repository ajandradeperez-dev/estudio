import {$,esc,ip2n,n2ip,mask,inNet} from '../../../utilidades.js';
import {services,policies,vendors,examples} from '../datos/politicas.js';

let vendor='forti';

function cli(p){
  const s=services[p.svc];
  if(vendor==='forti') return `config firewall policy
    edit ${p.id}
        set name "${p.name}"
        set srcintf "${p.si}"
        set dstintf "${p.di}"
        set srcaddr "${p.src==='all'?'all':p.src}"
        set dstaddr "${p.dst==='all'?'all':p.dst}"
        set action ${p.act}
        set schedule "always"
        set service "${p.svc}"${p.nat?'\n        set nat enable':''}${p.prof!=='-'?'\n        set utm-status enable   # perfiles: '+p.prof:''}
    next
end`;
  if(vendor==='pa') return `set rulebase security rules ${p.name} from ${p.si} to ${p.di}
set rulebase security rules ${p.name} source ${p.src==='all'?'any':p.src}
set rulebase security rules ${p.name} destination ${p.dst==='all'?'any':p.dst}
set rulebase security rules ${p.name} application ${p.svc==='HTTPS'?'ssl web-browsing':p.svc==='SSH'?'ssh':p.svc==='DNS'?'dns':p.svc==='RDP'?'ms-rdp':'any'}
set rulebase security rules ${p.name} service application-default
set rulebase security rules ${p.name} action ${p.act==='accept'?'allow':'deny'}${p.prof!=='-'?'\nset rulebase security rules '+p.name+' profile-setting group default  # '+p.prof:''}${p.nat?'\n# NAT va en una regla aparte: set rulebase nat rules ... source-translation dynamic-ip-and-port':''}`;
  if(vendor==='asa'){
    const net=x=>x==='all'?'any':x.endsWith('/32')?'host '+x.split('/')[0]:n2ip(ip2n(x.split('/')[0]))+' '+n2ip(mask(+x.split('/')[1]));
    return `access-list ${p.si.toUpperCase()}_IN extended ${p.act==='accept'?'permit':'deny'} ${s.p==='any'?'ip':s.p} ${net(p.src)} ${net(p.dst)}${s.port!=='any'?' eq '+s.port:''}
access-group ${p.si.toUpperCase()}_IN in interface ${p.si}${p.nat?`\nobject network OBJ_${p.si.toUpperCase()}\n subnet ${net(p.src)}\n nat (${p.si},${p.di}) dynamic interface`:''}`;
  }
  return `Firewall > Rules > ${p.si.toUpperCase()}  (se evalúa en la interfaz de ENTRADA)
  Action:      ${p.act==='accept'?'Pass':'Block'}
  Interface:   ${p.si.toUpperCase()}
  Protocol:    ${s.p.toUpperCase()}
  Source:      ${p.src==='all'?'any':p.src}
  Destination: ${p.dst==='all'?'any':p.dst}  port ${s.port}
  Description: ${p.name}${p.nat?'\nFirewall > NAT > Outbound: modo Automatic (hace NAT de LAN hacia WAN)':''}`;
}

function evaluate(pkt){
  for(const p of policies){
    if(p.si!==pkt.si||p.di!==pkt.di)continue;
    if(!inNet(pkt.src,p.src)||!inNet(pkt.dst,p.dst))continue;
    const s=services[p.svc];
    if(p.svc!=='ALL'&&(s.p!==pkt.proto||s.port!==+pkt.port))continue;
    return p;
  }
  return null;
}

export const vista=()=>`
<h1>Simulador de políticas</h1>
<p class="lead">Las políticas se revisan de arriba hacia abajo y gana la primera que coincide. Si ninguna coincide, se aplica la denegación implícita. Elige la marca para ver la misma regla en su sintaxis.</p>
<div class="tabs" id="vtabs">${Object.entries(vendors).map(([k,v])=>`<button data-v="${k}" aria-pressed="${k===vendor}">${v.n}</button>`).join('')}</div>
<div class="card"><div class="wrap"><table id="ptable"></table></div>
<p style="font-size:12px;color:var(--muted);margin:8px 0 0">Haz clic en una política para ver su configuración. Usa ↑ ↓ para cambiar el orden y comprobar cómo cambia el resultado.</p></div>
<h2>Nueva política</h2>
<div class="card"><div class="row">
 <label for="nname">Nombre<input id="nname" value="Mi-regla" size="12"></label>
 <label for="nsi">Entrada<select id="nsi"><option>lan</option><option>wan</option><option>dmz</option></select></label>
 <label for="ndi">Salida<select id="ndi"><option>wan</option><option>lan</option><option>dmz</option></select></label>
 <label for="nsrc">Origen<input id="nsrc" value="192.168.10.0/24" size="15"></label>
 <label for="ndst">Destino<input id="ndst" value="all" size="13"></label>
 <label for="nsvc">Servicio<select id="nsvc">${Object.keys(services).map(s=>`<option>${s}</option>`).join('')}</select></label>
 <label for="nact">Acción<select id="nact"><option value="accept">Permitir</option><option value="deny">Denegar</option></select></label>
 <label for="nnat">NAT<select id="nnat"><option value="0">No</option><option value="1">Sí</option></select></label>
 <button class="btn" id="nadd">Agregar al final</button></div></div>
<h2>Enviar un paquete de prueba</h2>
<div class="card"><div class="row">
 <label for="tsi">Entra por<select id="tsi"><option>lan</option><option>wan</option><option>dmz</option></select></label>
 <label for="tdi">Sale por<select id="tdi"><option>wan</option><option>lan</option><option>dmz</option></select></label>
 <label for="tsrc">IP origen<input id="tsrc" value="192.168.10.25" size="14"></label>
 <label for="tdst">IP destino<input id="tdst" value="142.250.1.1" size="14"></label>
 <label for="tproto">Protocolo<select id="tproto"><option>tcp</option><option>udp</option></select></label>
 <label for="tport">Puerto<input id="tport" value="443" size="5"></label>
 <button class="btn" id="tsend">Enviar paquete</button></div>
 <div class="row" style="margin-top:10px">
 ${examples.map((e,i)=>`<button class="btn ghost" data-ex="${i}">${e[0]}</button>`).join('')}
 </div>
 <div id="tout" class="result">Elige un ejemplo o escribe un paquete y presiona Enviar.</div></div>
<h2 id="clititle">Configuración</h2>
<pre id="cli"></pre>`;

let selPol=1,lastHit=null;
function drawPolicies(){
  $('#ptable').innerHTML=`<tr><th>#</th><th>Nombre</th><th>Entrada → Salida</th><th>Origen</th><th>Destino</th><th>Servicio</th><th>Acción</th><th>NAT</th><th>Perfiles</th><th></th></tr>`+
  policies.map((p,i)=>`<tr data-pid="${p.id}" class="${lastHit===p.id?'hit':''}" style="cursor:pointer">
   <td class="mono">${p.id}</td><td>${esc(p.name)}</td><td class="mono">${p.si} → ${p.di}</td><td class="mono">${esc(p.src)}</td><td class="mono">${esc(p.dst)}</td><td>${p.svc}</td>
   <td class="${p.act==='accept'?'allow':'deny'}">${p.act==='accept'?'Permitir':'Denegar'}</td><td>${p.nat?'Sí':'No'}</td><td>${p.prof}</td>
   <td><button class="btn ghost" data-up="${i}" aria-label="Subir">↑</button> <button class="btn ghost" data-down="${i}" aria-label="Bajar">↓</button> <button class="btn ghost" data-del="${i}" aria-label="Borrar">✕</button></td></tr>`).join('')+
  `<tr class="${lastHit===0?'hit':''}"><td class="mono">0</td><td>Denegación implícita</td><td class="mono">cualquiera</td><td>all</td><td>all</td><td>ALL</td><td class="deny">Denegar</td><td>-</td><td>-</td><td></td></tr>`;
  const p=policies.find(x=>x.id===selPol)||policies[0];
  $('#clititle').textContent=`Configuración en ${vendors[vendor].os}${p?' — política '+p.id:''}`;
  $('#cli').textContent=p?cli(p):'(sin políticas)';
}
function sendPacket(){
  const pkt={si:$('#tsi').value,di:$('#tdi').value,src:$('#tsrc').value,dst:$('#tdst').value,proto:$('#tproto').value,port:$('#tport').value};
  if(ip2n(pkt.src)==null||ip2n(pkt.dst)==null){$('#tout').innerHTML='<span class="deny">Revisa las IP: deben tener el formato 192.168.1.10.</span>';return}
  const p=evaluate(pkt); lastHit=p?p.id:0; if(p)selPol=p.id; drawPolicies();
  if(!p){$('#tout').innerHTML=`<span class="deny">DENEGADO</span> por la denegación implícita. Ninguna política coincide con ${pkt.si} → ${pkt.di}, ${pkt.proto}/${pkt.port}.<br><span style="color:var(--muted)">Pista: para permitirlo, crea una política con esas interfaces, origen, destino y servicio.</span>`;return}
  let extra='';
  if(p.act==='accept'&&p.nat)extra+=`<br>NAT de origen: ${pkt.src} se traduce a la IP pública de la interfaz ${p.di} (ej. 200.10.10.2).`;
  if(p.act==='accept'&&p.prof!=='-')extra+=`<br>El tráfico además pasa por los perfiles de seguridad: ${p.prof}.`;
  $('#tout').innerHTML=`<span class="${p.act==='accept'?'allow':'deny'}">${p.act==='accept'?'PERMITIDO':'DENEGADO'}</span> por la política ${p.id} "${esc(p.name)}".${extra}`;
}

export function alMostrar(){drawPolicies()}

export function alClic(t){
  if(t.dataset.v){vendor=t.dataset.v;document.querySelectorAll('#vtabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===vendor));drawPolicies();return true}
  if(t.dataset.up!==undefined){const i=+t.dataset.up;if(i>0)[policies[i-1],policies[i]]=[policies[i],policies[i-1]];drawPolicies();return true}
  if(t.dataset.down!==undefined){const i=+t.dataset.down;if(i<policies.length-1)[policies[i+1],policies[i]]=[policies[i],policies[i+1]];drawPolicies();return true}
  if(t.dataset.del!==undefined){policies.splice(+t.dataset.del,1);lastHit=null;drawPolicies();return true}
  if(t.dataset.pid){selPol=+t.dataset.pid;drawPolicies();return true}
  if(t.id==='nadd'){
    const src=$('#nsrc').value.trim()||'all',dst=$('#ndst').value.trim()||'all';
    const okNet=v=>v==='all'||(ip2n(v.split('/')[0])!=null&&(v.split('/')[1]===undefined||(+v.split('/')[1]>=0&&+v.split('/')[1]<=32)));
    if(!okNet(src)||!okNet(dst)){$('#tout').innerHTML='<span class="deny">Origen o destino inválido. Usa "all" o una red como 192.168.10.0/24.</span>';return true}
    const id=Math.max(0,...policies.map(p=>p.id))+1;
    policies.push({id,name:$('#nname').value.replace(/\s+/g,'-')||'Regla-'+id,si:$('#nsi').value,di:$('#ndi').value,src,dst:dst,svc:$('#nsvc').value,act:$('#nact').value,nat:$('#nnat').value==='1',prof:'-'});
    selPol=id;drawPolicies();return true}
  if(t.id==='tsend'){sendPacket();return true}
  if(t.dataset.ex!==undefined){const x=examples[+t.dataset.ex];['tsi','tdi','tsrc','tdst','tproto','tport'].forEach((k,i)=>$('#'+k).value=x[i+1]);sendPacket();return true}
}
