/* Generadores de redes: bases numéricas, puertos y protocolos, subredes, máscaras y prefijo para N hosts. Siempre simulado. */
import {igualNum,igualTexto,normalTexto} from './verificar.js';
import {paso,final,marca,c} from './pasos.js';
import {bitsSubred} from './diagramas.js';

const ip2n=ip=>ip.split('.').reduce((a,o)=>a*256+(+o),0);
const n2ip=n=>[n>>>24&255,n>>>16&255,n>>>8&255,n&255].join('.');
const mascara=p=>p===0?0:(0xFFFFFFFF<<(32-p))>>>0;
const ipValida=s=>/^\d{1,3}(\.\d{1,3}){3}$/.test(s)&&s.split('.').every(o=>+o<=255);
const limpiaIP=e=>String(e).trim().replace(/\s/g,'').replace(/\/\d+$/,'');
const igualIP=(e,ip)=>{const s=limpiaIP(e);return ipValida(s)&&ip2n(s)===ip2n(ip)};
const ipAl=(rng,privada=true)=>{const t=rng.elegir(privada?[10,172,192]:[23,45,64,80,100,131,200,203]);
  return t===10?`10.${rng.entero(0,255)}.${rng.entero(0,255)}.${rng.entero(1,254)}`:t===172?`172.${rng.entero(16,31)}.${rng.entero(0,255)}.${rng.entero(1,254)}`:t===192?`192.168.${rng.entero(0,255)}.${rng.entero(1,254)}`:`${t}.${rng.entero(0,255)}.${rng.entero(0,255)}.${rng.entero(1,254)}`};
export const calcularSubred=(ip,p)=>{const m=mascara(p),red=(ip2n(ip)&m)>>>0,bc=(red|(~m>>>0))>>>0;
  return {red:n2ip(red),broadcast:n2ip(bc),primero:p>=31?n2ip(red):n2ip(red+1),ultimo:p>=31?n2ip(bc):n2ip(bc-1),hosts:p>=31?(p===31?2:1):2**(32-p)-2,mascara:n2ip(m)}};

