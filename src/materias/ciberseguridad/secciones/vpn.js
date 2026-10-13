import {$,esc,ip2n,n2ip,mask} from '../../../utilidades.js';
import {sitios,configBase,cifrados,hashes,gruposDH,versionesIKE,escenarios} from '../datos/vpn.js';
import {marcarEscenarioVpn} from '../progreso.js';

const clonar=x=>JSON.parse(JSON.stringify(x));
let cfg=clonar(configBase);
let resultado=null; // {estado:'up'|'down'|'config'|'info', fase, html}
let escActivo=null; // escenario cargado; al levantar el túnel con él se marca como resuelto

/* ---------- utilidades ---------- */
// "192.168.10.0/24" → {txt, red, mascara, rango} o null si no es una red CIDR válida
function red(v){
  const [a,b]=String(v).trim().split('/');
  if(b===undefined||!/^\d{1,2}$/.test(b)||+b>32)return null;
  const n=ip2n(a); if(n==null)return null;
  const m=mask(+b),net=(n&m)>>>0;
  return {txt:`${n2ip(net)}/${b}`,red:n2ip(net),mascara:n2ip(m),rango:`${n2ip(net)}-${n2ip((net|~m)>>>0)}`};
}
const etiqueta=(lista,v)=>(lista.find(x=>x[0]===v)||[v,v])[1];
const b=x=>`<b>${esc(x)}</b>`;

// Nombres de algoritmos como aparecen en el debug de IKE
const ENC={aes256:'AES_CBC (key_len = 256)',aes128:'AES_CBC (key_len = 128)','3des':'3DES_CBC',des:'DES_CBC'};
const INTEGR={sha256:'AUTH_HMAC_SHA2_256_128',sha512:'AUTH_HMAC_SHA2_512_256',sha1:'AUTH_HMAC_SHA_96',md5:'AUTH_HMAC_MD5_96'};
const HASH1={sha256:'SHA2_256',sha512:'SHA2_512',sha1:'SHA',md5:'MD5'};
const DH={'2':'MODP1024','5':'MODP1536','14':'MODP2048','19':'ECP256','20':'ECP384','21':'ECP521'};

/* ---------- CLI de FortiOS ---------- */
function cliLado(k){
  const c=cfg[k],st=sitios[k],r=v=>{const x=red(v);return x?`${x.red} ${x.mascara}`:v};
  return `# FG-${st.nombre} · WAN ${st.wan} (wan1) · LAN ${st.lan} (internal)
config vpn ipsec phase1-interface
    edit "${st.tunel}"
        set interface "wan1"
        set ike-version ${c.ike}
        set peertype any
        set net-device disable
        set proposal ${c.enc}-${c.hash}
        set dhgrp ${c.dh}
        set remote-gw ${c.gw}
        set psksecret ${c.psk}   # al hacer "show" FortiOS la muestra cifrada (ENC ...)
    next
end
config vpn ipsec phase2-interface
    edit "${st.tunel}-p2"
        set phase1name "${st.tunel}"
        set proposal ${c.enc2}-sha256
        set src-subnet ${r(c.src)}
        set dst-subnet ${r(c.dst)}
    next
end
config router static
    edit 0
        set dst ${r(c.dst)}
        set device "${st.tunel}"
    next
end
config firewall policy
    edit 0
        set name "LAN-a-${st.tunel.slice(2)}"
        set srcintf "internal"
        set dstintf "${st.tunel}"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 0
        set name "${st.tunel.slice(2)}-a-LAN"
        set srcintf "${st.tunel}"
        set dstintf "internal"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end`;
}

