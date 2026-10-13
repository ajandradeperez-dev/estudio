const R_P='Puertos clave: HTTPS 443/TCP, HTTP 80/TCP, DNS 53/UDP, SSH 22/TCP, RDP 3389/TCP, SMTP 25/TCP.';
const R_T='TCP establece conexión y confirma cada entrega; UDP envía sin conexión ni confirmación.';
const R_S='Administración remota (SSH, RDP) solo por VPN o desde IPs autorizadas, nunca abierta a todo Internet.';

export default {
  titulo:'Puertos y servicios',
  resumen:'Los puertos que aparecen en casi todas las políticas de firewall.',
  explicacion:[
    'Cada servicio escucha en un <b>puerto</b>. Los que más verás en un firewall: <b>HTTPS 443</b>, <b>HTTP 80</b>, <b>DNS 53</b>, <b>SSH 22</b>, <b>RDP 3389</b> y <b>SMTP 25</b>.',
    '<b>TCP</b> establece conexión y confirma cada entrega (web, SSH, correo). <b>UDP</b> envía sin conexión: más rápido, para DNS o voz.',
    'Regla de seguridad: publica solo lo necesario. SSH y RDP nunca abiertos a todo Internet; usa VPN o limita el origen.'
  ],
  ejemplos:[
    ['Web pública → permitir TCP 443 hacia el servidor','HTTPS'],
    ['Usuarios → DNS → permitir UDP 53 solo hacia tus servidores DNS','evita túneles DNS'],
    ['Administración → SSH 22 solo desde la IP del administrador','nunca desde any']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'¿Qué puerto usa HTTPS?',opciones:['80','443','22'],correcta:1,
     porque:{0:'80 es HTTP sin cifrar.',2:'22 es SSH.'},regla:R_P},
    {tipo:'completar',pregunta:'Escribe el puerto de SSH.',respuestas:['22'],
     errores:{'23':'23 es Telnet (sin cifrar); SSH es 22.'},regla:R_P},
    {tipo:'completar',pregunta:'Escribe el puerto de RDP (escritorio remoto de Windows).',respuestas:['3389'],
     errores:{'3306':'3306 es MySQL.'},regla:R_P},
    {tipo:'completar',pregunta:'¿Qué protocolo de transporte usa DNS para las consultas normales? (TCP o UDP)',respuestas:['UDP'],
     errores:{TCP:'DNS usa UDP 53 para consultas; TCP solo en casos especiales, como respuestas grandes.'},regla:R_T},
    {tipo:'completar',pregunta:'Un servidor web público debe recibir HTTPS desde Internet. ¿Qué puerto abres?',respuestas:['443','TCP 443','443/TCP'],
     errores:{'80':'80 es HTTP sin cifrar; HTTPS es 443.'},regla:R_P}
  ],[
    {tipo:'opcion',pregunta:'Ves RDP (3389) abierto a todo Internet. ¿Qué haces?',opciones:['Dejarlo si la contraseña es larga','Cerrarlo y dar acceso por VPN','Moverlo al puerto 3390'],correcta:1,
     porque:{0:'Sigue expuesto a fuerza bruta y a vulnerabilidades del servicio.',2:'Cambiar el puerto no lo protege: los escaneos lo encuentran igual.'},regla:R_S},
    {tipo:'completar',pregunta:'Escribe el puerto de HTTP.',respuestas:['80'],
     errores:{'8080':'8080 es un puerto alternativo común; el estándar es 80.','443':'443 es HTTPS.'},regla:R_P},
    {tipo:'completar',pregunta:'Escribe el puerto de DNS.',respuestas:['53'],
     errores:{'853':'853 es DNS sobre TLS; el DNS clásico es 53.'},regla:R_P},
    {tipo:'completar',pregunta:'Escribe el puerto de SMTP entre servidores de correo.',respuestas:['25'],
     errores:{'587':'587 es el envío desde clientes de correo; entre servidores es 25.'},regla:R_P},
    {tipo:'completar',pregunta:'¿Qué protocolo de transporte confirma la entrega de cada paquete? (TCP o UDP)',respuestas:['TCP'],
     errores:{UDP:'UDP envía sin confirmar; TCP confirma.'},regla:R_T}
  ]]
};