/* ---------- bases ---------- */
const bin=(n,b=8)=>n.toString(2).padStart(b,'0'),hex=n=>n.toString(16).toUpperCase();
const normBase=(e,base)=>{let s=String(e).trim().toLowerCase().replace(/[\s_]/g,'');if(base===2)s=s.replace(/^0b/,'');if(base===16)s=s.replace(/^0x/,'').replace(/h$/,'');return s};
const igualBase=(e,valor,base)=>{const s=normBase(e,base),ok=base===2?/^[01]+$/:base===16?/^[0-9a-f]+$/:/^\d+$/;return ok.test(s)&&parseInt(s,base)===valor};
const bases={
  titulo:'Binario, decimal y hexadecimal',
  explicacion:'Cada posición binaria vale el doble que la anterior (128, 64, 32, 16, 8, 4, 2, 1). En hexadecimal cada dígito son 4 bits (0–9 y A–F).',
  alternativa:'Imagina 8 focos en fila con etiquetas 128, 64, 32, 16, 8, 4, 2, 1. Un 1 es foco encendido. El número es la <b>suma de las etiquetas encendidas</b>: 10100000 = 128 + 32 = 160. El hexadecimal es solo una forma corta de escribir cada grupo de 4 focos con un dígito.',
  generar(n,rng){
    const R='Binario: posiciones 128-64-32-16-8-4-2-1 (de izquierda a derecha). Hexadecimal: cada dígito equivale a 4 bits; A=10 … F=15.';
    const tipos=n<=1?['d2b','b2d']:n<=3?['d2b','b2d','d2h','h2d']:['d2b','b2d','d2h','h2d','b2h','h2b'];
    const t=rng.elegir(tipos),v=n<=2?rng.entero(1,255):n<=4?rng.entero(16,255):rng.entero(256,65535),bits=v>255?16:8;
    const pos=Array.from({length:bits},(_,i)=>2**(bits-1-i)),usadas=pos.filter(x=>v&x);
    const C={d2b:[`${v}`,'binario',bin(v,bits),2],b2d:[bin(v,bits),'decimal',String(v),10],d2h:[`${v}`,'hexadecimal',hex(v),16],h2d:[`0x${hex(v)}`,'decimal',String(v),10],b2h:[bin(v,bits),'hexadecimal',hex(v),16],h2b:[`0x${hex(v)}`,'binario',bin(v,bits),2]}[t];
    const [de,a,resp,base]=C;
    const errores=[];
    if(base===2)errores.push({valor:bin(v,bits).split('').reverse().join(''),si:e=>normBase(e,2)===bin(v,bits).split('').reverse().join('').replace(/^0+/,'')||normBase(e,2)===bin(v,bits).split('').reverse().join(''),por:'Leíste los bits al revés: el de la izquierda es el de mayor valor.'});
    if(t==='b2d')errores.push({si:e=>+e===usadas.length,por:'No cuentes los unos: suma el valor de cada posición donde hay un 1.'});
    const grupos=bin(v,bits).match(/.{4}/g),HEX='0123456789ABCDEF';
    const pasoPos=paso('Escribe el valor de cada posición',`<span class="mono">${pos.map(x=>v&x?marca(x):x).join(' · ')}</span>`,'Cada posición binaria vale el doble que la de su derecha; las marcadas tienen un 1.');
    const pasoSuma=paso('Suma las posiciones que tienen 1',`${usadas.join(' + ')} = <b>${v}</b>`,'El número decimal es la suma de los valores donde hay un 1.',{ojo:'No cuentes los unos: suma sus valores.'});
    const pasoHex=paso('Agrupa de 4 en 4 bits',grupos.map(g=>`<span class="mono">${g}</span> = ${parseInt(g,2)} = ${marca(HEX[parseInt(g,2)])}`).join('<br>'),'Cada dígito hexadecimal son exactamente 4 bits (A = 10 … F = 15).');
    const pasos=t==='d2b'?[paso('Resta la potencia de 2 más grande que quepa',`${v} = ${usadas.join(' + ')}`,'Vas de 128 (o 32768) hacia abajo: si cabe, pones 1 y restas; si no, 0.'),pasoPos,final('Escribe los bits',`<span class="mono">${bin(v,bits)}</span>`,'1 donde usaste la potencia, 0 donde no.',resp,{ojo:'El bit de la izquierda es el de mayor valor.'})]
      :t==='b2d'?[pasoPos,final('Suma las posiciones que tienen 1',`${usadas.join(' + ')} = ${marca(v)}`,'El número decimal es la suma de los valores donde hay un 1.',resp,{ojo:'No cuentes los unos: suma sus valores.'})]
      :t==='d2h'?[paso('Pásalo primero a binario',`${v} = ${usadas.join(' + ')} → <span class="mono">${bin(v,bits)}</span>`,'Del binario al hexadecimal es directo.'),pasoHex,final('Junta los dígitos',`<b>${resp}</b>`,'Lee los grupos de izquierda a derecha.',resp)]
      :t==='h2d'?[paso('Cada dígito hex son 4 bits',`${[...hex(v)].map(d=>`${d} = <span class="mono">${parseInt(d,16).toString(2).padStart(4,'0')}</span>`).join(' · ')}`,'A = 10, B = 11 … F = 15.'),pasoSuma,final('Resultado',`${marca(v)}`,'Ese es el valor en decimal.',resp)]
      :t==='b2h'?[pasoHex,final('Junta los dígitos',`<b>${resp}</b>`,'Lee los grupos de izquierda a derecha.',resp)]
      :[paso('Cambia cada dígito por sus 4 bits',`${[...hex(v)].map(d=>`${d} → ${marca(parseInt(d,16).toString(2).padStart(4,'0'))}`).join(' · ')}`,'Cada dígito hexadecimal son exactamente 4 bits.'),final('Junta los grupos',`<span class="mono">${bin(v,bits)}</span>`,'Sin quitar los ceros de cada grupo.',resp)];
    return {enunciado:`Convierte <b>${de}</b> a ${a}`,respuesta:resp,verificar:e=>igualBase(e,v,base),
      pasos,
      errores,regla:R,pista:base===2?'Resta la potencia de 2 más grande que quepa y sigue.':'Suma el valor de cada posición.',teclado:'ip'};
  }
};

