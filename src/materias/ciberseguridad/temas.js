/* Temas de Ciberseguridad y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies. Siempre defensivo y simulado.
   herramienta: sección de la materia que se abre desde la habilidad (y que a su vez ofrece "Practicar" esa habilidad).
   Los nodos {titulo, proximo:true} son lo que el PLAN pide y todavía no existe. */
export default [
  {id:'redes-y-protocolos',titulo:'Fundamentos de redes',icono:'🌐',descripcion:'OSI, direcciones IP, subredes, puertos y servicios de red.',nodos:[
    {id:'osi-tcpip',titulo:'Modelos OSI y TCP/IP',gen:'red/osi'},
    {id:'ipv4-clases',titulo:'Direcciones IP y clases',gen:'red/ipv4'},
    {id:'binario-hex',titulo:'Binario, decimal y hexadecimal',gen:'red/bases'},
    {id:'subredes-cidr',gen:'red/subred',herramienta:'subred'},
    {id:'mascaras',titulo:'Máscara de subred /24 a /30',gen:'red/mascara',herramienta:'subred'},
    {id:'prefijo-hosts',titulo:'Prefijo para N hosts',gen:'red/prefijo-hosts',herramienta:'subred'},
    {id:'vlsm',titulo:'VLSM',gen:'red/vlsm',herramienta:'subred'},
    {id:'ipv6',titulo:'IPv6 básico',gen:'red/ipv6'},
    {id:'puertos-y-servicios',gen:'red/puertos',herramienta:'redes'},
    {id:'dns',titulo:'DNS',gen:'red/dns'},
    {id:'dhcp',titulo:'DHCP',gen:'red/dhcp'},
    {id:'arp',titulo:'ARP',gen:'red/arp'}
  ]},
  {id:'conmutacion',titulo:'Conmutación y enrutamiento',icono:'🔀',descripcion:'Switches, VLAN, STP, rutas, OSPF y Wi-Fi seguro.',nodos:[
    {titulo:'Switches, MAC y tablas',proximo:true},
    {titulo:'VLAN y trunks',proximo:true},
    {titulo:'STP (concepto)',proximo:true},
    {titulo:'Enrutamiento estático',proximo:true},
    {titulo:'Rutas por defecto',proximo:true},
    {titulo:'OSPF (concepto)',proximo:true},
    {titulo:'Wi-Fi y seguridad WPA2/WPA3',proximo:true}
  ]},
  {id:'firewalls',titulo:'Firewalls',icono:'🧱',descripcion:'Políticas, primera coincidencia, NAT, zonas y cada marca.',nodos:[
    {titulo:'Stateless vs stateful',proximo:true},
    {id:'politicas-firewall',gen:'fw/reglas',herramienta:'fw'},
    {titulo:'Objetos y servicios',proximo:true},
    {id:'nat',titulo:'NAT/PAT en el firewall',gen:'fw/nat',herramienta:'forti'},
    {titulo:'Zonas',proximo:true},
    {id:'marcas',titulo:'FortiGate, Palo Alto, Cisco ASA y pfSense',gen:'fw/marcas',herramienta:'marcas'},
    {titulo:'Buenas prácticas y auditoría de reglas',proximo:true}
  ]},
  {id:'vpn-cripto',titulo:'VPN y criptografía',icono:'🔐',descripcion:'Cifrado, hash, PKI, TLS e IPsec por fases.',nodos:[
    {id:'cripto',titulo:'Simétrica, asimétrica, hash y firmas',gen:'vpn/cripto'},
    {titulo:'Certificados y PKI',proximo:true},
    {titulo:'TLS',proximo:true},
    {id:'vpn-fases',titulo:'IPsec: fases 1 y 2',gen:'vpn/fases',herramienta:'vpn'},
    {titulo:'SSL VPN',proximo:true},
    {titulo:'Troubleshooting de túneles',proximo:true}
  ]},
  {id:'defensa',titulo:'Seguridad defensiva',icono:'🚨',descripcion:'Riesgo, autenticación, hardening, registros, detección y respuesta.',nodos:[
    {titulo:'CIA y gestión de riesgo',proximo:true},
    {titulo:'Autenticación y MFA',proximo:true},
    {titulo:'Gestión de parches',proximo:true},
    {titulo:'Hardening',proximo:true},
    {titulo:'Registros y SIEM',proximo:true},
    {titulo:'IDS/IPS',proximo:true},
    {id:'logs',titulo:'Lectura de logs y detección de ataques',gen:'def/logs'},
    {id:'incidentes',titulo:'Respuesta a incidentes',banco:'ciber/incidentes',herramienta:'incidentes'},
    {id:'repaso-seguridad',titulo:'Preguntas de seguridad',banco:'ciber/examen'},
    {titulo:'Copias de seguridad',proximo:true}
  ]},
  {id:'herramientas',titulo:'Escenarios y herramientas',icono:'🧰',descripcion:'Laboratorio, simuladores y calculadoras (siempre simulado y defensivo).',nodos:[
    {ir:'incidentes',titulo:'Laboratorio de incidentes',icono:'🚨'},
    {ir:'fw',titulo:'Simulador de políticas',icono:'🧱'},
    {ir:'vpn',titulo:'Simulador de VPN',icono:'🔐'},
    {ir:'subred',titulo:'Calculadora de subredes',icono:'🧮'},
    {ir:'redes',titulo:'Modelo OSI y puertos',icono:'🌐'},
    {ir:'vlan',titulo:'VLANs y Wi-Fi',icono:'📶'},
    {ir:'marcas',titulo:'Comparar marcas',icono:'🏷️'},
    {ir:'forti',titulo:'FortiGate a fondo',icono:'🛡️'},
    {ir:'quiz',titulo:'Examen rápido',icono:'📝'}
  ]}
];
