/* Temas de Ciberseguridad y sus nodos, en orden (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Siempre defensivo y simulado. */
export default [
  {id:'redes',titulo:'Redes',icono:'🌐',descripcion:'IP, subredes, puertos y protocolos.',nodos:[
    {id:'binario-hex',titulo:'Binario, decimal y hexadecimal',gen:'red/bases'},
    {id:'puertos-y-servicios',gen:'red/puertos'},
    {id:'subredes-cidr',gen:'red/subred'},
    {id:'mascaras',titulo:'Máscara de subred /24 a /30',gen:'red/mascara'},
    {id:'prefijo-hosts',titulo:'Prefijo para N hosts',gen:'red/prefijo-hosts'},
    {titulo:'Modelo OSI y TCP/IP',proximo:true},
    {titulo:'VLAN y Wi-Fi seguro',proximo:true}
  ]},
  {id:'firewalls',titulo:'Firewalls',icono:'🧱',descripcion:'Políticas, primera coincidencia, NAT y cada marca.',nodos:[
    {id:'politicas-firewall',gen:'fw/reglas'},
    {id:'nat',titulo:'NAT: SNAT, DNAT y VIP',gen:'fw/nat'},
    {id:'marcas',titulo:'Lo mismo en cada marca',gen:'fw/marcas'}
  ]},
  {id:'vpn',titulo:'VPN y criptografía',icono:'🔐',descripcion:'IPsec por fases y criptografía básica.',nodos:[
    {id:'vpn-fases',titulo:'¿En qué fase falla la VPN?',gen:'vpn/fases'},
    {id:'cripto',titulo:'Hash, cifrado y firmas',gen:'vpn/cripto'},
    {titulo:'Certificados y PKI',proximo:true}
  ]},
  {id:'defensa',titulo:'Defensa e incidentes',icono:'🚨',descripcion:'Leer registros, detectar y responder.',nodos:[
    {id:'logs',titulo:'Patrones en los registros',gen:'def/logs'},
    {id:'incidentes',titulo:'Casos de incidentes',banco:'ciber/incidentes'},
    {id:'repaso-seguridad',titulo:'Preguntas de seguridad',banco:'ciber/examen'}
  ]},
  {id:'herramientas',titulo:'Herramientas',icono:'🧰',descripcion:'Simuladores y calculadoras para experimentar.',nodos:[
    {ir:'subred',titulo:'Calculadora de subredes',icono:'🧮'},
    {ir:'fw',titulo:'Simulador de políticas',icono:'🧱'},
    {ir:'vpn',titulo:'Simulador de VPN',icono:'🔐'},
    {ir:'incidentes',titulo:'Laboratorio de incidentes',icono:'🚨'},
    {ir:'redes',titulo:'Modelo OSI y puertos',icono:'🌐'},
    {ir:'vlan',titulo:'VLANs y Wi-Fi',icono:'📶'},
    {ir:'marcas',titulo:'Comparar marcas',icono:'🏷️'},
    {ir:'forti',titulo:'FortiGate a fondo',icono:'🛡️'},
    {ir:'quiz',titulo:'Examen rápido',icono:'📝'}
  ]}
];