/* ---------- puertos ---------- */
const PUERTOS=[[22,'SSH','tcp',['ssh']],[80,'HTTP','tcp',['http','web']],[443,'HTTPS','tcp',['https','http seguro','ssl','tls']],[53,'DNS','udp',['dns']],[25,'SMTP','tcp',['smtp','correo saliente']],
  [21,'FTP','tcp',['ftp']],[23,'Telnet','tcp',['telnet']],[3389,'RDP','tcp',['rdp','escritorio remoto']],[110,'POP3','tcp',['pop3','pop']],[143,'IMAP','tcp',['imap']],[161,'SNMP','udp',['snmp']],
  [123,'NTP','udp',['ntp']],[67,'DHCP','udp',['dhcp']],[389,'LDAP','tcp',['ldap']],[445,'SMB','tcp',['smb','cifs']],[3306,'MySQL','tcp',['mysql']],[5432,'PostgreSQL','tcp',['postgresql','postgres']],
  [500,'IKE (IPsec)','udp',['ike','ipsec','isakmp']],[514,'Syslog','udp',['syslog']],[1194,'OpenVPN','udp',['openvpn']],[69,'TFTP','udp',['tftp']],[636,'LDAPS','tcp',['ldaps']],[993,'IMAPS','tcp',['imaps']],[8080,'HTTP alternativo','tcp',['http alternativo','http','proxy']]];
