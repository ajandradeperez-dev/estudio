/* Generadores de Fundamentos de redes (parte 2): modelos OSI y TCP/IP, direcciones IPv4 y clases, VLSM, IPv6, DNS, DHCP y
   ARP. Siempre simulado y defensivo. Cada pregunta trae comprobar() con un cálculo independiente. Sin DOM. */
import {num,igualNum,igualTexto,normalTexto} from './verificar.js';
import {paso,final,c,marca} from './pasos.js';
import {plantillas,malNum} from './algebra-temas.js';
import {ip2n,n2ip,mascara,igualIP,ipValida,calcularSubred} from './redes.js';

const esSi=e=>/^\s*(s[ií])(?![a-zñáéíóú])/i.test(String(e).trim()),esNo=e=>/^\s*no(?![a-zñáéíóú])/i.test(String(e).trim());
// Pregunta de texto: acepta alternativas; los errores son respuestas de otros ítems del catálogo
const txt=(enunciado,resp,alt,pasos,errores,extra={})=>({enunciado,respuesta:resp,verificar:e=>igualTexto(e,[resp,...alt]),pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:resp}],
  errores:errores.filter(([v])=>!igualTexto(v,[resp,...alt])).map(([v,por])=>({valor:v,si:e=>igualTexto(e,[v]),por})),comprobar:extra.comprobar||(()=>true),...extra});
const nQ=(enunciado,v,pasos,errores,comprobar,extra={})=>({enunciado,respuesta:String(v),verificar:e=>igualNum(String(e).replace(/[a-z/]+$/i,'').trim(),v),pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:String(v)}],errores:errores.filter(e=>Math.abs(num(e.valor)-v)>1e-9),comprobar,...extra});
const ipQ=(enunciado,ip,pasos,errores,comprobar)=>({enunciado,respuesta:ip,verificar:e=>igualIP(e,ip),teclado:'ip',pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:ip}],errores:errores.filter(([v])=>v!==ip).map(([v,por])=>({valor:v,si:e=>igualIP(e,v),por})),comprobar});
const siNoQ=(enunciado,si,pasos,porMal,comprobar)=>({enunciado:enunciado+' Responde sí o no.',respuesta:si?'Sí':'No',verificar:si?esSi:esNo,pasos:[...pasos.slice(0,-1),{...pasos.at(-1),res:si?'Sí':'No'}],errores:[{valor:si?'No':'Sí',si:si?esNo:esSi,por:porMal}],comprobar});