/* ---------- negociación ---------- */
// Simula que la Matriz inicia el túnel. Revisa en el mismo orden que IKE y se detiene en el primer error.
function levantar(){
  const m=cfg.m,s=cfg.s,M=sitios.m,S=sitios.s;

  const errores=[];
  for(const [k,c] of [['m',m],['s',s]]){
    const n=sitios[k].nombre;
    if(ip2n(c.gw)==null)errores.push(`${n}: la IP remota ${b(c.gw)} no es válida.`);
    if(!c.psk)errores.push(`${n}: falta la clave precompartida.`);
    if(!red(c.src))errores.push(`${n}: la red local de fase 2 ${b(c.src)} no es válida. Usa el formato 192.168.10.0/24.`);
    if(!red(c.dst))errores.push(`${n}: la red remota de fase 2 ${b(c.dst)} no es válida. Usa el formato 192.168.10.0/24.`);
  }
  if(errores.length)return {estado:'config',html:`<span class="warn">REVISA LA CONFIGURACIÓN</span><br>${errores.join('<br>')}`};

  const d=new Date(),dos=n=>String(n).padStart(2,'0');
  const fecha=`${d.getFullYear()}-${dos(d.getMonth()+1)}-${dos(d.getDate())}`;
  const hora=x=>{const t=new Date(d.getTime()+x*1000);return `${dos(t.getHours())}:${dos(t.getMinutes())}:${dos(t.getSeconds())}`};
  const v2=m.ike==='2',p1=v2?'SA_INIT':'ident_i1send';
  const dm=(msg,id=1)=>`ike 0:${M.tunel}${id?':'+id:''}: ${msg}`, ds=(msg,id=1)=>`ike 0:${S.tunel}${id?':'+id:''}: ${msg}`;
  const ev=(st,lvl,desc,extra,seg)=>`date=${fecha} time=${hora(seg)} devname="FG-${st.nombre}" type="event" subtype="vpn" level="${lvl}" vd="root" logdesc="${desc}" msg="${desc}" ${extra}`;
  const par=(de,a,tunel)=>`remip=${a.wan} locip=${de.wan} remport=500 locport=500 outintf="wan1" vpntunnel="${tunel}"`;
  const inicio=[`# FG-Matriz (inicia el túnel) · diagnose debug application ike -1`,
    dm(`created connection: 0x5a1c2e8 5 ${M.wan}->${m.gw}:500.`,0),
    v2?dm(`sent IKE msg (${p1}): ${M.wan}:500->${m.gw}:500, len=556`):dm('initiator: main mode is sending 1st message...'),
    ...(v2?[]:[dm(`sent IKE msg (${p1}): ${M.wan}:500->${m.gw}:500, len=552`)])];
  const llega=[`# FG-Sucursal · diagnose debug application ike -1`,`ike 0: comes ${M.wan}:500->${S.wan}:500,ifindex=5....`,
    `ike 0: IKEv${m.ike} exchange=${v2?'SA_INIT':'Identity Protection'} id=5a1c2e8a7f3b4d10/0000000000000000 len=${v2?556:552}`];
  const timeout=[dm(`sent IKE msg (retransmit): ${M.wan}:500->${m.gw}:500`),dm(`sent IKE msg (retransmit): ${M.wan}:500->${m.gw}:500`),dm('negotiation timeout, deleting',0)];
  const evTimeout=ev(M,'error','IPsec phase 1 error',`action="negotiate" ${par(M,{wan:m.gw},M.tunel)} status="negotiate_error" reason="negotiation timeout"`,30);
  const caida=(fase,titulo,texto,log)=>({estado:'down',fase,html:`<span class="deny">FALLA EN FASE ${fase}</span> · <strong>${titulo}</strong><br>${texto}`,log:log.join('\n')});

  // 1. ¿Llegan los mensajes al peer correcto?
  if(m.gw!==S.wan)return caida(1,'El peer no responde',
    `La Matriz envía la negociación a ${b(m.gw)}, pero la Sucursal está en ${b(S.wan)}. Nadie contesta y la negociación expira por tiempo. Revisa la <em>IP remota</em> de la fase 1 en la Matriz.`,
    [...inicio,...timeout,'',`# FG-Matriz · Registro de eventos (Log & Report > Events > VPN)`,evTimeout]);
  if(s.gw!==M.wan)return caida(1,'La Sucursal ignora la solicitud',
    `Los mensajes de la Matriz llegan a la Sucursal, pero su fase 1 espera al peer ${b(s.gw)}, no a ${b(M.wan)}. Como ningún túnel coincide con ese origen, la Sucursal descarta la solicitud y la Matriz se queda esperando. Revisa la <em>IP remota</em> de la fase 1 en la Sucursal.`,
    [...inicio,'',...llega,`ike 0: no gateway configured for peer ${M.wan}, ignoring request`,'','# FG-Matriz',...timeout,'',`# FG-Matriz · Registro de eventos`,evTimeout]);
  if(m.ike!==s.ike)return caida(1,'Versiones de IKE distintas',
    `La Matriz negocia con ${b('IKEv'+m.ike)} y la Sucursal está configurada con ${b('IKEv'+s.ike)}. Son protocolos distintos: la Sucursal descarta los mensajes y la negociación expira. Las dos puntas deben usar la misma versión (hoy, IKEv2).`,
    [...inicio,'',...llega,`ike 0: IKEv${m.ike} request ignored, gateway "${S.tunel}" is configured for IKEv${s.ike}`,'','# FG-Matriz',...timeout,'',`# FG-Matriz · Registro de eventos`,evTimeout]);

  // 2. Propuesta de fase 1
  const prop=c=>v2?['protocol = IKEv2:','   encapsulation = IKEv2/none',`      type=ENCR, val=${ENC[c.enc]}`,`      type=INTEGR, val=${INTEGR[c.hash]}`,`      type=DH_GROUP, val=${DH[c.dh]}.`]
    :['protocol id = ISAKMP:','   trans_id = KEY_IKE.','   encapsulation = IKE/none',`      type=OAKLEY_ENCRYPT_ALG, val=${ENC[c.enc]}.`,`      type=OAKLEY_HASH_ALG, val=${HASH1[c.hash]}.`,'      type=AUTH_METHOD, val=PRESHARED_KEY.',`      type=OAKLEY_GROUP, val=${DH[c.dh]}.`];
  const dif=[['enc','cifrado',cifrados],['hash','hash',hashes],['dh','grupo DH',gruposDH]].filter(([k])=>m[k]!==s[k]);
  if(dif.length)return caida(1,'Las propuestas no coinciden',
    `Las dos puntas se encuentran, pero no se ponen de acuerdo en cómo proteger la negociación: ${dif.map(([k,n,l])=>`${n} ${b(etiqueta(l,m[k]))} en la Matriz y ${b(etiqueta(l,s[k]))} en la Sucursal`).join('; ')}. Cifrado, hash y grupo DH deben ser iguales en los dos lados.`,
    [...inicio,'',...llega,ds(v2?'responder received SA_INIT':'responder: main mode get 1st message...'),ds('incoming proposal:'),...prop(m).map(x=>ds(x)),
     ds(`my proposal, gw ${S.tunel}:`),...prop(s).map(x=>ds(x)),ds('negotiation failure'),ds(`no SA proposal chosen`),'','# FG-Matriz',
     dm(v2?'received notify type NO_PROPOSAL_CHOSEN':'notify msg received: NO-PROPOSAL-CHOSEN'),dm('negotiation failure'),'',`# FG-Matriz · Registro de eventos`,
     ev(M,'error','IPsec phase 1 error',`action="negotiate" ${par(M,S,M.tunel)} status="negotiate_error" reason="peer SA proposal not match"`,1)]);

  // 3. Autenticación con la clave precompartida
  const fase1ok=[ds(v2?'responder received SA_INIT':'responder: main mode get 1st message...'),ds('incoming proposal:'),...prop(m).map(x=>ds(x)),ds('proposal id = 1: matched')];
  if(m.psk!==s.psk)return caida(1,'La clave precompartida no coincide',
    `Las propuestas coinciden y se acuerdan las llaves de cifrado, pero al autenticarse cada lado comprueba la clave del otro y no es la misma. Revisa mayúsculas, números y símbolos: la clave debe ser idéntica en los dos FortiGate.`,
    [...inicio,'',...llega,...fase1ok,
     ...(v2?[ds('responder received AUTH msg'),ds('PSK auth failed: probable pre-shared key mismatch'),ds('sending notify AUTHENTICATION_FAILED')]
           :[ds('responder: main mode get 5th message...'),ds('probable pre-shared secret mismatch')]),
     '','# FG-Matriz',...(v2?[dm('received notify type AUTHENTICATION_FAILED')]:[dm('sent IKE msg (retransmit): '+M.wan+':500->'+S.wan+':500')]),
     dm('negotiation failure'),'',`# FG-Sucursal · Registro de eventos`,
     ev(S,'error','IPsec phase 1 error',`action="negotiate" ${par(S,M,S.tunel)} status="negotiate_error" reason="${v2?'authentication failure':'probable pre-shared secret mismatch'}"`,2)]);

  // 4. Fase 2: propuesta y selectores (deben ser espejo)
  const p1arriba=[...inicio,dm(`established IKE SA 5a1c2e8a7f3b4d10/9e2f6b1c3a7d5e08`),dm(`${v2?'IKE SA':'ISAKMP SA'} ${M.tunel} SA up`)];
  const sel=[ds(`peer proposal is: peer:0:${red(m.src).rango}:0, me:0:${red(m.dst).rango}:0`)];
  if(m.enc2!==s.enc2)return caida(2,'El cifrado de fase 2 no coincide',
    `La fase 1 está arriba: las sedes se encontraron y se autenticaron. Pero en la fase 2 no acuerdan cómo cifrar el tráfico: ${b(etiqueta(cifrados,m.enc2))} en la Matriz y ${b(etiqueta(cifrados,s.enc2))} en la Sucursal.`,
    [...p1arriba,'',`# FG-Sucursal · diagnose debug application ike -1`,...sel,ds(`peer IPsec proposal: ESP ${ENC[m.enc2]} AUTH_HMAC_SHA2_256_128`,2),ds(`my IPsec proposal: ESP ${ENC[s.enc2]} AUTH_HMAC_SHA2_256_128`,2),ds('no SA proposal chosen',2),
     '','# FG-Matriz',dm(v2?'received notify type NO_PROPOSAL_CHOSEN':'notify msg received: NO-PROPOSAL-CHOSEN',2),'',`# FG-Matriz · Registro de eventos`,
     ev(M,'error','IPsec phase 2 error',`action="negotiate" ${par(M,S,M.tunel)} phase2_name="${M.tunel}-p2" status="negotiate_error" reason="peer SA proposal not match"`,3)]);
  const malSrc=red(m.src).txt!==red(s.dst).txt,malDst=red(m.dst).txt!==red(s.src).txt;
  if(malSrc||malDst)return caida(2,'Los selectores de red no son espejo',
    `La fase 1 está arriba, pero en la fase 2 cada lado debe proponer exactamente las redes del otro al revés: la red local de uno es la remota del otro.<br>${[
      malSrc?`· La Matriz anuncia como local ${b(red(m.src).txt)}, pero la Sucursal espera como remota ${b(red(s.dst).txt)}.`:'',
      malDst?`· La Matriz quiere llegar a ${b(red(m.dst).txt)}, pero la red local de la Sucursal es ${b(red(s.src).txt)}.`:''].filter(Boolean).join('<br>')}`,
    [...p1arriba,'',`# FG-Sucursal · diagnose debug application ike -1`,...sel,ds('no matching phase2 found',2),ds('failed to get responder Phase2 selector',2),
     '','# FG-Matriz',dm(v2?'received notify type TS_UNACCEPTABLE':'notify msg received: INVALID-ID-INFORMATION',2),'',`# FG-Sucursal · Registro de eventos`,
     ev(S,'error','IPsec phase 2 error',`action="negotiate" ${par(S,M,S.tunel)} status="negotiate_error" reason="no matching phase2 found"`,3)]);

  // Túnel arriba. Avisos de cosas que funcionan pero están mal.
  const avisos=[];
  for(const k of ['m','s']){
    const st=sitios[k],l=red(cfg[k].src).txt;
    if(l!==st.lan)avisos.push(`La red local de fase 2 de la ${st.nombre} es ${b(l)}, pero su LAN es ${b(st.lan)}. El túnel sube, pero el tráfico de los usuarios no coincide con el selector y no entra al túnel.`);
  }
  const debil=[m.ike==='1'&&'IKEv1',['3des','des'].includes(m.enc)&&etiqueta(cifrados,m.enc)+' en fase 1',['sha1','md5'].includes(m.hash)&&etiqueta(hashes,m.hash),
    ['2','5'].includes(m.dh)&&'grupo DH '+m.dh,['3des','des'].includes(m.enc2)&&etiqueta(cifrados,m.enc2)+' en fase 2'].filter(Boolean);
  if(debil.length)avisos.push(`Funciona, pero usa algoritmos débiles u obsoletos: ${debil.map(esc).join(', ')}. Hoy se recomienda IKEv2, AES-256, SHA-256 o superior y grupo DH 14 o mayor.`);
  return {estado:'up',
    html:`<span class="allow">TÚNEL ARRIBA</span> · fase 1 y fase 2 negociadas.<br>Para que pase tráfico, cada FortiGate necesita además la ruta estática hacia la red remota por el túnel y las políticas LAN → túnel y túnel → LAN (las ves en la CLI de abajo).${avisos.map(a=>`<br><span class="warn">Atención:</span> ${a}`).join('')}`,
    log:[...p1arriba,dm(`added IPsec SA: SPIs=e5b3a2c1/7f1d4e02`,2),dm('sending SNMP tunnel UP trap',2),'',`# FG-Matriz · Registro de eventos`,
      ev(M,'notice','IPsec phase 2 status change',`action="phase2-up" ${par(M,S,M.tunel)} phase2_name="${M.tunel}-p2" status="success"`,2),
      ev(M,'notice','IPsec tunnel up',`action="tunnel-up" ${par(M,S,M.tunel)} status="success"`,2),
      '',`# FG-Matriz · get vpn ipsec tunnel summary`,`'${M.tunel}' ${S.wan}:0  selectors(total,up): 1/1  rx(pkt,err): 0/0  tx(pkt,err): 0/0`].join('\n')};
}