const puertos={
  titulo:'Puertos y servicios',
  explicacion:'Cada servicio escucha en un puerto conocido: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS… Saberlos es la base para leer reglas y registros.',
  alternativa:'La IP es la dirección de un edificio y el <b>puerto es el número de departamento</b>: 80 es la tienda web, 443 la tienda web con candado, 22 la puerta de mantenimiento (SSH), 53 la guía telefónica (DNS). TCP es como una llamada (confirma que llegó); UDP es como un mensaje rápido sin confirmación.',
  generar(n,rng){
    const lista=PUERTOS.slice(0,n<=1?5:n<=2?10:n<=3?15:PUERTOS.length),[p,s,proto,alias]=rng.elegir(lista);
    const R='Puertos más usados: 21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS (UDP), 80 HTTP, 443 HTTPS, 3389 RDP. DNS, NTP, SNMP, DHCP y Syslog van por UDP.';
    const modo=rng.elegir(n<=2?['p','s','par']:['p','s','par','proto']);
    if(modo==='par'){const pares=rng.barajar(lista).slice(0,4).map(x=>[String(x[0]),x[1]]);
      const r=pares.map(x=>x.join(' → ')).join(', ');
      return {tipo:'emparejar',enunciado:'Une cada puerto con su servicio',pares,respuesta:r,regla:R,clave:'par'+pares.map(x=>x[0]).sort().join(),
        pasos:[paso('Empieza por los que sabes seguro','Los más comunes: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS.','Al descartar los fáciles, quedan menos opciones para los difíciles.'),final('Une cada par',r,'Cada servicio tiene su puerto conocido.',r)]}}
    if(modo==='proto')return {tipo:'opcion',enunciado:`¿${s} (puerto ${p}) usa TCP o UDP?`,opciones:['TCP','UDP'],correcta:proto==='tcp'?0:1,respuesta:proto.toUpperCase(),
      porque:{[proto==='tcp'?1:0]:proto==='tcp'?`${s} necesita una conexión confiable: usa TCP.`:`${s} manda mensajes cortos sin conexión: usa UDP.`},regla:R,
      pasos:[paso('Pregúntate si necesita conexión confiable',proto==='tcp'?`${s} transfiere datos que no pueden perderse.`:`${s} manda mensajes cortos; si uno se pierde, se repite.`,'TCP confirma cada paquete (como una llamada); UDP solo envía (como un mensaje).'),
        final('Responde',`${s} → ${marca(proto.toUpperCase())}`,'DNS, NTP, SNMP, DHCP, Syslog, TFTP e IKE usan UDP; casi todo lo demás, TCP.',proto.toUpperCase())]};
    if(modo==='p')return {enunciado:`¿En qué puerto escucha <b>${s}</b>?`,respuesta:String(p),verificar:e=>igualNum(e,p),
      errores:PUERTOS.filter(x=>x[0]!==p).slice(0,6).map(x=>({valor:String(x[0]),si:e=>igualNum(e,x[0]),por:`${x[0]} es ${x[1]}.`})),pasos:[paso('Recuerda la familia del servicio',`${s} usa ${proto.toUpperCase()}`,'Ubicar el protocolo ayuda a recordar el número.'),final('Su puerto conocido',`${s} → ${marca(p)}/${proto.toUpperCase()}`,'Los puertos conocidos (0–1023) los asigna la IANA y todos los usan igual.',String(p))],regla:R,pista:`Es ${proto.toUpperCase()}.`};
    return {enunciado:`¿Qué servicio usa normalmente el puerto <b>${p}</b>?`,respuesta:s,verificar:e=>igualTexto(e,[s,...alias])||alias.includes(normalTexto(e)),
      errores:PUERTOS.filter(x=>x[0]!==p).map(x=>({valor:x[1],si:e=>alias.length&&x[3].includes(normalTexto(e))&&!alias.includes(normalTexto(e)),por:`${x[1]} usa el puerto ${x[0]}.`})).slice(0,8),
      pasos:[paso('Mira el número y el protocolo',`Puerto ${p}/${proto.toUpperCase()}`,p<1024?'Es un puerto conocido (menor que 1024): tiene un servicio estándar.':'Es un puerto registrado: lo usa un servicio muy común.'),final('Servicio',`${p} → ${marca(s)}`,'Memoriza los más usados: aparecen en reglas de firewall y en registros.',s)],regla:R,pista:`Es ${proto.toUpperCase()}.`};
  }
};