/* ---------- Modelos OSI y TCP/IP ---------- */
const CAPAS=[null,['Física','bits'],['Enlace de datos','trama'],['Red','paquete'],['Transporte','segmento'],['Sesión','datos'],['Presentación','datos'],['Aplicación','datos']];
const ALIAS={1:['fisica','física','capa fisica'],2:['enlace','enlace de datos','capa de enlace'],3:['red','capa de red'],4:['transporte','capa de transporte'],5:['sesion','sesión'],6:['presentacion','presentación'],7:['aplicacion','aplicación']};
const PROT=[['HTTP',7],['DNS',7],['SMTP',7],['FTP',7],['SSH',7],['DHCP',7],['TLS',6],['TCP',4],['UDP',4],['IP',3],['ICMP (ping)',3],['OSPF',3],['Ethernet',2],['ARP',2],['Wi-Fi (802.11)',2],['PPP',2]];
const DISP=[['Router',3],['Switch',2],['Hub',1],['Tarjeta de red (NIC)',2],['Repetidor',1],['Firewall de red',3],['Punto de acceso Wi-Fi',2],['Cable UTP',1]];
const TCPIP={1:'Acceso a la red',2:'Acceso a la red',3:'Internet',4:'Transporte',5:'Aplicación',6:'Aplicación',7:'Aplicación'};
const FALLAS=[['El cable de red está desconectado',1],['Dos equipos tienen la misma dirección MAC',2],['La puerta de enlace (gateway) está mal configurada',3],['Un puerto TCP está bloqueado',4],['El navegador muestra un error 404',7],['El certificado TLS expiró',6],['La fibra está doblada y pierde señal',1],['La tabla de rutas no tiene ruta al destino',3],['El switch tiene el puerto en otra VLAN',2],['El servicio DNS no responde',7]];
const osi={
  titulo:'Modelos OSI y TCP/IP',
  explicacion:'El modelo OSI tiene 7 capas: 1 Física, 2 Enlace de datos, 3 Red, 4 Transporte, 5 Sesión, 6 Presentación y 7 Aplicación. El modelo TCP/IP las agrupa en 4: Acceso a la red (1–2), Internet (3), Transporte (4) y Aplicación (5–7). Cada capa tiene su PDU: bits, trama, paquete, segmento y datos.',
  alternativa:'Piensa en enviar una carta: escribes el mensaje (aplicación), lo metes en un sobre con el número de departamento (transporte, el puerto), le pones la dirección de la casa (red, la IP), el cartero lo lleva por calles concretas (enlace, la MAC) y el camión mueve el papel físicamente (física).',
  referencia:'Ver: Cisco Networking Academy, CCNA 1, módulo 3; Tanenbaum, Redes de computadoras, cap. 1.',
  item:true,profundidad:n=>n<=3?'basico':'procedimiento',
  generar(n,rng){
    const capaQ=(enun,k,porque)=>{const nombre=CAPAS[k][0];return txt(enun+' (escribe el nombre de la capa)',nombre,ALIAS[k],[paso('Recuerda qué hace cada capa',porque,'Cada capa tiene una función.'),final('Capa',`Capa ${k}: ${marca(nombre)}`,'Modelo OSI.')],
      [[CAPAS[k===7?6:k+1][0],'Esa es la capa de arriba.'],[CAPAS[k===1?2:k-1][0],'Esa es la capa de abajo.'],[CAPAS[(k+2)%7+1][0],'Revisa la función de cada capa.']],{clave:enun})};
    const numQ=(enun,k,porque)=>nQ(enun+' (escribe el número de capa OSI)',k,[paso('Función',porque,'Ubica la función.'),final('Número de capa',`Capa ${marca(k)} (${CAPAS[k][0]})`,'Modelo OSI.')],[malNum(k===7?6:k+1,'Esa es la capa de arriba.'),malNum(k===1?2:k-1,'Esa es la capa de abajo.'),malNum(8-k,'Las capas se cuentan desde la física (1).')],()=>k>=1&&k<=7,{clave:enun});
    const P={
      1:{'nombre-capa':()=>{const k=rng.entero(1,7);return capaQ(`¿Cómo se llama la capa ${k} del modelo OSI?`,k,`Capa ${k}`)},
         'numero-capa':()=>{const k=rng.entero(1,7);return numQ(`¿Qué número de capa es la capa de ${CAPAS[k][0]}?`,k,CAPAS[k][0])},
         'pdu':()=>{const k=rng.entero(1,4);return txt(`¿Cómo se llama la unidad de datos (PDU) de la capa ${k} (${CAPAS[k][0]})?`,CAPAS[k][1],[CAPAS[k][1]+'s','el '+CAPAS[k][1],'la '+CAPAS[k][1]],[paso('PDU por capa','4 segmento · 3 paquete · 2 trama · 1 bits','Cada capa encapsula lo de arriba.'),final('PDU',marca(CAPAS[k][1]),'Encapsulamiento.')],[['paquete','El paquete es de la capa 3.'],['trama','La trama es de la capa 2.'],['segmento','El segmento es de la capa 4.'],['bits','Los bits son de la capa 1.']],{clave:'pdu'+k})}},
      2:{'protocolo':()=>{const [p,k]=rng.elegir(PROT);return numQ(`¿En qué capa OSI trabaja ${p}?`,k,`${p}: ${k===7?'servicio que usa directamente la aplicación':k===4?'transporte de extremo a extremo (puertos)':k===3?'direccionamiento y ruteo entre redes':k===2?'entrega dentro de la red local (MAC)':'formato y cifrado de los datos'}`)},
         'dispositivo':()=>{const [d,k]=rng.elegir(DISP);return numQ(`¿En qué capa OSI trabaja principalmente un(a) ${d}?`,k,`${d}: ${k===3?'decide rutas con direcciones IP':k===2?'reenvía tramas usando direcciones MAC':'solo mueve señales eléctricas o de luz'}`)},
         'pdu-a-capa':()=>{const k=rng.entero(1,4);return numQ(`¿Qué capa usa como PDU el/la ${CAPAS[k][1]}?`,k,`${CAPAS[k][1]}`)}},
      3:{'tcpip':()=>{const k=rng.entero(1,7);return txt(`¿A qué capa del modelo TCP/IP corresponde la capa ${k} (${CAPAS[k][0]}) del OSI?`,TCPIP[k],TCPIP[k]==='Acceso a la red'?['acceso a red','enlace','acceso al medio','interfaz de red']:TCPIP[k]==='Internet'?['red','capa de internet']:[],[paso('TCP/IP agrupa las capas','Aplicación (5–7) · Transporte (4) · Internet (3) · Acceso a la red (1–2)','4 capas.'),final('Correspondencia',marca(TCPIP[k]),'TCP/IP.')],[['Aplicación','Solo las capas 5–7 son Aplicación.'],['Internet','Internet es la capa 3 del OSI.'],['Transporte','Transporte es la 4.'],['Acceso a la red','Acceso a la red son las capas 1–2.']],{clave:'tcpip'+k})},
         'que-direccion':()=>{const [q,k,r]=rng.elegir([['la dirección MAC',2,'Enlace de datos'],['la dirección IP',3,'Red'],['el número de puerto',4,'Transporte']]);return capaQ(`¿Qué capa OSI agrega ${q} al encapsular?`,k,`${q} → capa ${k}`)},
         'protocolo':()=>{const [p,k]=rng.elegir(PROT);return numQ(`¿En qué capa OSI trabaja ${p}?`,k,`${p}`)}},
      4:{'diagnostico':()=>{const [f,k]=rng.elegir(FALLAS);return numQ(`Diagnóstico: "${f}". ¿En qué capa OSI está el problema?`,k,`${f}`)},
         'encapsular':()=>{const orden=['datos','segmento','paquete','trama','bits'];return txt('Escribe en orden las PDU al encapsular, de la aplicación hasta el cable (separadas por coma).',orden.join(', '),[orden.join(' '),orden.join(','),orden.join(' - ')],[paso('Cada capa envuelve a la de arriba','datos → + puerto = segmento → + IP = paquete → + MAC = trama → bits','Encapsulamiento.'),final('Orden',marca(orden.join(', ')),'De arriba hacia abajo.')],[['bits, trama, paquete, segmento, datos','Ese es el orden al desencapsular (recibir).'],['datos, paquete, segmento, trama, bits','El segmento (capa 4) va antes que el paquete (capa 3).']],{clave:'encapsular'})},
         'desencapsular':()=>{const k=rng.entero(2,4),quita={2:'la cabecera de la trama (MAC)',3:'la cabecera IP',4:'la cabecera TCP/UDP (puertos)'}[k];return numQ(`Al recibir un mensaje, ¿qué capa quita ${quita}?`,k,`${quita}`)}},
      5:{'diagnostico':()=>{const [f,k]=rng.elegir(FALLAS);return numQ(`Diagnóstico: "${f}". ¿En qué capa OSI está el problema?`,k,`${f}`)},
         'encapsular':()=>P[4]['encapsular'](),
         'tcpip':()=>P[3]['tcpip']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'OSI: 1 Física (bits), 2 Enlace (trama, MAC), 3 Red (paquete, IP), 4 Transporte (segmento, puertos), 5 Sesión, 6 Presentación, 7 Aplicación. TCP/IP: Acceso a la red, Internet, Transporte, Aplicación.',pista:'¿Usa MAC, IP, puertos o es una aplicación?',...x};
  }
};

/* ---------- Direcciones IP y clases ---------- */
const claseDe=o=>o<128?'A':o<192?'B':o<224?'C':o<240?'D':'E';
const privada=ip=>{const [a,b]=ip.split('.').map(Number);return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168)};
const ipv4={
  titulo:'Direcciones IP y clases',
  explicacion:'Una IPv4 son 4 octetos (0–255). Por el primer octeto: clase A (1–126), B (128–191), C (192–223), D multicast (224–239), E (240–255). Rangos privados (RFC 1918): 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16. Especiales: 127.x loopback y 169.254.x APIPA (sin DHCP).',
  alternativa:'Las direcciones privadas son como las extensiones telefónicas de una oficina: se repiten en muchas empresas y no se marcan desde afuera. Las públicas son el número directo, único en todo Internet.',
  referencia:'Ver: RFC 1918; Cisco CCNA 1, módulo 11.',
  item:true,profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.entero(a,b);
    const P={
      1:{'clase':()=>{const o=rng.elegir([r(1,126),r(128,191),r(192,223),r(224,239)]),ip=`${o}.${r(0,255)}.${r(0,255)}.${r(1,254)}`,cl=claseDe(o);return txt(`¿De qué clase es la dirección ${ip}?`,cl,[`clase ${cl}`],[paso('Mira el primer octeto',`${marca(o)}`,'Define la clase.'),final('Rango',`${o} está en el rango de la clase ${marca(cl)}`,'A 1–126, B 128–191, C 192–223, D 224–239.')],[['A','La A es 1–126.'],['B','La B es 128–191.'],['C','La C es 192–223.'],['D','La D (multicast) es 224–239.']],{clave:ip,comprobar:()=>cl===claseDe(+ip.split('.')[0])})},
         'privada':()=>{const ip=rng.elegir([`10.${r(0,255)}.${r(0,255)}.${r(1,254)}`,`172.${r(16,31)}.${r(0,255)}.${r(1,254)}`,`192.168.${r(0,255)}.${r(1,254)}`,`172.${rng.elegir([15,32,40])}.${r(0,255)}.${r(1,254)}`,`8.8.${r(0,8)}.${r(1,8)}`,`192.169.${r(0,255)}.${r(1,254)}`]),pr=privada(ip);return siNoQ(`¿${ip} es una dirección privada?`,pr,[paso('Rangos privados (RFC 1918)','10.0.0.0/8 · 172.16.0.0–172.31.255.255 · 192.168.0.0/16','Solo esos.'),final(pr?'Está en un rango privado':'No está en ningún rango privado',ip,'Pública si no está en esos rangos.')],pr?'Está dentro de un rango RFC 1918.':'Revisa los límites: 172.16–172.31 y 192.168 exactos.',()=>pr===privada(ip))},
         'especial':()=>{const [ip,t,alt]=rng.elegir([[`127.0.0.${r(1,9)}`,'loopback',['localhost','bucle local','bucle invertido']],[`169.254.${r(1,254)}.${r(1,254)}`,'APIPA',['apipa','autoconfiguracion','link-local','enlace local']],['255.255.255.255','broadcast',['difusion','difusión']],[`224.0.0.${r(1,20)}`,'multicast',['multidifusion','multidifusión']]]);return txt(`¿Qué tipo de dirección especial es ${ip}? (loopback, APIPA, broadcast o multicast)`,t,alt,[paso('Rangos especiales','127.x loopback · 169.254.x APIPA · 224–239 multicast · 255.255.255.255 broadcast','Se reconocen por el inicio.'),final('Tipo',marca(t),t==='APIPA'?'Aparece cuando un equipo no obtiene IP por DHCP.':'Uso especial.')],[['loopback','Loopback es 127.x.'],['APIPA','APIPA es 169.254.x.'],['broadcast','Broadcast limitado es 255.255.255.255.'],['multicast','Multicast es 224–239.']],{clave:t})}},
      2:{'mascara-defecto':()=>{const cl=rng.elegir(['A','B','C']),m={A:'255.0.0.0',B:'255.255.0.0',C:'255.255.255.0'}[cl];return ipQ(`¿Cuál es la máscara por defecto de una red clase ${cl}?`,m,[paso('Octetos de red por clase','A: 1 · B: 2 · C: 3','Clases con máscara fija (classful).'),final('Máscara',marca(m),`/${{A:8,B:16,C:24}[cl]}`)],[['255.0.0.0','Esa es la de clase A.'],['255.255.0.0','Esa es la de clase B.'],['255.255.255.0','Esa es la de clase C.']],()=>true)},
         'rango-privado':()=>{const [ip,red]=rng.elegir([[`10.${r(0,255)}.${r(0,255)}.${r(1,254)}`,'10.0.0.0'],[`172.${r(16,31)}.${r(0,255)}.${r(1,254)}`,'172.16.0.0'],[`192.168.${r(0,255)}.${r(1,254)}`,'192.168.0.0']]);return ipQ(`¿A qué bloque privado RFC 1918 pertenece ${ip}? (escribe la dirección de inicio del bloque)`,red,[paso('Los tres bloques','10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16','RFC 1918.'),final('Bloque',marca(red),'Inicio del bloque.')],[['10.0.0.0','Ese bloque es solo 10.x.'],['172.16.0.0','Ese es 172.16–172.31.'],['192.168.0.0','Ese es 192.168.x.']],()=>privada(ip))},
         'hosts-clase':()=>{const cl=rng.elegir(['A','B','C']),h={A:2**24-2,B:2**16-2,C:254}[cl];return nQ(`¿Cuántos hosts utilizables tiene una red clase ${cl} completa (máscara por defecto)?`,h,[paso('Bits de host',`${{A:24,B:16,C:8}[cl]} bits`,'32 − bits de red.'),final('2ⁿ − 2',marca(h),'Se restan red y broadcast.')],[malNum(h+2,'Resta la red y el broadcast.'),malNum({A:2**24,B:2**16,C:256}[cl]/2,'Son 2ⁿ − 2.'),malNum(cl==='C'?255:h-1,'Se restan dos direcciones.')],()=>h===2**({A:24,B:16,C:8}[cl])-2,{clave:'hosts'+cl})}},
      3:{'red-classful':()=>{const o=rng.elegir([r(1,126),r(128,191),r(192,223)]),ip=`${o}.${r(0,255)}.${r(0,255)}.${r(1,254)}`,p={A:8,B:16,C:24}[claseDe(o)],red=calcularSubred(ip,p).red;return ipQ(`Con la máscara por defecto de su clase, ¿cuál es la dirección de red de ${ip}?`,red,[paso('Clase y máscara',`Clase ${claseDe(o)} → /${p}`,'Por el primer octeto.'),final('Pon en 0 los octetos de host',marca(red),'Dirección de red.')],[[calcularSubred(ip,24).red,'Esa máscara (/24) no es la de su clase.'],[calcularSubred(ip,16).red,'Revisa la clase.'],[ip,'Pon en cero la parte de host.']],()=>(ip2n(red)&mascara(p))>>>0===ip2n(red))},
         'misma-red':()=>{const p=rng.elegir([24,25,26,27,28,16]),a=`192.168.${r(0,255)}.${r(1,254)}`,mismo=rng.prob(.5),b=mismo?n2ip((ip2n(calcularSubred(a,p).red)+r(1,2**(32-p)-2))>>>0):n2ip((ip2n(calcularSubred(a,p).red)+2**(32-p)+r(1,10))>>>0),igual=calcularSubred(a,p).red===calcularSubred(b,p).red;
          return siNoQ(`Con máscara /${p}, ¿están ${a} y ${b} en la misma red?`,igual,[paso('Red de cada una',`${a} → ${calcularSubred(a,p).red}; ${b} → ${calcularSubred(b,p).red}`,'AND con la máscara.'),final(igual?'Misma red':'Redes distintas',igual?'Pueden comunicarse sin router.':'Necesitan un router.','Compara las direcciones de red.')],'Calcula la dirección de red de cada una con la máscara.',()=>igual===((ip2n(a)&mascara(p))===(ip2n(b)&mascara(p))))},
         'publica-privada':()=>P[1]['privada']()},
      4:{'misma-red':()=>P[3]['misma-red'](),'red-classful':()=>P[3]['red-classful'](),'hosts-clase':()=>P[2]['hosts-clase']()},
      5:{'misma-red':()=>P[3]['misma-red'](),'red-classful':()=>P[3]['red-classful'](),'rango-privado':()=>P[2]['rango-privado']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'Clases por el primer octeto (A 1–126, B 128–191, C 192–223). Privadas: 10/8, 172.16/12, 192.168/16. 127.x loopback, 169.254.x APIPA.',pista:'Mira el primer octeto.',...x};
  }
};