/* ---------- vista ---------- */
const campos1=[['gw','IP remota'],['psk','Clave precompartida'],['enc','Cifrado',cifrados],['hash','Hash',hashes],['dh','Grupo DH',gruposDH],['ike','Versión IKE',versionesIKE]];
const campos2=[['src','Red local'],['dst','Red remota'],['enc2','Cifrado (ESP con SHA-256)',cifrados]];
const campo=k=>([f,l,ops])=>{const id=`v${k}-${f}`,v=cfg[k][f];
  return `<label for="${id}">${l}${ops?`<select id="${id}" data-campo="${k}.${f}">${ops.map(([o,t])=>`<option value="${o}"${o===v?' selected':''}>${t}</option>`).join('')}</select>`
    :`<input id="${id}" data-campo="${k}.${f}" value="${esc(v)}" spellcheck="false" autocomplete="off">`}</label>`};
const lado=k=>{const st=sitios[k];return `<div class="card">
 <h3>FortiGate ${st.nombre}</h3><p class="mono vpn-datos">WAN ${st.wan} · LAN ${st.lan}</p>
 <p class="vpn-fase">Fase 1 · IKE</p><div class="vpn-campos">${campos1.map(campo(k)).join('')}</div>
 <p class="vpn-fase">Fase 2 · IPsec</p><div class="vpn-campos">${campos2.map(campo(k)).join('')}</div></div>`};