/* ---------- subredes ---------- */
const PREG={red:['la dirección de red','red'],broadcast:['la dirección de broadcast','broadcast'],primero:['el primer host utilizable','primero'],ultimo:['el último host utilizable','ultimo'],hosts:['cuántos hosts utilizables tiene','hosts']};
const prefijoDe=(n,rng)=>n===1?24:n===2?rng.entero(25,30):n===3?rng.entero(17,23):n===4?rng.elegir([8,12,16,20,22,26,27,28]):rng.entero(9,30);
const subred={
  titulo:'Subredes CIDR',
  explicacion:'La máscara separa la red de los hosts: la dirección de red tiene los bits de host en 0, el broadcast en 1; los hosts válidos están en medio (2^(32−prefijo) − 2).',
  alternativa:'Piensa en una calle con casas numeradas en bloques de igual tamaño (el "bloque": 256, 128, 64, 32…). La <b>red</b> es el primer número del bloque donde cae tu IP, el <b>broadcast</b> el último, y las casas habitables son las de en medio. Con /26 los bloques son de 64: .0, .64, .128, .192.',
  generar(n,rng){
    const p=prefijoDe(n,rng),ip=ipAl(rng),S=calcularSubred(ip,p),q=rng.elegir(n===1?['red','broadcast','hosts']:Object.keys(PREG));
    const bloque=2**((32-p)%8||8),oct=Math.floor((p-1)/8)+1;
    const R='Red = IP AND máscara (bits de host en 0). Broadcast = bits de host en 1. Hosts útiles = 2^(32 − prefijo) − 2: del primero (red + 1) al último (broadcast − 1).';
    const resp=q==='hosts'?String(S.hosts):S[q];
    const pasos=[paso('Escribe la máscara',`/${p} → ${p} unos y ${32-p} ceros → <b>${S.mascara}</b>`,`El prefijo dice cuántos bits son de red; el bloque es ${bloque} en el octeto ${oct}.`),
      paso('Pon la IP y la máscara en binario y haz AND',bitsSubred(ip,p),'AND bit a bit: 1 AND 1 = 1, cualquier otra cosa da 0. Así se borran los bits de host.',{ojo:'Solo cambia el octeto donde termina la máscara; los de antes quedan igual y los de después en 0.'}),
      paso('Dirección de red',`Bits de host en 0 → ${marca(S.red)}`,`Es el múltiplo de ${bloque} más cercano por debajo en el octeto ${oct}.`),
      paso('Broadcast',`Bits de host en 1 → ${marca(S.broadcast)}`,`Red + bloque − 1 en el octeto ${oct}.`),
      paso('Rango de hosts',`${S.primero} – ${S.ultimo}`,'Del primero (red + 1) al último (broadcast − 1).'),
      paso('Cuenta los hosts',`\\(2^{${32-p}} - 2 = ${S.hosts}\\)`,'Se restan la dirección de red y la de broadcast, que no se asignan a equipos.'),
      final('Responde',`${PREG[q][0][0].toUpperCase()+PREG[q][0].slice(1)}: <b>${resp}</b>`,'Con estos datos se responde cualquier pregunta sobre la subred.',resp)];
    const errores=[];
    // Confundir el prefijo con /24 o /16 (el error más común)
    for(const otro of [24,16].filter(x=>x!==p)){const O=calcularSubred(ip,otro);if(q!=='hosts'&&O[q]!==S[q])errores.push({valor:O[q],si:e=>igualIP(e,O[q]),por:`Ese resultado corresponde a /${otro}: aquí el prefijo es /${p} (máscara ${S.mascara}).`});
      if(q==='hosts'&&O.hosts!==S.hosts)errores.push({valor:String(O.hosts),si:e=>igualNum(e,O.hosts),por:`Eso son los hosts de un /${otro}; con /${p} son 2^${32-p} − 2.`})}
    if(q==='primero')errores.push({valor:S.red,si:e=>igualIP(e,S.red),por:'Esa es la dirección de red: el primer host es la red + 1.'});
    if(q==='ultimo')errores.push({valor:S.broadcast,si:e=>igualIP(e,S.broadcast),por:'Esa es la dirección de broadcast: el último host es el broadcast − 1.'});
    if(q==='red')errores.push({valor:S.primero,si:e=>igualIP(e,S.primero),por:'Ese es el primer host; la red termina con los bits de host en 0.'});
    if(q==='hosts')errores.push({valor:String(2**(32-p)),si:e=>igualNum(e,2**(32-p)),por:'Hay que restar 2: la dirección de red y la de broadcast no se asignan.'});
    const pasoMal=q==='broadcast'?{i:3,texto:`Bits de host en 1 → ${S.ultimo}`,por:'ese es el último host, no el broadcast.'}:undefined;
    return {enunciado:`Para <b>${ip}/${p}</b>, ¿${PREG[q][0]}?`,respuesta:resp,verificar:e=>q==='hosts'?igualNum(e,S.hosts):igualIP(e,S[q]),
      pasos,pasoMal,errores,regla:R,pista:`El bloque es ${bloque}: busca el múltiplo de ${bloque} más cercano por debajo.`,teclado:'ip'};
  }
};

