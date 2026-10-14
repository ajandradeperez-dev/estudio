/* Temas de Ciberseguridad y sus nodos, en orden (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Siempre defensivo y simulado.
   herramienta: sección de la materia que se abre desde la habilidad (y que a su vez ofrece "Practicar" esa habilidad). */
export default [
  {id:'redes-y-protocolos',titulo:'Redes',icono:'🌐',descripcion:'IP, subredes, puertos y protocolos.',nodos:[
    {id:'binario-hex',titulo:'Binario, decimal y hexadecimal',gen:'red/bases'},
    {id:'puertos-y-servicios',gen:'red/puertos',herramienta:'redes'},
    {id:'subredes-cidr',gen:'red/subred',herramienta:'subred'},
    {id:'mascaras',titulo:'Máscara de subred /24 a /30',gen:'red/mascara',herramienta:'subred'},
    {id:'prefijo-hosts',titulo:'Prefijo para N hosts',gen:'red/prefijo-hosts',herramienta:'subred'},
    {titulo:'Modelo OSI y TCP/IP',proximo:true},
    {titulo:'VLAN y Wi-Fi seguro',proximo:true}
  ]},
  {id:'firewalls',titulo:'Firewalls',icono:'🧱',descripcion:'Políticas, primera coincidencia, NAT y cada marca.',nodos:[
    {id:'politicas-firewall',gen:'fw/reglas',herramienta:'fw'},
    {id:'nat',titulo:'NAT: SNAT, DNAT y VIP',gen:'fw/nat',herramienta:'forti'},
    {id:'marcas',titulo:'Lo mismo en cada marca',gen:'fw/marcas',herramienta:'marcas'}
  ]},
  {id:'vpn-cripto',titulo:'VPN y criptografía',icono:'🔐',descripcion:'IPsec por fases y criptografía básica.',nodos:[
    {id:'vpn-fases',titulo:'¿En qué fase falla la VPN?',gen:'vpn/fases',herramienta:'vpn'},
    {id:'cripto',titulo:'Hash, cifrado y firmas',gen:'vpn/cripto'},
    {titulo:'Certificados y PKI',proximo:true}
  ]},
  {id:'defensa',titulo:'Defensa e incidentes',icono:'🚨',descripcion:'Leer registros, detectar y responder.',nodos:[
    {id:'logs',titulo:'Patrones en los registros',gen:'def/logs'},
    {id:'incidentes',titulo:'Casos de incidentes',banco:'ciber/incidentes',herramienta:'incidentes'},
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