const mapa=()=>{const r=resultado,t=!r||r.estado==='info'||r.estado==='config'?['','túnel sin probar']:r.estado==='up'?['up','túnel arriba']:['down',`falla en fase ${r.fase}`];
  const nodo=k=>`<div class="vpn-nodo"><strong>${sitios[k].nombre}</strong><span class="mono">${sitios[k].lan}</span><span class="mono">WAN ${sitios[k].wan}</span></div>`;
  return `${nodo('m')}<div class="vpn-enlace ${t[0]}">${t[1]}</div>${nodo('s')}`};
const salida=()=>resultado?resultado.html+(resultado.log?`<pre style="margin-top:10px">${esc(resultado.log)}</pre>`:''):'Configura las dos puntas o carga un escenario, y presiona <strong>Levantar túnel</strong>.';

export const vista=()=>`
<h1>Simulador de VPN IPsec</h1>
<p class="lead">Une la Matriz y la Sucursal con un túnel IPsec sitio a sitio entre dos FortiGate. Configura las dos puntas y presiona Levantar túnel: si algo no coincide, verás en qué fase falla, por qué, y un registro parecido al de FortiOS.</p>
<div class="vpn-mapa" id="vmapa">${mapa()}</div>
<div class="tabs" id="vesc">${escenarios.map((e,i)=>`<button data-esc="${i}">${e.n}</button>`).join('')}<button data-esc="base">Configuración correcta</button></div>
<div class="grid" id="vpnform" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${lado('m')}${lado('s')}</div>
<div class="card" style="margin-top:14px"><div class="row"><button class="btn" id="vup">Levantar túnel</button></div>
 <div id="vout" class="result">${salida()}</div></div>
<h2>CLI de FortiOS</h2>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><pre id="vcli-m"></pre><pre id="vcli-s"></pre></div>`;