// Máscara ↔ prefijo (y wildcard en el nivel 5)
const mascaras={
  titulo:'Máscara de subred',
  explicacion:'/24 = 255.255.255.0; cada bit más en el último octeto suma 128, 64, 32, 16, 8, 4 (/25 = .128, /26 = .192, /27 = .224, /28 = .240, /29 = .248, /30 = .252).',
  alternativa:'El prefijo dice <b>cuántos unos</b> hay de izquierda a derecha en los 32 bits. Cada 8 unos son un 255. Los que sobran se llenan en el siguiente octeto sumando 128 + 64 + 32…: 3 unos = 128 + 64 + 32 = 224.',
  generar(n,rng){
    const p=n<=2?rng.entero(24,30):n===3?rng.entero(16,23):rng.entero(8,30),m=n2ip(mascara(p)),w=n2ip((~mascara(p))>>>0);
    const R='Máscara: el prefijo dice cuántos bits en 1 hay de izquierda a derecha. En un octeto: 128, 192, 224, 240, 248, 252, 254, 255.';
    const modo=n===5?rng.elegir(['p2m','m2p','wild']):rng.elegir(['p2m','m2p']);
    if(modo==='wild')return {enunciado:`¿Cuál es la máscara wildcard (inversa) de <b>/${p}</b>?`,respuesta:w,verificar:e=>igualIP(e,w),pasos:[paso('Escribe la máscara',`/${p} = ${m}`,'Primero la máscara normal.'),final('Resta cada octeto de 255',m.split('.').map(o=>`255 − ${o} = ${marca(255-o)}`).join(' · ')+` → <b>${w}</b>`,'La wildcard cambia los 0 por 1 y al revés.',w)],
      errores:[{valor:m,si:e=>igualIP(e,m),por:'Esa es la máscara normal; la wildcard es su inversa (los 0 y los 1 cambiados).'}],regla:'Wildcard = 255.255.255.255 − máscara (la usan las ACL de Cisco).',pista:'Resta cada octeto de 255.',teclado:'ip'};
    if(modo==='m2p')return {enunciado:`¿Qué prefijo corresponde a la máscara <b>${m}</b>?`,respuesta:`/${p}`,verificar:e=>igualNum(String(e).replace('/',''),p),
      pasos:[paso('Pasa cada octeto a binario',`<span class="mono">${m.split('.').map(o=>(+o).toString(2).padStart(8,'0')).join('.')}</span>`,'Cada 255 son 8 unos; 0 son 8 ceros.'),final('Cuenta los unos',`${m.split('.').map(o=>(+o).toString(2).split('1').length-1).join(' + ')} = ${marca('/'+p)}`,'El prefijo es el total de bits en 1.',`/${p}`)],errores:[{valor:`/${p-8}`,si:e=>igualNum(String(e).replace('/',''),p-8)&&p>8,por:'Cuenta también los 8 bits de cada octeto 255.'}],regla:R,pista:'Cada 255 son 8 bits.',teclado:'ip'};
    return {enunciado:`¿Qué máscara corresponde a <b>/${p}</b>?`,respuesta:m,verificar:e=>igualIP(e,m),
      pasos:[paso('Reparte los unos en octetos',`${p} = ${Math.floor(p/8)} × 8${p%8?` + ${p%8}`:''}`,'Cada octeto completo de unos vale 255.'),
        ...(p%8?[paso('Suma los bits del octeto incompleto',`${[128,64,32,16,8,4,2].slice(0,p%8).join(' + ')} = ${marca(256-2**(8-p%8))}`,'Los bits se llenan de izquierda a derecha: 128, 64, 32…')]:[]),
        final('Escribe la máscara',`<b>${m}</b>`,'Los octetos que sobran quedan en 0.',m)],
      errores:[...[16,24].filter(x=>x!==p).map(x=>({valor:n2ip(mascara(x)),si:e=>igualIP(e,n2ip(mascara(x))),por:`Esa es la máscara de /${x}.`})),{valor:w,si:e=>igualIP(e,w),por:'Esa es la wildcard (inversa).'}],
      regla:R,pista:'Los bits sobrantes valen 128, 64, 32… y se suman.',teclado:'ip'};
  }
};