/* ---------- VLSM ---------- */
const bloqueDe=h=>{let b=4;while(b-2<h)b*=2;return b};
const vlsm={
  titulo:'VLSM',
  explicacion:'VLSM (máscaras de longitud variable) reparte una red en subredes de distinto tamaño: ordena los requerimientos de mayor a menor, a cada uno le das el bloque más chico que alcance (2ⁿ − 2 ≥ hosts) y vas asignando desde el inicio de la red, una subred después de la otra.',
  alternativa:'Es como repartir terrenos de un lote: primero ubicas la casa más grande, luego la siguiente, y cada una empieza donde terminó la anterior. Si empezaras por las chicas, quedarían huecos donde la grande ya no cabe.',
  referencia:'Ver: Cisco CCNA 1, módulo 11 (VLSM).',
  profundidad:n=>n===1?'basico':'procedimiento',
  generar(n,rng){
    const base=`192.168.${rng.entero(0,250)}.0`;
    const reqs=Array.from({length:n<=2?2:n<=4?3:4},()=>rng.elegir([2,5,10,12,20,25,28,30,45,50,60,100])).sort((a,b)=>b-a);
    if(reqs.reduce((s,h)=>s+bloqueDe(h),0)>256)reqs.splice(1);
    const asig=[];let cur=ip2n(base);for(const h of reqs){const b=bloqueDe(h);asig.push({h,b,p:32-Math.log2(b),red:n2ip(cur),bc:n2ip(cur+b-1)});cur+=b}
    const lista=reqs.map((h,i)=>`${String.fromCharCode(65+i)}: ${h} hosts`).join(', ');
    const ctx=`Red ${base}/24 · subredes: ${lista} (ya ordenadas de mayor a menor).`;
    const P={
      1:{'bloque':()=>{const h=rng.elegir([2,5,10,14,20,30,50,60,100,120]),b=bloqueDe(h);return nQ(`¿De qué tamaño (direcciones) es el bloque más chico para ${h} hosts?`,b,[paso('Busca 2ⁿ − 2 ≥ '+h,`2ⁿ = ${b}: ${b} − 2 = ${b-2} ≥ ${h}`,'Se restan red y broadcast.'),final('Bloque',marca(b),'Potencia de 2.')],[malNum(b/2,'Con '+b/2+' solo caben '+(b/2-2)+' hosts.'),malNum(h+2,'Debe ser potencia de 2.'),malNum(b*2,'Hay uno más chico que alcanza.')],()=>b-2>=h&&b/2-2<h,{clave:'b'+h})},
         'prefijo':()=>{const h=rng.elegir([2,5,10,14,20,30,50,60,100,120]),b=bloqueDe(h),p=32-Math.log2(b);return nQ(`¿Qué prefijo (/n) necesita una subred de ${h} hosts?`,p,[paso('Bloque',`${b} direcciones (${Math.log2(b)} bits de host)`,'2ⁿ − 2 ≥ hosts.'),final('Prefijo',`/${marca(p)}`,'32 − bits de host.')],[malNum(p+1,'Con /'+(p+1)+' no alcanza.'),malNum(p-1,'Hay uno más ajustado.'),malNum(Math.log2(b),'Eso son los bits de host; el prefijo es 32 − eso.')],()=>2**(32-p)-2>=h&&2**(31-p)-2<h,{clave:'p'+h})},
         'orden':()=>{const hs=[...reqs].sort(()=>rng.sig()-0.5),mayor=Math.max(...hs);return nQ(`Al aplicar VLSM con subredes de ${hs.join(', ')} hosts, ¿cuántos hosts tiene la que se asigna PRIMERO?`,mayor,[paso('Ordena de mayor a menor',`${[...hs].sort((a,b)=>b-a).join(' → ')}`,'Así no quedan huecos.'),final('Primera',marca(mayor),'La más grande.')],[malNum(Math.min(...hs),'Se empieza por la MÁS grande.'),malNum(hs[0],'No es el orden en que aparecen.')],()=>mayor===Math.max(...reqs),{clave:'o'+hs.join('-')})}},
      2:{'primera':()=>ipQ(`${ctx} ¿Cuál es la dirección de red de la subred A?`,asig[0].red,[paso('La primera empieza al inicio de la red',`${base}`,'Desde el principio.'),final('Red de A',`${marca(asig[0].red)}/${asig[0].p}`,'Bloque de '+asig[0].b+'.')],[[n2ip(ip2n(base)+1),'Esa es la primera IP de host, no la red.'],[asig[0].bc,'Ese es el broadcast.']],()=>asig[0].red===base),
         'prefijo-a':()=>nQ(`${ctx} ¿Qué prefijo lleva la subred A?`,asig[0].p,[paso('Bloque para '+asig[0].h+' hosts',`${asig[0].b} direcciones`,'2ⁿ − 2 ≥ hosts.'),final('Prefijo',`/${marca(asig[0].p)}`,'32 − bits de host.')],[malNum(asig[0].p+1,'No alcanza.'),malNum(24,'No es la red completa.'),malNum(asig[0].p-1,'Hay uno más ajustado.')],()=>2**(32-asig[0].p)-2>=asig[0].h),
         'broadcast-a':()=>ipQ(`${ctx} ¿Cuál es el broadcast de la subred A?`,asig[0].bc,[paso('Bloque de A',`${asig[0].b} direcciones desde ${asig[0].red}`,'Tamaño.'),final('Última dirección del bloque',marca(asig[0].bc),'Broadcast.')],[[n2ip(ip2n(asig[0].bc)+1),'Esa ya es la red siguiente.'],[n2ip(ip2n(asig[0].bc)-1),'Ese es el último host.']],()=>ip2n(asig[0].bc)-ip2n(asig[0].red)+1===asig[0].b)},
      3:{'segunda':()=>ipQ(`${ctx} ¿Cuál es la dirección de red de la subred B?`,asig[1]?.red||asig[0].red,[paso('A ocupa '+asig[0].b+' direcciones',`${asig[0].red} – ${asig[0].bc}`,'Bloque de A.'),final('B empieza justo después',marca(asig[1]?.red||asig[0].red),'Dirección siguiente al broadcast de A.')],[[asig[0].bc,'Ese es el broadcast de A.'],[n2ip(ip2n(asig[0].red)+(asig[1]?.b||0)),'B empieza donde termina A (el bloque de A, no el de B).']],()=>!asig[1]||ip2n(asig[1].red)===ip2n(asig[0].bc)+1),
         'prefijo-b':()=>{const s=asig[1]||asig[0];return nQ(`${ctx} ¿Qué prefijo lleva la subred ${asig[1]?'B':'A'}?`,s.p,[paso('Bloque para '+s.h+' hosts',`${s.b}`,'2ⁿ − 2 ≥ hosts.'),final('Prefijo',`/${marca(s.p)}`,'32 − bits de host.')],[malNum(s.p+1,'No alcanza.'),malNum(asig[0].p===s.p?s.p-1:asig[0].p,'Cada subred tiene su propio prefijo.')],()=>2**(32-s.p)-2>=s.h)},
         'broadcast-a':()=>P[2]['broadcast-a']()},
      4:{'ultima':()=>{const s=asig.at(-1);return ipQ(`${ctx} ¿Cuál es la dirección de red de la última subred (${String.fromCharCode(64+asig.length)})?`,s.red,[paso('Suma los bloques anteriores',asig.slice(0,-1).map(a=>a.b).join(' + ')+' = '+asig.slice(0,-1).reduce((t,a)=>t+a.b,0),'Desde el inicio.'),final('Red',marca(s.red),'Inicio del último bloque.')],[[n2ip(ip2n(s.red)-1),'Ese es el broadcast de la anterior.'],[n2ip(ip2n(base)+s.b*(asig.length-1)),'Los bloques anteriores tienen otros tamaños.']],()=>ip2n(s.red)===ip2n(base)+asig.slice(0,-1).reduce((t,a)=>t+a.b,0))},
         'broadcast-b':()=>{const s=asig[1]||asig[0];return ipQ(`${ctx} ¿Cuál es el broadcast de la subred ${asig[1]?'B':'A'}?`,s.bc,[paso('Inicio y tamaño',`${s.red}, bloque ${s.b}`,'Bloque.'),final('Última dirección',marca(s.bc),'Broadcast.')],[[n2ip(ip2n(s.bc)+1),'Esa es la red siguiente.'],[n2ip(ip2n(s.bc)-1),'Ese es el último host.']],()=>ip2n(s.bc)-ip2n(s.red)+1===s.b)},
         'segunda':()=>P[3]['segunda']()},
      5:{'sobrantes':()=>{const usado=asig.reduce((t,a)=>t+a.b,0),v=256-usado;return nQ(`${ctx} Después de asignar todas, ¿cuántas direcciones quedan libres en la /24?`,v,[paso('Suma los bloques',asig.map(a=>a.b).join(' + ')+' = '+usado,'Lo usado.'),final('256 − usado',marca(v),'Libres para crecer.')],[malNum(256-reqs.reduce((t,h)=>t+h,0),'Cuenta bloques completos, no solo hosts.'),malNum(254-usado,'La /24 tiene 256 direcciones.'),malNum(usado,'Eso es lo usado.')],()=>v===256-asig.reduce((t,a)=>t+a.b,0))},
         'ultima':()=>P[4]['ultima'](),'broadcast-b':()=>P[4]['broadcast-b']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'VLSM: ordena de mayor a menor, a cada subred dale el bloque 2ⁿ más chico con 2ⁿ − 2 ≥ hosts y asígnalas una tras otra desde el inicio.',pista:'Bloque más chico que alcance y empieza donde terminó la anterior.',...x};
  }
};

/* ---------- IPv6 ---------- */
const expandir6=s=>{s=String(s).trim().toLowerCase().replace(/\/\d+$/,'');if(!/^[0-9a-f:]+$/.test(s)||(s.match(/::/g)||[]).length>1)return null;let [a,b]=s.split('::');const A=a?a.split(':'):[],B=b!==undefined&&b?b.split(':'):[];if(s.includes('::')){const falta=8-A.length-B.length;if(falta<1)return null;return [...A,...Array(falta).fill('0'),...B].map(h=>h.padStart(4,'0'))}const H=s.split(':');return H.length===8&&H.every(h=>h.length>=1&&h.length<=4)?H.map(h=>h.padStart(4,'0')):null};
const comprimir6=H=>{const h=H.map(x=>x.replace(/^0+(?=.)/,''));let mejor=[-1,0];for(let i=0;i<8;){if(h[i]==='0'){let j=i;while(j<8&&h[j]==='0')j++;if(j-i>mejor[1]&&j-i>1)mejor=[i,j-i];i=j}else i++}if(mejor[0]<0)return h.join(':');return (h.slice(0,mejor[0]).join(':')+'::'+h.slice(mejor[0]+mejor[1]).join(':'))};
const ipv6={
  titulo:'IPv6 básico',
  explicacion:'IPv6 tiene 128 bits escritos en 8 grupos de 4 hexadecimales. Para abreviar: quita los ceros a la izquierda de cada grupo y cambia UNA sola secuencia (la más larga) de grupos 0000 por "::". Tipos comunes: ::1 loopback, fe80::/10 enlace local, fc00::/7 locales únicas, 2000::/3 globales, ff00::/8 multicast.',
  alternativa:'Es como escribir un número de teléfono muy largo con atajos: 0042 se escribe 42, y una racha de grupos en cero se resume con :: (solo una vez, o no sabrías cuántos ceros iban en cada hueco).',
  referencia:'Ver: RFC 4291 y RFC 5952; Cisco CCNA 1, módulo 12.',
  profundidad:n=>n===1?'basico':'procedimiento',item:true,
  generar(n,rng){
    const hx=()=>rng.entero(0,65535).toString(16),grupos=k=>{const H=Array.from({length:8},()=>rng.prob(0.35)?'0':hx());const i=rng.entero(0,7-k);for(let j=0;j<k;j++)H[i+j]='0';return H.map(h=>h.padStart(4,'0'))};
    const TIPOS=[['::1','loopback',['bucle local','localhost']],[`fe80::${hx()}:${hx()}`,'enlace local',['link-local','link local','local de enlace']],[`fd${rng.entero(0,255).toString(16).padStart(2,'0')}:${hx()}::${hx()}`,'local única',['ula','unique local','local unica']],[`2001:db8:${hx()}::${hx()}`,'global',['global unicast','unicast global','documentación','documentacion']],[`ff02::${rng.entero(1,9)}`,'multicast',['multidifusion','multidifusión']]];
    const P={
      1:{'tipo':()=>{const [ip,t,alt]=rng.elegir(TIPOS);return txt(`¿Qué tipo de dirección IPv6 es ${ip}? (loopback, enlace local, local única, global o multicast)`,t,alt,[paso('Mira el inicio',ip.slice(0,4),'El prefijo define el tipo.'),final('Tipo',marca(t),'::1 loopback · fe80 enlace local · fc/fd local única · 2/3 global · ff multicast.')],TIPOS.map(([,tt])=>[tt,'Revisa el prefijo: '+tt+' empieza distinto.']),{clave:t})},
         'bits':()=>{const [q,v,por]=rng.elegir([['¿Cuántos bits tiene una dirección IPv6?',128,'8 grupos de 16 bits.'],['¿Cuántos grupos (hextetos) tiene una IPv6 completa?',8,'Separados por dos puntos.'],['¿Cuántos bits tiene cada grupo de una IPv6?',16,'4 dígitos hexadecimales de 4 bits.'],['En una subred /64, ¿cuántos bits quedan para la interfaz?',64,'128 − 64.']]);return nQ(q,v,[paso('Estructura',por,'IPv6.'),final('Respuesta',marca(v),'Dato básico.')],[malNum(32,'Eso es IPv4.'),malNum(v*2,'Revisa la estructura.'),malNum(v/2,'Revisa la estructura.')],()=>true,{clave:q})},
         'quitar-ceros':()=>{const H=grupos(0).map(h=>rng.prob(.5)?h:'00'+h.slice(2)),full=H.join(':'),r=H.map(x=>x.replace(/^0+(?=.)/,'')).join(':');return {enunciado:`Quita los ceros a la izquierda de cada grupo (sin usar ::): ${full}`,respuesta:r,verificar:e=>String(e).trim().toLowerCase()===r,pasos:[paso('En cada grupo, borra los ceros iniciales',H.slice(0,3).map(h=>`${h} → ${h.replace(/^0+(?=.)/,'')}`).join(' · '),'0042 → 42; 0000 → 0.'),final('Resultado',marca(r),'Sin :: todavía.',r)],errores:[{valor:H.map(x=>x.replace(/0+$/,'')||'0').join(':'),si:e=>String(e).trim().toLowerCase()===H.map(x=>x.replace(/0+$/,'')||'0').join(':'),por:'Solo los ceros de la IZQUIERDA.'}],comprobar:()=>expandir6(r)?.join(':')===full,clave:full}}},
      2:{'comprimir':()=>{const H=grupos(rng.entero(2,4)),full=H.join(':'),r=comprimir6(H);return {enunciado:`Escribe en su forma más corta: ${full}`,respuesta:r,verificar:e=>String(e).trim().toLowerCase()===r,pasos:[paso('Quita ceros a la izquierda',H.map(x=>x.replace(/^0+(?=.)/,'')).join(':'),'Grupo por grupo.'),final('Cambia la racha más larga de ceros por ::',marca(r),'Solo una vez.',r)],errores:[{valor:H.map(x=>x.replace(/^0+(?=.)/,'')).join(':'),si:e=>String(e).trim().toLowerCase()===H.map(x=>x.replace(/^0+(?=.)/,'')).join(':')&&r.includes('::'),por:'Falta usar :: para la racha de ceros.'},{si:e=>(String(e).match(/::/g)||[]).length>1,por:'Solo se puede usar :: una vez.'},{si:e=>expandir6(e)?.join(':')===full&&String(e).trim().toLowerCase()!==r,por:'Es la misma dirección, pero no la forma más corta (o :: no está en la racha más larga).'}],comprobar:()=>expandir6(r)?.join(':')===full,clave:full}},
         'expandir':()=>{const H=grupos(rng.entero(2,4)),full=H.join(':'),corta=comprimir6(H);return {enunciado:`Escribe completa (8 grupos de 4 dígitos): ${corta}`,respuesta:full,verificar:e=>String(e).trim().toLowerCase()===full,pasos:[paso('¿Cuántos grupos faltan?',`8 − ${corta.split(':').filter(Boolean).length}`,'Los que representa ::.'),final('Rellena con ceros',marca(full),'4 dígitos por grupo.',full)],errores:[{si:e=>expandir6(e)?.join(':')!==full&&!!expandir6(e),por:'Cuenta bien cuántos grupos de ceros representa ::.'},{si:e=>String(e).split(':').length!==8,por:'Deben quedar exactamente 8 grupos.'}],comprobar:()=>expandir6(corta)?.join(':')===full,clave:corta}},
         'tipo':()=>P[1]['tipo']()},
      3:{'subredes':()=>{const a=rng.elegir([32,40,48,56]),b=rng.elegir([56,60,64].filter(x=>x>a)),v=2**(b-a);return nQ(`¿Cuántas subredes /${b} caben en un bloque /${a}?`,v,[paso('Bits de subred',`${b} − ${a} = ${b-a}`,'Los que se toman prestados.'),final('2 a esa potencia',`2^${b-a} = ${marca(v)}`,'Subredes.')],[malNum(b-a,'Son 2 elevado a esa diferencia.'),malNum((b-a)**2,'Es 2 elevado a la diferencia, no la diferencia al cuadrado.'),malNum(2*(b-a),'Es potencia de 2.')],()=>v===2**(b-a),{clave:a+'-'+b})},
         'comprimir':()=>P[2]['comprimir'](),'expandir':()=>P[2]['expandir']()},
      4:{'prefijo-red':()=>{const H=grupos(1).map((h,i)=>i<4?h:h),red=comprimir6([...H.slice(0,4),'0000','0000','0000','0000']);return {enunciado:`¿Cuál es el prefijo de red /64 de ${comprimir6(H)}? (forma corta, sin /64)`,respuesta:red,verificar:e=>expandir6(String(e).replace(/\/64$/,''))?.join(':')===expandir6(red).join(':'),pasos:[paso('/64 = los primeros 4 grupos',H.slice(0,4).join(':'),'64 bits = 4 grupos de 16.'),final('El resto en cero',marca(red),'Forma corta.',red)],errores:[{si:e=>expandir6(String(e).replace(/\/\d+$/,''))?.join(':')===H.join(':'),por:'Pon en cero la parte de interfaz (los últimos 4 grupos).'}],comprobar:()=>expandir6(red).slice(0,4).join(':')===H.slice(0,4).join(':'),clave:H.join(':')}},
         'subredes':()=>P[3]['subredes'](),'comprimir':()=>P[2]['comprimir']()},
      5:{'prefijo-red':()=>P[4]['prefijo-red'](),'subredes':()=>P[3]['subredes'](),'expandir':()=>P[2]['expandir']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'IPv6: 128 bits en 8 grupos hexadecimales. Quita ceros a la izquierda y cambia la racha más larga de grupos 0 por :: (una sola vez).',pista:'Grupo por grupo; el :: solo una vez.',...x};
  }
};

/* ---------- DNS ---------- */
const REG=[['A','IPv4 de un nombre',['traduce un nombre a ipv4','direccion ipv4']],['AAAA','IPv6 de un nombre',['traduce un nombre a ipv6','direccion ipv6']],['MX','servidor de correo del dominio',['correo','servidor de correo']],['CNAME','alias de otro nombre',['alias']],['NS','servidores de nombres del dominio',['servidor de nombres','servidor dns autoritativo']],['PTR','nombre de una IP (resolución inversa)',['inversa','resolucion inversa','reverso']],['TXT','texto libre (SPF, verificación)',['texto','spf','verificacion']]];
const dns={
  titulo:'DNS',
  explicacion:'El DNS traduce nombres (ejemplo.com) a direcciones IP. Registros: A (IPv4), AAAA (IPv6), MX (correo), CNAME (alias), NS (servidores del dominio), PTR (inversa) y TXT (texto, como SPF). Usa el puerto 53 (UDP, y TCP para respuestas grandes). Cada respuesta se guarda en caché durante su TTL.',
  alternativa:'Es la agenda de contactos de Internet: tú recuerdas el nombre ("ejemplo.com") y la agenda te da el número (la IP). El TTL es cuánto tiempo confías en lo anotado antes de volver a preguntar.',
  referencia:'Ver: RFC 1034/1035; Cisco CCNA 1, módulo 15.',
  item:true,profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.entero(a,b);
    const P={
      1:{'registro-para':()=>{const [t,para]=rng.elegir(REG);return txt(`¿Qué tipo de registro DNS guarda: ${para}?`,t,[`registro ${t}`],[paso('Tipos de registro','A · AAAA · MX · CNAME · NS · PTR · TXT','Cada uno para algo.'),final('Registro',marca(t),para+'.')],REG.map(([tt])=>[tt,'Ese registro es para otra cosa.']),{clave:t})},
         'puerto':()=>nQ('¿Qué puerto usa el DNS?',53,[paso('Puerto conocido','DNS → 53 (UDP; TCP para respuestas grandes y transferencias)','Puertos bien conocidos.'),final('Puerto',marca(53),'53.')],[malNum(80,'80 es HTTP.'),malNum(67,'67 es DHCP.'),malNum(443,'443 es HTTPS.')],()=>true,{clave:'puerto'}),
         'para-que':()=>{const [t,para,alt]=rng.elegir(REG);return txt(`¿Para qué sirve un registro ${t}?`,para,alt,[paso('Tipos de registro',REG.map(([a,b])=>`${a}: ${b}`).slice(0,4).join(' · '),'Recuerda cada uno.'),final('Uso',marca(para),'Registro '+t+'.')],REG.filter(([tt])=>tt!==t).slice(0,3).map(([,p])=>[p,'Ese es otro tipo de registro.']),{clave:'uso'+t})}},
      2:{'ttl':()=>{const s=rng.elegir([300,600,900,1800,3600,7200,86400]),v=s/60;return nQ(`Un registro tiene TTL = ${s}. ¿Cuántos minutos se guarda en caché?`,v,[paso('El TTL está en segundos',`${s} s`,'Time To Live.'),final('Entre 60',`${s} ÷ 60 = ${marca(v)}`,'Minutos.')],[malNum(s,'El TTL está en segundos; pasa a minutos.'),malNum(s/3600,'Eso son horas.'),malNum(s*60,'Se divide entre 60.')],()=>v*60===s,{clave:'ttl'+s})},
         'ptr':()=>{const ip=`${r(10,203)}.${r(0,255)}.${r(0,255)}.${r(1,254)}`,rv=ip.split('.').reverse().join('.')+'.in-addr.arpa';return {enunciado:`¿Qué nombre se consulta (registro PTR) para la IP ${ip}?`,respuesta:rv,verificar:e=>String(e).trim().toLowerCase().replace(/\.$/,'')===rv,pasos:[paso('Invierte los octetos',ip.split('.').reverse().join('.'),'Se lee al revés.'),final('Agrega .in-addr.arpa',marca(rv),'Zona de resolución inversa.',rv)],errores:[{valor:ip+'.in-addr.arpa',si:e=>String(e).trim().toLowerCase()===ip+'.in-addr.arpa',por:'Los octetos van al revés.'},{valor:ip.split('.').reverse().join('.'),si:e=>String(e).trim().toLowerCase()===ip.split('.').reverse().join('.'),por:'Falta .in-addr.arpa.'}],comprobar:()=>rv.split('.').slice(0,4).reverse().join('.')===ip,clave:ip}},
         'registro-para':()=>P[1]['registro-para']()},
      3:{'ttl-restante':()=>{const t=rng.elegir([300,600,3600,1800]),pas=r(1,t/60-1)*60,v=t-pas;return nQ(`Un resolvedor guardó un registro con TTL ${t} s hace ${pas/60} minutos. ¿Cuántos segundos le quedan en caché?`,v,[paso('Tiempo transcurrido',`${pas/60} min = ${pas} s`,'Pasa a segundos.'),final('TTL − transcurrido',`${t} − ${pas} = ${marca(v)}`,'Luego volverá a preguntar.')],[malNum(t-pas/60,'Pasa los minutos a segundos.'),malNum(t,'Ya pasó tiempo.'),malNum(pas,'Eso es lo transcurrido.')],()=>v+pas===t,{clave:t+'-'+pas})},
         'cadena-cname':()=>{const ip=`${r(20,203)}.${r(0,255)}.${r(0,255)}.${r(1,254)}`,dom=rng.elegir(['tienda','portal','correo','app']);return ipQ(`Respuesta de DNS:<br><code>www.${dom}.com. CNAME web.${dom}.net.</code><br><code>web.${dom}.net. A ${ip}</code><br>¿A qué IP se conecta el navegador al abrir www.${dom}.com?`,ip,[paso('El CNAME es un alias',`www.${dom}.com → web.${dom}.net`,'Hay que seguir la cadena.'),final('El registro A del destino',marca(ip),'IP final.')],[[`${r(1,9)}.${r(1,9)}.${r(1,9)}.${r(1,9)}`,'Sigue el alias hasta el registro A.']],()=>ipValida(ip))},
         'orden-resolucion':()=>{const pasos_=['caché local','resolvedor','raíz','TLD','autoritativo'],k=r(1,4);return txt(`En una resolución DNS completa (${pasos_.join(' → ')}), ¿quién responde después de "${pasos_[k-1]}"?`,pasos_[k],k===4?['servidor autoritativo','autoritativo del dominio']:k===3?['tld','servidor tld','.com']:k===2?['servidor raiz','raiz']:['resolvedor recursivo','servidor dns del proveedor'],[paso('Orden',pasos_.join(' → '),'De lo más cercano a lo más específico.'),final('Siguiente',marca(pasos_[k]),'Paso '+(k+1)+'.')],pasos_.filter((_,i)=>i!==k).map(p=>[p,'Revisa el orden.']),{clave:'orden'+k})}},
      4:{'cadena-cname':()=>P[3]['cadena-cname'](),'ttl-restante':()=>P[3]['ttl-restante'](),'ptr':()=>P[2]['ptr']()},
      5:{'cadena-cname':()=>P[3]['cadena-cname'](),'orden-resolucion':()=>P[3]['orden-resolucion'](),'ttl-restante':()=>P[3]['ttl-restante']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'DNS traduce nombres a IP (puerto 53). A/AAAA → IP, MX → correo, CNAME → alias, NS → servidores, PTR → inversa, TXT → texto. El TTL (segundos) es el tiempo en caché.',pista:'¿Qué guarda cada registro?',...x};
  }
};

/* ---------- DHCP ---------- */
const DORA=['Discover','Offer','Request','Acknowledge'];
const dhcp={
  titulo:'DHCP',
  explicacion:'DHCP entrega automáticamente IP, máscara, puerta de enlace y DNS. El proceso es DORA: Discover (el cliente busca), Offer (el servidor ofrece), Request (el cliente pide esa IP) y Acknowledge (el servidor confirma). Usa UDP 67 (servidor) y 68 (cliente). El préstamo (lease) se intenta renovar al 50 % (T1) y al 87.5 % (T2).',
  alternativa:'Es como pedir una mesa en un restaurante: preguntas en voz alta si hay lugar (Discover), el mesero te ofrece una (Offer), dices "esa me sirve" (Request) y te la confirma (Acknowledge). La mesa es tuya por un tiempo (lease).',
  referencia:'Ver: RFC 2131; Cisco CCNA 2, módulo 7.',
  item:true,profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.entero(a,b);
    const P={
      1:{'dora':()=>{const k=r(0,3);return txt(`En el proceso DHCP (DORA), ¿cuál es el paso ${k+1}?`,DORA[k],k===3?['ack','acknowledgment','acuse']:[],[paso('DORA','Discover → Offer → Request → Acknowledge','Las iniciales forman DORA.'),final('Paso '+(k+1),marca(DORA[k]),'Orden fijo.')],DORA.filter((_,i)=>i!==k).map(p=>[p,'Revisa el orden de DORA.']),{clave:'dora'+k})},
         'puerto':()=>{const quien=rng.elegir(['servidor','cliente']),v=quien==='servidor'?67:68;return nQ(`¿Qué puerto UDP usa el ${quien} DHCP?`,v,[paso('Puertos DHCP','servidor 67 · cliente 68','UDP.'),final('Puerto',marca(v),'DHCP.')],[malNum(quien==='servidor'?68:67,'Ese es el del '+(quien==='servidor'?'cliente':'servidor')+'.'),malNum(53,'53 es DNS.')],()=>true,{clave:quien})},
         'quien-envia':()=>{const k=r(0,3),q=k%2===0?'cliente':'servidor';return txt(`¿Quién envía el mensaje DHCP ${DORA[k]}: el cliente o el servidor?`,q,[`el ${q}`],[paso('Alternan','Discover (cliente) → Offer (servidor) → Request (cliente) → Ack (servidor)','Pregunta y respuesta.'),final('Lo envía',marca(q),DORA[k]+'.')],[[q==='cliente'?'servidor':'cliente','Revisa quién inicia cada paso.']],{clave:'envia'+k})}},
      2:{'t1':()=>{const L=rng.elegir([2,4,8,12,24,48]),v=L/2;return nQ(`Un equipo recibe un préstamo DHCP de ${L} horas. ¿A las cuántas horas intenta renovarlo por primera vez (T1)?`,v,[paso('T1 = 50 % del préstamo',`${L} × 0.5`,'Renovación con el mismo servidor.'),final('Horas',marca(v),'T1.')],[malNum(L*0.875,'Ese es T2 (87.5 %).'),malNum(L,'Renueva antes de que venza.'),malNum(L/4,'Es la mitad.')],()=>v===L/2,{clave:'t1'+L})},
         't2':()=>{const L=rng.elegir([8,16,24,48]),v=L*0.875;return nQ(`Con un préstamo de ${L} horas, ¿a las cuántas horas ocurre T2 (rebinding)?`,v,[paso('T2 = 87.5 % del préstamo',`${L} × 0.875`,'Si T1 falló, pregunta a cualquier servidor.'),final('Horas',marca(v),'T2.')],[malNum(L/2,'Ese es T1.'),malNum(L,'Antes de vencer.'),malNum(L*0.75,'Es 7/8, no 3/4.')],()=>v===L*7/8,{clave:'t2'+L})},
         'dora':()=>P[1]['dora']()},
      3:{'pool':()=>{const red=`192.168.${r(0,250)}`,a=r(10,100),b=a+r(20,120),ex=r(0,10),v=b-a+1-ex;return nQ(`El pool DHCP va de ${red}.${a} a ${red}.${Math.min(b,254)} y hay ${ex} direcciones excluidas (impresoras y servidores). ¿Cuántas IP puede repartir?`,Math.min(b,254)-a+1-ex,[paso('Cuenta el rango (incluye los extremos)',`${Math.min(b,254)} − ${a} + 1 = ${Math.min(b,254)-a+1}`,'Se suman los dos extremos.'),final('Resta las excluidas',`${Math.min(b,254)-a+1} − ${ex} = ${marca(Math.min(b,254)-a+1-ex)}`,'Disponibles.')],[malNum(Math.min(b,254)-a-ex,'Incluye los dos extremos (+1).'),malNum(Math.min(b,254)-a+1,'Resta las excluidas.'),malNum(Math.min(b,254)-a+1+ex,'Las excluidas se restan.')],()=>Math.min(b,254)-a+1-ex>=0,{clave:a+'-'+b+'-'+ex})},
         'rogue':()=>{const legit=`192.168.1.${r(1,5)}`,rogue=`192.168.1.${r(100,200)}`;return ipQ(`En tu red el servidor DHCP autorizado es ${legit}. Un equipo recibió dos Offer: uno de ${legit} y otro de ${rogue}. ¿Qué IP es el servidor DHCP no autorizado (rogue) que debes investigar?`,rogue,[paso('Compara con el autorizado',`Autorizado: ${legit}`,'Solo uno debería ofrecer.'),final('El otro es sospechoso',marca(rogue),'Defensa: DHCP snooping en el switch.')],[[legit,'Ese es el autorizado.']],()=>legit!==rogue)},
         't1':()=>P[2]['t1']()},
      4:{'pool-subred':()=>{const p=rng.elegir([24,25,26,27,28]),ex=r(1,10),v=2**(32-p)-2-ex;return nQ(`En una subred /${p}, se excluyen ${ex} direcciones del pool (gateway y servidores). ¿Cuántas IP quedan para repartir?`,v,[paso('Hosts de la subred',`2^${32-p} − 2 = ${2**(32-p)-2}`,'Sin red ni broadcast.'),final('Resta las excluidas',`${2**(32-p)-2} − ${ex} = ${marca(v)}`,'Disponibles.')],[malNum(2**(32-p)-ex,'Resta también red y broadcast.'),malNum(2**(32-p)-2,'Resta las excluidas.'),malNum(2**(32-p)-2+ex,'Se restan.')],()=>v===2**(32-p)-2-ex,{clave:p+'-'+ex})},
         'rogue':()=>P[3]['rogue'](),'pool':()=>P[3]['pool']()},
      5:{'pool-subred':()=>P[4]['pool-subred'](),'rogue':()=>P[3]['rogue'](),'t2':()=>P[2]['t2']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'DHCP: DORA (Discover, Offer, Request, Acknowledge), UDP 67/68; renueva al 50 % (T1) y al 87.5 % (T2) del préstamo.',pista:'Recuerda DORA y cuenta con cuidado los rangos.',...x};
  }
};

/* ---------- ARP ---------- */
const mac=rng=>Array.from({length:6},()=>rng.entero(0,255).toString(16).padStart(2,'0')).join(':');
const arp={
  titulo:'ARP',
  explicacion:'ARP averigua la dirección MAC que corresponde a una IP de la MISMA red local: pregunta por broadcast (ff:ff:ff:ff:ff:ff) "¿quién tiene esta IP?" y el dueño responde con su MAC. Si el destino está en otra red, el equipo pregunta por la MAC de su puerta de enlace. Defensa: si dos IP aparecen con la misma MAC (sobre todo la del gateway), puede ser ARP spoofing.',
  alternativa:'Es como gritar en una oficina "¿quién es Ana?" y que Ana levante la mano: ya sabes a qué escritorio llevar el papel. Si el destinatario está en otro edificio, se lo das a la recepción (el gateway).',
  referencia:'Ver: RFC 826; Cisco CCNA 1, módulo 9.',
  item:true,profundidad:n=>n<=2?'basico':'procedimiento',
  generar(n,rng){
    const r=(a,b)=>rng.entero(a,b);
    const P={
      1:{'que-resuelve':()=>txt('¿Qué dirección obtiene ARP a partir de una IP?','MAC',['direccion mac','la mac','dirección física','direccion fisica'],[paso('ARP une capa 3 con capa 2','IP → MAC','Para armar la trama.'),final('Obtiene','la '+marca('MAC'),'Dirección física.')],[['IP','Eso ya lo conoce: busca la MAC.'],['puerto','Los puertos son de la capa 4.']],{clave:'resuelve'}),
         'broadcast':()=>txt('¿A qué dirección MAC se envía una solicitud ARP?','ff:ff:ff:ff:ff:ff',['ff-ff-ff-ff-ff-ff','ffff.ffff.ffff','broadcast'],[paso('Pregunta a todos','No sabe la MAC del destino.','Broadcast.'),final('MAC broadcast',marca('ff:ff:ff:ff:ff:ff'),'Todos los equipos la leen.')],[['00:00:00:00:00:00','Esa no es broadcast.'],['255.255.255.255','Esa es una IP de broadcast, no una MAC.']],{clave:'bc',comprobar:()=>true}),
         'capa':()=>nQ('¿En qué capa OSI se ubica ARP (la que usa para enviar sus mensajes)?',2,[paso('ARP viaja en tramas','Ethernet','No lleva cabecera IP.'),final('Capa',marca(2),'Enlace de datos.')],[malNum(3,'Resuelve IP, pero sus mensajes viajan en la capa 2.'),malNum(4,'No usa puertos.')],()=>true,{clave:'capa'}),
         'tabla':()=>P[2]['tabla']()},
      2:{'a-quien':()=>{const p=24,red=`192.168.${r(0,250)}`,gw=`${red}.1`,yo=`${red}.${r(10,99)}`,local=rng.prob(.5),dest=local?`${red}.${r(100,250)}`:`10.${r(0,255)}.${r(0,255)}.${r(1,254)}`,v=local?dest:gw;
          return ipQ(`Tu equipo es ${yo}/24 con puerta de enlace ${gw}. Quiere enviar a ${dest}. ¿Por qué IP pregunta en la solicitud ARP?`,v,[paso('¿El destino está en tu red?',local?'Sí: mismo 192.168.x':'No: es otra red','Compara con la máscara.'),final(local?'Pregunta por el destino':'Pregunta por el gateway',marca(v),local?'Entrega directa.':'El router lo reenvía.')],[[local?gw:dest,local?'Está en tu red: no hace falta el gateway.':'El destino está en otra red: ARP solo funciona en la red local.']],()=>local===((ip2n(dest)&mascara(p))===(ip2n(yo)&mascara(p))))},
         'tabla':()=>{const red=`192.168.${r(0,250)}`,ips=[1,r(10,50),r(51,120)].map(h=>`${red}.${h}`),macs=ips.map(()=>mac(rng)),k=r(0,2);return txt(`Tabla ARP:<br><code>${ips.map((ip,i)=>`${ip} → ${macs[i]}`).join('<br>')}</code><br>¿Qué MAC usa tu equipo para enviar a ${ips[k]}?`,macs[k],[macs[k].replace(/:/g,'-')],[paso('Busca la IP en la tabla',ips[k],'La tabla guarda lo aprendido.'),final('MAC',marca(macs[k]),'Sin preguntar de nuevo.')],macs.filter((_,i)=>i!==k).map(m=>[m,'Esa MAC es de otra IP.']),{clave:ips[k]})},
         'que-resuelve':()=>P[1]['que-resuelve']()},
      3:{'spoofing':()=>{const red=`192.168.${r(0,250)}`,gw=`${red}.1`,at=`${red}.${r(100,200)}`,m1=mac(rng),mat=mac(rng),otro=`${red}.${r(20,90)}`,mo=mac(rng);return ipQ(`Tabla ARP de un equipo:<br><code>${gw} → ${mat}</code><br><code>${otro} → ${mo}</code><br><code>${at} → ${mat}</code><br>La MAC real del gateway es ${m1}. ¿Qué IP está suplantando al gateway (ARP spoofing)?`,at,[paso('Busca MAC repetidas',`${mat} aparece dos veces`,'Una MAC no debería tener dos IP de distintos equipos.'),final('El equipo atacante',marca(at),'Defensa: inspección ARP dinámica (DAI) y entradas estáticas para el gateway.')],[[gw,'El gateway es la víctima; su entrada fue envenenada.'],[otro,'Esa entrada es normal.']],()=>at!==gw)},
         'a-quien':()=>P[2]['a-quien'](),'tabla':()=>P[2]['tabla']()},
      4:{'spoofing':()=>P[3]['spoofing'](),'a-quien':()=>P[2]['a-quien'](),
         'gratuito':()=>txt('¿Cómo se llama el ARP que un equipo envía anunciando su propia IP (sin que nadie pregunte)?','ARP gratuito',['gratuitous arp','arp gratuito','garp'],[paso('Anuncio sin pregunta','Se usa al encender o al cambiar de MAC; también lo abusan los ataques.','Actualiza tablas de otros.'),final('Nombre',marca('ARP gratuito'),'Gratuitous ARP.')],[['ARP inverso','El inverso obtiene una IP a partir de una MAC.'],['proxy ARP','En el proxy ARP un router responde por otro.']],{clave:'garp'})},
      5:{'spoofing':()=>P[3]['spoofing'](),'gratuito':()=>P[4]['gratuito'](),'a-quien':()=>P[2]['a-quien']()}
    };
    const x=plantillas(rng,P[n]);
    return {regla:'ARP obtiene la MAC de una IP de la red local por broadcast; si el destino está en otra red, pregunta por la MAC del gateway. Dos IP con la misma MAC del gateway = posible ARP spoofing.',pista:'¿El destino está en tu misma red?',...x};
  }
};

export default {'red/osi':osi,'red/ipv4':ipv4,'red/vlsm':vlsm,'red/ipv6':ipv6,'red/dns':dns,'red/dhcp':dhcp,'red/arp':arp};
