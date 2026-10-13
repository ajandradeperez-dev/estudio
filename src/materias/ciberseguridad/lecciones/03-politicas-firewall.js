const R_O='Las políticas se evalúan de arriba hacia abajo y gana la primera que coincide; si ninguna coincide, se aplica la denegación implícita (implicit deny).';
const R_S='Un firewall stateful recuerda la sesión: la respuesta de una conexión permitida vuelve sola, sin regla de regreso.';
const R_N='NAT de origen: la red privada sale a Internet con la IP pública. VIP (NAT de destino): publica un servidor interno.';
const R_P='Perfiles: Web Filter bloquea categorías de sitios; AntiVirus revisa archivos; IPS detecta exploits.';

export default {
  titulo:'Políticas de firewall',
  resumen:'Orden de evaluación, denegación implícita, stateful y NAT.',
  explicacion:[
    'Las políticas se evalúan de <b>arriba hacia abajo</b> y gana la <b>primera que coincide</b>. Si ninguna coincide, se aplica la <b>denegación implícita</b>. Por eso las reglas específicas van arriba.',
    'Un firewall <b>stateful</b> recuerda la sesión: la respuesta vuelve sin regla de regreso.',
    '<b>NAT de origen</b> saca la red privada con la IP pública (en FortiOS, <code>set nat enable</code>). Una <b>VIP</b> (NAT de destino) publica un servidor interno.'
  ],
  ejemplos:[
    ['1. Bloquear RDP · 2. Permitir todo a Internet','el RDP se bloquea: la regla 1 coincide primero'],
    ['LAN → WAN HTTPS permitido','la respuesta vuelve sola (stateful)'],
    ['VIP 200.10.10.5:443 → 10.0.50.10:443','publica el servidor web de la DMZ']
  ],
  rondas:[[
    {tipo:'opcion',pregunta:'Si ninguna política coincide con un paquete, el FortiGate…',opciones:['Lo permite','Lo deniega','Lo envía al administrador'],correcta:1,
     porque:{0:'Por defecto, todo lo que no se permite explícitamente se niega.',2:'No existe ese comportamiento.'},regla:R_O},
    {tipo:'completar',pregunta:'Regla 1: denegar todo de LAN a WAN. Regla 2: permitir HTTPS de LAN a WAN. Un usuario abre una web HTTPS: ¿permitido o denegado?',respuestas:['denegado','denegada'],
     errores:{permitido:'La regla 1 coincide primero y deniega; la 2 nunca se evalúa.',permitida:'La regla 1 coincide primero y deniega; la 2 nunca se evalúa.'},regla:R_O},
    {tipo:'completar',pregunta:'¿Cómo se llama en FortiGate la función para publicar un servidor interno? (sigla de tres letras)',respuestas:['VIP','Virtual IP'],
     errores:{'IP Pool':'IP Pool es para NAT de origen.'},regla:R_N},
    {tipo:'completar',pregunta:'Permitiste HTTPS de LAN a WAN. ¿Necesitas otra regla de WAN a LAN para que vuelva la respuesta? (sí o no)',respuestas:['no'],
     errores:{'sí':'El firewall es stateful: la respuesta vuelve sola.'},regla:R_S},
    {tipo:'completar',pregunta:'¿Cómo se llama en inglés la regla final que niega lo que no coincidió con ninguna política?',respuestas:['implicit deny'],
     errores:{'deny all':'En FortiGate se llama implicit deny (política 0).'},regla:R_O}
  ],[
    {tipo:'opcion',pregunta:'¿Dónde van las reglas más específicas?',opciones:['Arriba','Abajo','Da igual'],correcta:0,
     porque:{1:'Una regla general arriba las taparía.',2:'El orden importa: gana la primera que coincide.'},regla:R_O},
    {tipo:'completar',pregunta:'Regla 1: permitir todo de LAN a WAN. Regla 2: denegar RDP de LAN a WAN. Un usuario usa RDP hacia Internet: ¿permitido o denegado?',respuestas:['permitido','permitida'],
     errores:{denegado:'La regla 1 coincide primero y permite; la 2 nunca se evalúa. Habría que subirla.',denegada:'La regla 1 coincide primero y permite; la 2 nunca se evalúa. Habría que subirla.'},regla:R_O},
    {tipo:'completar',pregunta:'Para que la LAN, con IPs privadas, salga a Internet, ¿qué NAT necesitas? (origen o destino)',respuestas:['origen','NAT de origen','SNAT'],
     errores:{destino:'NAT de destino es para publicar servidores; la salida usa NAT de origen.'},regla:R_N},
    {tipo:'completar',pregunta:'Completa el comando de FortiOS que activa NAT en una política: set nat ___',respuestas:['enable'],
     errores:{on:'En FortiOS es set nat enable.',yes:'En FortiOS es set nat enable.'},regla:'En FortiOS, NAT de origen se activa dentro de la política con set nat enable.'},
    {tipo:'completar',pregunta:'¿Qué perfil de seguridad bloquea categorías de sitios como phishing? (en inglés, dos palabras)',respuestas:['Web Filter','WebFilter'],
     errores:{antivirus:'El antivirus revisa archivos; las categorías de sitios las filtra Web Filter.',IPS:'IPS detecta exploits; las categorías de sitios las filtra Web Filter.'},regla:R_P}
  ]]
};