// ¿Qué prefijo necesito para N hosts? / ¿cuántos hosts tiene un /x? / ¿cuántas subredes /y caben en un /x?
const prefijoHosts={
  titulo:'Prefijo para N hosts',
  explicacion:'Con b bits de host caben 2^b − 2 equipos. Para N hosts, busca la menor potencia de 2 tal que 2^b − 2 ≥ N; el prefijo es 32 − b.',
  alternativa:'Es como elegir una caja: las cajas vienen en tamaños 4, 8, 16, 32, 64… (potencias de 2), pero a cada una le quitas 2 lugares (red y broadcast). Escoge la caja más chica en la que quepan tus equipos. Los bits que no son de host son el prefijo.',
  generar(n,rng){
    const R='Hosts por subred = 2^(32 − prefijo) − 2. Subredes /y dentro de un /x = 2^(y − x).';
    const modo=n<=2?'n2p':n===3?rng.elegir(['n2p','p2n']):rng.elegir(['n2p','p2n','sub']);
    if(modo==='sub'){const x=rng.entero(16,26),y=x+rng.entero(1,4),r=2**(y-x);
      return {enunciado:`¿Cuántas subredes /${y} caben en una red /${x}?`,respuesta:String(r),verificar:e=>igualNum(e,r),pasos:[paso('Cuenta los bits prestados',`${y} − ${x} = ${y-x}`,'Son los bits que pasan de host a red.'),final('Eleva 2 a esos bits',`\\(2^{${y-x}} = ${c(r)}\\)`,'Cada bit prestado duplica el número de subredes.',String(r))],
        errores:[{valor:String(y-x),si:e=>igualNum(e,y-x)&&y-x!==r,por:`Ese es el número de bits prestados; las subredes son 2 elevado a eso.`}],regla:R,pista:'Cuenta los bits que tomas prestados.'}}
    if(modo==='p2n'){const p=rng.entero(n===3?22:16,30),h=2**(32-p)-2;
      return {enunciado:`¿Cuántos hosts utilizables tiene una subred <b>/${p}</b>?`,respuesta:String(h),verificar:e=>igualNum(e,h),pasos:[paso('Bits de host',`32 − ${p} = ${32-p}`,'Lo que no es prefijo es para hosts.'),final('Combinaciones menos 2',`\\(2^{${32-p}} - 2 = ${c(h)}\\)`,'Red y broadcast no se asignan.',String(h),{ojo:'No olvides restar 2.'})],
        errores:[{valor:String(h+2),si:e=>igualNum(e,h+2),por:'Resta 2: la dirección de red y el broadcast no son hosts.'}],regla:R,pista:'Bits de host = 32 − prefijo.'}}
    const N=n===1?rng.entero(3,60):n===2?rng.entero(10,250):rng.entero(100,4000);let b=2;while(2**b-2<N)b++;const p=32-b;
    return {enunciado:`Necesitas <b>${N}</b> hosts en una subred. ¿Qué prefijo es el más pequeño que alcanza?`,respuesta:`/${p}`,verificar:e=>igualNum(String(e).replace('/',''),p),
      pasos:[paso('Prueba potencias de 2',`\\(2^{${b-1}} - 2 = ${2**(b-1)-2}\\) no alcanza; \\(2^{${b}} - 2 = ${c(2**b-2)} \\ge ${N}\\)`,'Busca el menor número de bits de host que alcance.'),
        final('Prefijo = 32 − bits de host',`32 − ${b} = ${marca('/'+p)}`,'Los bits que no son de host son de red.',`/${p}`)],
      errores:[{valor:`/${p+1}`,si:e=>igualNum(String(e).replace('/',''),p+1),por:`/${p+1} solo da ${2**(b-1)-2} hosts: no alcanza.`},{valor:`/${b}`,si:e=>igualNum(String(e).replace('/',''),b)&&b!==p,por:`${b} son los bits de host; el prefijo es 32 − ${b}.`}],
      regla:R,pista:'Recuerda restar 2 (red y broadcast).',teclado:'ip'};
  }
};

export default {'red/bases':bases,'red/puertos':puertos,'red/subred':subred,'red/mascara':mascaras,'red/prefijo-hosts':prefijoHosts};
