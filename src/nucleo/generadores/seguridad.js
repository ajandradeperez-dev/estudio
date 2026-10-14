/* Generadores de seguridad: reglas de firewall (primera coincidencia), NAT, términos de cada marca, fases de una VPN IPsec,
   criptografía básica y patrones en registros. Todo es simulado y DEFENSIVO: identificar y responder, nunca atacar. */
import {igualNum} from './verificar.js';
import {paso,final,marca} from './pasos.js';

const ip2n=ip=>ip.split('.').reduce((a,o)=>a*256+(+o),0);
const enRed=(ip,red)=>{if(red==='any')return true;const [b,p]=red.split('/');const m=+p===0?0:(0xFFFFFFFF<<(32-+p))>>>0;return ((ip2n(ip)&m)>>>0)===((ip2n(b)&m)>>>0)};
const opcion=(enunciado,correcta,malas,rng,extra={})=>{const ops=rng.barajar([correcta,...malas]);return {tipo:'opcion',enunciado,opciones:ops,correcta:ops.indexOf(correcta),respuesta:correcta,...extra}};

/* ---------- reglas de firewall ---------- */
const SERV=[['HTTP',80],['HTTPS',443],['SSH',22],['DNS',53],['RDP',3389],['SMTP',25]];
const REDES=['192.168.10.0/24','192.168.20.0/24','10.0.50.0/24','10.0.0.0/8','172.16.5.0/24'];
const hostDe=(red,rng)=>{const [b,p]=red.split('/'),o=b.split('.').map(Number);return +p>=24?`${o[0]}.${o[1]}.${o[2]}.${rng.entero(2,250)}`:`${o[0]}.${rng.entero(0,250)}.${rng.entero(0,250)}.${rng.entero(2,250)}`};
const reglas={
  titulo:'¿Qué regla coincide?',
  alternativa:'Es como el guardia de una fiesta con una <b>lista de instrucciones en orden</b>: lee la primera; si describe a la persona que llega, la aplica y deja de leer. Si ninguna la describe, no entra (deny implícito). Por eso una regla general arriba puede "tapar" a una más específica abajo.',
  explicacion:'El firewall revisa las reglas de arriba hacia abajo y aplica la PRIMERA que coincide en origen, destino y servicio. Si ninguna coincide, deniega (deny implícito).',
  generar(n,rng){
    const k=[3,4,4,5,6][n-1],R=[];
    for(let i=0;i<k;i++)R.push({id:i+1,src:rng.prob(n<=2?.3:.4)?'any':rng.elegir(REDES),dst:rng.prob(.4)?'any':rng.elegir(['10.0.50.0/24','8.8.8.8/32','200.1.1.10/32','any']),svc:rng.prob(n<=1?.2:.3)?'ANY':rng.elegir(SERV)[0],act:rng.prob(.55)?'permitir':'denegar'});
    // paquete: a veces apuntado a una regla concreta, a veces a ninguna
    const meta=rng.entero(0,k),r=R[meta]||null;
    const src=r&&r.src!=='any'?hostDe(r.src,rng):hostDe(rng.elegir(REDES),rng);
    const dst=r&&r.dst!=='any'?r.dst.endsWith('/32')?r.dst.split('/')[0]:hostDe(r.dst,rng):rng.elegir(['10.0.50.20','8.8.8.8','200.1.1.10','1.1.1.1']);
    const svc=r&&r.svc!=='ANY'?r.svc:rng.elegir(SERV)[0];
    const coincide=x=>enRed(src,x.src)&&enRed(dst,x.dst)&&(x.svc==='ANY'||x.svc===svc);
    const g=R.find(coincide),todas=R.filter(coincide);
    const tabla=`<div class="wrap"><table><tr><th>#</th><th>Origen</th><th>Destino</th><th>Servicio</th><th>Acción</th></tr>${R.map(x=>`<tr><td>${x.id}</td><td>${x.src}</td><td>${x.dst}</td><td>${x.svc}</td><td>${x.act}</td></tr>`).join('')}</table></div>`;
    const resp=g?String(g.id):'0';
    return {enunciado:`${tabla}<p>Llega un paquete <b>${src} → ${dst}</b>, servicio <b>${svc}</b>. ¿Qué regla se aplica? <span class="nota">Escribe su número, o 0 si ninguna (deny implícito).</span></p>`,
      respuesta:resp,verificar:e=>igualNum(String(e).replace(/regla|#/gi,''),+resp),
      pasos:[paso('Anota los datos del paquete',`Origen <b>${src}</b> · destino <b>${dst}</b> · servicio <b>${svc}</b>`,'Cada regla se compara en estos tres campos.'),
        ...R.slice(0,g?g.id:k).map(x=>{const m=(ok,t)=>ok?`<span class="ok-t">✓ ${t}</span>`:marca(`✗ ${t}`);
          return paso(`Regla ${x.id}: ${coincide(x)?'coincide':'no coincide'}`,`${m(enRed(src,x.src),`origen ${x.src}`)} · ${m(enRed(dst,x.dst),`destino ${x.dst}`)} · ${m(x.svc==='ANY'||x.svc===svc,`servicio ${x.svc}`)}`,
            coincide(x)?'Los tres campos coinciden: esta es la primera que aplica.':'Basta con que un campo no coincida para pasar a la siguiente regla.')}),
        final(g?`Se aplica la regla ${g.id}`:'Deny implícito',g?`Acción: <b>${g.act}</b>. Las reglas de abajo ya no se revisan.`:'Ninguna regla coincide: el paquete se deniega.',g?'Primera coincidencia: gana la que está más arriba.':'Todo lo que no se permite explícitamente se deniega.',resp,todas.length>1?{ojo:`La regla ${todas[1].id} también coincide, pero está más abajo.`}:{})],
      errores:[...todas.slice(1).map(x=>({valor:String(x.id),si:e=>igualNum(String(e).replace(/regla|#/gi,''),x.id),por:`La regla ${x.id} también coincide, pero la ${g.id} está más arriba: gana la primera.`})),
        ...(g?[{valor:'0',si:e=>igualNum(e,0),por:`La regla ${g.id} sí coincide (origen, destino y servicio).`}]:[])],
      regla:'Primera coincidencia: las reglas se revisan de arriba hacia abajo y se aplica la primera que coincide; si ninguna coincide, se deniega (deny implícito).',
      pista:'Revisa las reglas en orden: origen, destino y servicio.',clave:JSON.stringify([R,src,dst,svc])};
  }
};

/* ---------- NAT ---------- */
const nat={
  titulo:'NAT: SNAT, DNAT y VIP',
  alternativa:'Piensa en el conmutador de una oficina. <b>Hacia afuera</b>, todos llaman desde el mismo número público (SNAT: cambia quién llama). <b>Hacia adentro</b>, quien marca el número público y la extensión 443 llega al servidor interno (DNAT/VIP: cambia a quién se llama).',
  explicacion:'NAT de origen (SNAT/PAT) cambia la IP de origen para salir a Internet. NAT de destino (DNAT; en FortiGate, VIP) publica un servidor interno con una IP pública.',
  generar(n,rng){
    const pub=`200.${rng.entero(1,250)}.${rng.entero(0,250)}.${rng.entero(2,250)}`,priv=`192.168.${rng.entero(0,50)}.${rng.entero(2,250)}`,pcs=rng.entero(10,300);
    const R='SNAT/PAT: muchas IP privadas salen con una pública (cambia el ORIGEN). DNAT/VIP: una IP pública lleva a un servidor interno (cambia el DESTINO).';
    const ops=['NAT de origen (SNAT / PAT)','NAT de destino (DNAT / VIP)','No hace falta NAT'];
    const casos=[
      [`${pcs} computadoras con IP privada necesitan navegar por Internet con la IP pública ${pub}.`,0,'Muchas IP privadas salen con una sola pública: se cambia el origen (PAT).'],
      [`Quieres publicar el servidor web interno ${priv} para que desde Internet se llegue con ${pub}:443.`,1,'Desde afuera se llega a la IP pública y se traduce al servidor interno: cambia el destino.'],
      [`Dos redes internas (10.0.1.0/24 y 10.0.2.0/24) del mismo firewall necesitan verse entre sí.`,2,'Entre redes internas solo hace falta enrutamiento y una regla que lo permita.'],
      [`Un servidor de correo interno ${priv} debe recibir correo de Internet en ${pub}:25.`,1,'Entrar desde Internet a un servidor interno es NAT de destino.']
    ];
    if(n>=3&&rng.prob(.5)){const q=rng.elegir([['origen',pub,'Con SNAT el origen se cambia por la IP pública del firewall.'],['destino real',priv,'Con DNAT el destino público se traduce a la IP interna del servidor.']]);
      return q[0]==='origen'?{enunciado:`Una PC ${priv} navega a Internet y el firewall hace SNAT con ${pub}. ¿Qué IP de origen ve el servidor externo?`,respuesta:pub,verificar:e=>String(e).trim()===pub,
        errores:[{valor:priv,si:e=>String(e).trim()===priv,por:'Esa IP privada no sale a Internet: el SNAT la reemplaza por la pública.'}],regla:R,
        pasos:[paso('¿Qué tipo de NAT es?','SNAT: el paquete sale de la red interna hacia Internet.','SNAT cambia el ORIGEN.'),final('Cambia el origen',`${priv} → ${marca(pub)}`,q[2],pub)]}
        :{enunciado:`Desde Internet alguien abre ${pub}:443, publicado con DNAT (VIP) al servidor interno ${priv}. ¿A qué IP llega finalmente el paquete?`,respuesta:priv,verificar:e=>String(e).trim()===priv,
        errores:[{valor:pub,si:e=>String(e).trim()===pub,por:'El firewall cambia ese destino público por la IP interna del servidor.'}],regla:R,
        pasos:[paso('¿Qué tipo de NAT es?','DNAT/VIP: el paquete entra desde Internet hacia un servidor interno.','DNAT cambia el DESTINO.'),final('Cambia el destino',`${pub}:443 → ${marca(priv)}:443`,q[2],priv)]}}
    const [txt,c,ex]=rng.elegir(casos);
    return {...opcion(`${txt} ¿Qué necesitas?`,ops[c],ops.filter((_,i)=>i!==c),rng,{regla:R,explicacion:ex}),porque:{},
      pasos:[paso('¿Hacia dónde va el tráfico?',c===0?'De adentro hacia Internet.':c===1?'De Internet hacia adentro.':'De una red interna a otra.','La dirección decide qué se traduce: el origen al salir, el destino al entrar.'),
        final('Elige',marca(ops[c]),ex,ops[c])]};
  }
};

/* ---------- marcas ---------- */
const MARCAS=['FortiGate','Palo Alto','Cisco ASA / FTD','pfSense'];
const TERMINOS=[['Regla de tráfico','Firewall Policy','Security Policy','Access List (ACL)','Firewall Rule'],['Publicar un servidor','Virtual IP (VIP)','Destination NAT','Static NAT','Port Forward'],
  ['Reconocer aplicaciones','Application Control','App-ID','AVC','OpenAppID'],['VPN de usuarios','FortiClient','GlobalProtect','AnyConnect / Secure Client','OpenVPN / WireGuard'],
  ['Gestión central','FortiManager','Panorama','FMC','(sin consola central nativa)'],['Detección de intrusos','IPS Sensor','Vulnerability Protection','Snort','Snort o Suricata'],['Filtrado web','Web Filter','URL Filtering','URL Filtering','pfBlockerNG / Squid']];
const marcas={
  titulo:'Lo mismo en cada marca',
  alternativa:'Es como "carro", "auto" y "coche": la misma cosa con distinto nombre según el país. Aprende la idea (regla, publicar un servidor, VPN de usuarios…) y después solo memoriza cómo la llama cada marca.',
  explicacion:'Los conceptos son los mismos en todos los firewalls; cambia el nombre. Saber equivalencias te deja trabajar con cualquier marca.',
  generar(n,rng){
    const t=rng.elegir(TERMINOS),i=rng.entero(0,n<=2?1:3),correcta=t[i+1];
    const malas=[...new Set(TERMINOS.filter(x=>x!==t).map(x=>x[i+1]))];
    return {...opcion(`En <b>${MARCAS[i]}</b>, ¿cómo se llama «${t[0]}»?`,correcta,rng.barajar(malas).slice(0,n<=1?2:3),rng),regla:`«${t[0]}»: FortiGate ${t[1]} · Palo Alto ${t[2]} · Cisco ${t[3]} · pfSense ${t[4]}.`,porque:{},
      pasos:[paso('Identifica el concepto',`«${t[0]}»`,'El concepto es el mismo en todas las marcas; solo cambia el nombre.'),
        paso('Compara las marcas',MARCAS.map((m,j)=>`${m}: ${j===i?marca(t[j+1]):t[j+1]}`).join('<br>'),'Ver la tabla completa ayuda a no confundirlas.'),
        final(`En ${MARCAS[i]}`,`<b>${correcta}</b>`,'Ese es el nombre que verás en su consola y en su documentación.',correcta)]};
  }
};

/* ---------- VPN IPsec por fases ---------- */
const P1=[['Versión IKE',['IKEv2','IKEv1']],['Cifrado fase 1',['AES-256','AES-128','3DES']],['Hash fase 1',['SHA-256','SHA-512','SHA-1']],['Grupo DH',['14','19','20','5']],['Clave precompartida',['Ok7#pX2q','Ok7#pX2Q','vpn2024!']]];
const P2=[['Red local / remota',null],['Cifrado fase 2',['AES-256','AES-128']],['PFS',['activado','desactivado']]];
const fases={
  titulo:'¿En qué fase falla la VPN?',
  alternativa:'La VPN es como dos personas que se reúnen. <b>Fase 1</b>: se identifican y acuerdan un idioma secreto (versión, cifrado, hash, grupo DH, clave). <b>Fase 2</b>: ya en confianza, acuerdan qué temas (redes) hablan y cómo. Si falla la presentación, nunca llegan a la fase 2.',
  explicacion:'Fase 1 (IKE) autentica a los dos equipos: versión, cifrado, hash, grupo DH y clave deben coincidir. Fase 2 (IPsec) acuerda qué redes viajan y cómo se cifran.',
  generar(n,rng){
    const a={},b={};for(const [k,v] of P1){a[k]=b[k]=rng.elegir(v)}
    const la=`10.${rng.entero(1,9)}.0.0/16`,lb=`192.168.${rng.entero(10,99)}.0/24`;a['Red local / remota']=`${la} → ${lb}`;b['Red local / remota']=`${lb} → ${la}`;
    for(const [k,v] of P2.slice(1)){a[k]=b[k]=rng.elegir(v)}
    // un parámetro distinto (o ninguno desde el nivel 3)
    const ninguno=n>=3&&rng.prob(.25),cambiar=ninguno?null:rng.elegir(n<=1?P1.slice(0,4):[...P1,...P2]);let fase='Levanta el túnel';
    if(cambiar){const [k,v]=cambiar;if(k==='Red local / remota')b[k]=`${lb} → 10.${rng.entero(10,19)}.0.0/16`;else b[k]=v.filter(x=>x!==a[k])[0];fase=P1.some(x=>x[0]===k)?'Falla la fase 1':'Falla la fase 2'}
    const filas=Object.keys(a).map(k=>`<tr><td>${k}</td><td>${k==='Clave precompartida'?'••••'+a[k].slice(-2):a[k]}</td><td>${k==='Clave precompartida'?'••••'+b[k].slice(-2):b[k]}</td></tr>`).join('');
    const por=cambiar?`«${cambiar[0]}» no coincide (${a[cambiar[0]]} ≠ ${b[cambiar[0]]}): es un parámetro de la ${fase.endsWith('1')?'fase 1 (IKE)':'fase 2 (IPsec)'}.`:'Todo coincide (las redes son espejo una de la otra): el túnel levanta.';
    return {...opcion(`<div class="wrap"><table><tr><th>Parámetro</th><th>Sitio A</th><th>Sitio B</th></tr>${filas}</table></div><p>¿Qué pasa al levantar la VPN?</p>`,fase,['Falla la fase 1','Falla la fase 2','Levanta el túnel'].filter(x=>x!==fase),rng),
      regla:'Fase 1 (IKE): versión, cifrado, hash, grupo DH y clave precompartida iguales. Fase 2 (IPsec): redes en espejo, cifrado y PFS iguales.',explicacion:por,porque:{},clave:filas,
      pasos:[paso('Revisa primero la fase 1','Versión IKE, cifrado, hash, grupo DH y clave: '+(cambiar&&P1.some(x=>x[0]===cambiar[0])?marca(`«${cambiar[0]}» distinto`):'todo igual ✓'),'La fase 1 autentica a los equipos: si algo no coincide, no se llega a la fase 2.'),
        ...(cambiar&&P1.some(x=>x[0]===cambiar[0])?[]:[paso('Luego la fase 2','Redes en espejo, cifrado y PFS: '+(cambiar?marca(`«${cambiar[0]}» distinto`):'todo igual ✓'),'La fase 2 decide qué redes viajan por el túnel y cómo se cifran.',{ojo:'Las redes deben ser espejo: la local de A es la remota de B.'})]),
        final('Conclusión',`<b>${fase}</b>`,por,fase)]};
  }
};

/* ---------- criptografía básica ---------- */
const NOMBRES=['Ana','Beto','Carla','Diego','Elena','Fabián'];
const cripto={
  titulo:'Hash, cifrado y firmas',
  alternativa:'La clave pública es un <b>candado abierto</b> que repartes; la privada es la <b>única llave</b>. Para mandarle algo secreto a alguien, lo cierras con SU candado. Para firmar, usas TU llave privada y cualquiera lo comprueba con tu candado público. Un hash es una huella digital: no se "descifra", se compara.',
  explicacion:'Hash: huella de un archivo (no se descifra) para comprobar integridad. Simétrico: la misma clave cifra y descifra. Asimétrico: se cifra con la pública del destinatario; se firma con la privada propia.',
  generar(n,rng){
    const [x,y]=rng.barajar(NOMBRES);
    const R='Confidencialidad: cifra con la clave PÚBLICA del destinatario. Autenticidad (firma): firma con tu clave PRIVADA; el otro verifica con tu pública. Integridad: compara hashes.';
    const casos=[
      [`${x} quiere enviarle a ${y} un archivo que solo ${y} pueda leer. ¿Con qué clave lo cifra?`,`La clave pública de ${y}`,[`La clave privada de ${x}`,`La clave pública de ${x}`,`La clave privada de ${y}`]],
      [`${x} quiere firmar un contrato para que ${y} compruebe que fue ella o él. ¿Con qué clave firma?`,`La clave privada de ${x}`,[`La clave pública de ${y}`,`La clave pública de ${x}`,`La clave privada de ${y}`]],
      [`${y} recibe un archivo firmado por ${x}. ¿Con qué clave verifica la firma?`,`La clave pública de ${x}`,[`La clave privada de ${x}`,`La clave privada de ${y}`,`La clave pública de ${y}`]],
      ['Descargaste una imagen de sistema y quieres comprobar que no la alteraron. ¿Qué usas?','Comparar su hash (p. ej. SHA-256) con el publicado',['Cifrarla con AES','Comprimirla otra vez','Descifrar su hash']],
      ['¿Qué tipo de cifrado usa la misma clave para cifrar y descifrar (como AES)?','Simétrico',['Asimétrico','Hash','Firma digital']],
      ['¿Se puede "descifrar" un hash SHA-256 para obtener el texto original?','No: un hash es de una sola vía',['Sí, con la clave privada','Sí, con la clave pública','Sí, con AES']],
      ['¿Por qué una VPN usa Diffie-Hellman en la fase 1?','Para acordar una clave secreta sin enviarla por la red',['Para comprimir el tráfico','Para firmar los paquetes','Para elegir el puerto']]
    ];
    const [enun,c,malas]=rng.elegir(n<=2?casos.slice(0,6):casos);
    const meta=/solo .* pueda leer/.test(enun)?'confidencialidad':/firm/.test(enun)?'autenticidad (firma)':/alteraron|hash/.test(enun)?'integridad':'concepto';
    return {...opcion(enun,c,rng.barajar(malas).slice(0,n<=2?2:3),rng),regla:R,porque:{},clave:enun,
      pasos:[paso('¿Qué se busca?',`Objetivo: <b>${meta}</b>`,'Cada objetivo usa una herramienta distinta: confidencialidad → cifrar; autenticidad → firmar; integridad → hash.'),
        paso('Elige la herramienta','Cifrar para alguien: SU pública · Firmar: TU privada · Verificar firma: la pública del que firmó · Integridad: comparar hash','La clave privada nunca sale de su dueño.',{ojo:'Cifrar con tu privada no oculta nada: cualquiera lo abre con tu pública.'}),
        final('Respuesta',marca(c),'Aplica la regla al caso.',c)]};
  }
};

/* ---------- registros: detectar el patrón y responder (defensivo) ---------- */
const hora=(rng,h)=>`${String(h??rng.entero(0,23)).padStart(2,'0')}:${String(rng.entero(0,59)).padStart(2,'0')}:${String(rng.entero(0,59)).padStart(2,'0')}`;
const ipExt=rng=>`${rng.elegir([45,103,185,198,203])}.${rng.entero(1,254)}.${rng.entero(0,254)}.${rng.entero(1,254)}`;
const PATRONES={
  fuerza:{nombre:'Fuerza bruta de contraseñas',defensa:'Bloquear el origen, limitar intentos y exigir doble factor; SSH solo desde la VPN',
    lineas:(rng,src)=>{const u=rng.barajar(['admin','root','test','oracle','user','backup']);return Array.from({length:5},(_,i)=>`${hora(rng,3)} sshd: Failed password for ${u[i]} from ${src} port ${rng.entero(30000,60000)}`).concat([`… ${rng.entero(300,3000)} intentos fallidos en ${rng.entero(5,15)} minutos desde ${src}`])}},
  escaneo:{nombre:'Escaneo de puertos (reconocimiento)',defensa:'Publicar solo los servicios necesarios y dejar que el IPS bloquee el origen',
    lineas:(rng,src)=>{const p=rng.barajar([21,22,23,25,53,80,110,135,139,443,445,3389]);return Array.from({length:5},(_,i)=>`${hora(rng)} DENY TCP ${src} → 200.10.10.5:${p[i]} flags=SYN`).concat([`… ${rng.entero(500,2000)} puertos distintos en ${rng.entero(5,30)} segundos desde ${src}`])}},
  flood:{nombre:'Denegación de servicio (inundación)',defensa:'Activar la protección DoS del firewall o del proveedor y limitar conexiones por origen',
    lineas:(rng)=>Array.from({length:5},()=>`${hora(rng,14)} GET / HTTP/1.1 200 from ${ipExt(rng)} → 200.10.10.80`).concat([`… ${rng.entero(20,90)} 000 peticiones por segundo desde miles de IP distintas`])},
  exfil:{nombre:'Posible fuga de datos (exfiltración)',defensa:'Aislar el equipo, revisar qué datos salieron y bloquear el destino',
    lineas:(rng,src,int)=>[`${hora(rng,2)} ALLOW ${int} → ${src}:443 sent=${rng.entero(2,9)}.${rng.entero(0,9)} GB`,`${hora(rng,2)} ALLOW ${int} → ${src}:443 sent=${rng.entero(1,5)}.${rng.entero(0,9)} GB`,`${hora(rng,3)} ALLOW ${int} → ${src}:443 sent=${rng.entero(3,9)}.${rng.entero(0,9)} GB`,`… el equipo normalmente envía menos de 50 MB al día, y esto pasa de madrugada`]},
  login:{nombre:'Acceso sospechoso tras muchos fallos',defensa:'Bloquear la cuenta, cambiar la contraseña y revisar qué hizo esa sesión',
    lineas:(rng,src)=>Array.from({length:4},()=>`${hora(rng,4)} vpn: login FAILED user=jlopez from ${src}`).concat([`${hora(rng,4)} vpn: login SUCCESS user=jlopez from ${src}`,`… el usuario jlopez nunca se conecta desde ese país ni a esa hora`])}
};
const logs={
  titulo:'Patrones en los registros',
  alternativa:'Lee el registro como un detective: <b>¿quién?</b> (IP de origen), <b>¿contra qué?</b> (destino o puerto), <b>¿cuántas veces?</b> y <b>¿cuándo?</b>. Muchos intentos de un solo origen = fuerza bruta; muchos puertos = escaneo; miles de orígenes = DoS; mucho dato saliendo de madrugada = fuga.',
  explicacion:'Muchos fallos de un mismo origen = fuerza bruta; muchos puertos distintos = escaneo; miles de peticiones = DoS; envíos enormes y raros = fuga de datos.',
  generar(n,rng){
    const claves=Object.keys(PATRONES),k=rng.elegir(n<=1?claves.slice(0,2):n<=2?claves.slice(0,3):claves),P=PATRONES[k],src=ipExt(rng),int=`10.0.${rng.entero(1,20)}.${rng.entero(2,250)}`;
    const log=P.lineas(rng,src,int).join('\n'),R='Lee el registro buscando el patrón: quién (origen), contra qué (destino/puerto), cuántas veces y cuándo. Responde conteniendo primero y luego corrigiendo la causa.';
    const modo=n>=3?rng.elegir(['patron','defensa','ip']):n===2?rng.elegir(['patron','defensa']):'patron';
    const base={codigo:log,regla:R,clave:log};
    if(modo==='ip'&&k!=='flood'){const ip=k==='exfil'?int:src;
      return {...base,enunciado:`${k==='exfil'?'¿Qué equipo INTERNO hay que aislar?':'¿Qué IP de origen bloqueas?'} (escríbela)`,respuesta:ip,verificar:e=>String(e).trim()===ip,
        errores:[{valor:'200.10.10.5',si:e=>String(e).trim().startsWith('200.10.10.'),por:'Esa es nuestra IP (el destino): se bloquea el origen del ataque.'}],pasos:[paso('Identifica el patrón',P.nombre,'Mira quién se repite y contra qué.'),final(k==='exfil'?'El equipo interno que envía los datos':'El origen que se repite',marca(ip),k==='exfil'?'En una fuga, el problema está ADENTRO: hay que aislar el equipo que envía.':'Se bloquea el origen del ataque, no nuestro servidor.',ip)]}}
    const pIdent=paso('Pregunta quién, contra qué, cuántas veces y cuándo',{fuerza:'Un solo origen, muchos usuarios distintos, muchos fallos seguidos.',escaneo:'Un solo origen, muchos puertos distintos en segundos.',flood:'Miles de orígenes distintos contra el mismo servidor.',exfil:'Un equipo interno envía gigas a un destino externo de madrugada.',login:'Muchos fallos y luego un éxito, desde un lugar raro.'}[k],'El patrón sale de esas cuatro preguntas.');
    if(modo==='defensa')return {...base,...opcion('¿Qué defensa aplicas primero?',P.defensa,rng.barajar(claves.filter(x=>x!==k).map(x=>PATRONES[x].defensa).concat(['Desactivar los registros para que no llenen el disco'])).slice(0,3),rng),porque:{},explicacion:`Es ${P.nombre.toLowerCase()}.`,
      pasos:[pIdent,paso('Nombra el patrón',marca(P.nombre),'Primero se identifica; después se responde.'),final('Contén primero',P.defensa,'Primero se detiene el daño; después se corrige la causa.',P.defensa)]};
    return {...base,...opcion('¿Qué patrón ves en este registro?',P.nombre,rng.barajar(claves.filter(x=>x!==k).map(x=>PATRONES[x].nombre)).slice(0,n<=1?2:3),rng),porque:{},
      pasos:[pIdent,final('Ponle nombre',marca(P.nombre),'Ese conjunto de señales corresponde a este patrón.',P.nombre)]};
  }
};

export default {'fw/reglas':reglas,'fw/nat':nat,'fw/marcas':marcas,'vpn/fases':fases,'vpn/cripto':cripto,'def/logs':logs};