function pintar(){
  $('#vmapa').innerHTML=mapa();
  $('#vout').innerHTML=salida();
  $('#vcli-m').textContent=cliLado('m');
  $('#vcli-s').textContent=cliLado('s');
}

export function alMostrar(){
  pintar();
  $('#vpnform').addEventListener('input',e=>{
    const el=e.target.closest('[data-campo]'); if(!el)return;
    const [k,f]=el.dataset.campo.split('.');
    cfg[k][f]=f==='psk'?el.value:el.value.trim();
    if(resultado&&resultado.estado!=='info')resultado={estado:'info',html:'Cambiaste la configuración. Presiona <strong>Levantar túnel</strong> para probarla.'};
    pintar();
  });
}

export function alClic(t){
  if(t.id==='vup'){resultado=levantar();if(resultado.estado==='up'&&escActivo!=null)marcarEscenarioVpn(escActivo);pintar();return true}
  if(t.dataset.esc!==undefined){
    cfg=clonar(configBase);
    const e=escenarios[+t.dataset.esc];
    escActivo=e?+t.dataset.esc:null;
    if(e)for(const k of ['m','s'])Object.assign(cfg[k],e.cambios[k]||{});
    document.querySelectorAll('[data-campo]').forEach(el=>{const [k,f]=el.dataset.campo.split('.');el.value=cfg[k][f]});
    document.querySelectorAll('#vesc button').forEach(x=>x.setAttribute('aria-pressed',x===t));
    resultado={estado:'info',html:e?`<span class="warn">${e.n.toUpperCase()}</span> · ${e.sintoma}<br>Compara las dos puntas, corrige lo que no coincida y presiona <strong>Levantar túnel</strong>.`
      :'Configuración correcta cargada. Presiona <strong>Levantar túnel</strong>.'};
    pintar();return true}
}
