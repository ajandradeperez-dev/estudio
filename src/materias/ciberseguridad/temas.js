/* Temas del curso de Ciberseguridad y sus nodos, en el orden de src/contenido/PLAN.md (ver cargarTemas en nucleo/cargar.js).
   Referencias: CompTIA Network+ (N10-009) y Security+ (SY0-701), por dominio; Cisco CCNA (200-301) para conmutación y
   enrutamiento; documentación oficial de cada fabricante para los firewalls. Siempre defensivo y simulado.
   Los ids de tema van en la URL y los de habilidad en el progreso: no los cambies.
   herramienta: sección de la materia que se abre desde la habilidad (y que a su vez ofrece "Practicar" esa habilidad).
   Cada nodo: ref (temario) y obj (objetivo). Los nodos {titulo, proximo:true} faltan. */
export default [
  {id:'redes-y-protocolos',titulo:'Fundamentos de redes',icono:'🌐',descripcion:'OSI y TCP/IP, medios, Ethernet, IPv4 y subredes, IPv6, puertos, DNS, DHCP, NAT y ARP.',
   referencias:['CompTIA Network+ N10-009 — dominio 1 «Conceptos de redes»','Cisco Networking Academy, CCNA 1 «Introducción a las redes»'],nodos:[
    {id:'osi-tcpip',titulo:'Modelos OSI y TCP/IP',gen:'red/osi',ref:'Network+ 1.1 – Modelo OSI',obj:'ubicar protocolos, dispositivos y fallas en la capa OSI que corresponde.'},
    {titulo:'Cableado y medios (concepto)',proximo:true,ref:'Network+ 1.5 – Medios de transmisión y tipos de cable'},
    {titulo:'Ethernet y direcciones MAC',proximo:true,ref:'Network+ 1.x · CCNA 1 – Ethernet'},
    {id:'ipv4-clases',titulo:'Direcciones IP y clases',gen:'red/ipv4',ref:'Network+ 1.7 – Direccionamiento IPv4',obj:'reconocer clases, rangos privados y direcciones especiales de IPv4.'},
    {id:'binario-hex',titulo:'Binario, decimal y hexadecimal',gen:'red/bases',ref:'CCNA 1 – Sistemas numéricos',obj:'convertir entre binario, decimal y hexadecimal.'},
    {id:'subredes-cidr',gen:'red/subred',herramienta:'subred',ref:'Network+ 1.7 – Subredes y CIDR',obj:'calcular red, broadcast, hosts y rango utilizable de una subred CIDR.'},
    {id:'mascaras',titulo:'Máscara de subred /24 a /30',gen:'red/mascara',herramienta:'subred',ref:'Network+ 1.7 – Máscaras de subred',obj:'pasar de prefijo a máscara decimal y viceversa.'},
    {id:'prefijo-hosts',titulo:'Prefijo para N hosts',gen:'red/prefijo-hosts',herramienta:'subred',ref:'Network+ 1.7 – Diseño de subredes',obj:'elegir el prefijo más pequeño que alcanza para N hosts.'},
    {id:'vlsm',titulo:'VLSM',gen:'red/vlsm',herramienta:'subred',ref:'Network+ 1.7 · CCNA 1 – VLSM',obj:'repartir una red en subredes de distinto tamaño con VLSM.'},
    {id:'ipv6',titulo:'IPv6 básico',gen:'red/ipv6',ref:'Network+ 1.7 – Direccionamiento IPv6',obj:'abreviar y expandir direcciones IPv6 y reconocer sus tipos.'},
    {id:'puertos-y-servicios',gen:'red/puertos',herramienta:'redes',ref:'Network+ 1.4 – Puertos y protocolos comunes',obj:'relacionar servicios con sus puertos y su protocolo de transporte.'},
    {id:'dns',titulo:'DNS',gen:'red/dns',ref:'Network+ 1.6 – Servicios de red: DNS',obj:'interpretar registros DNS, la resolución y el TTL.'},
    {id:'dhcp',titulo:'DHCP',gen:'red/dhcp',ref:'Network+ 1.6 – Servicios de red: DHCP',obj:'explicar DORA, el préstamo y calcular el tamaño de un pool.'},
    {titulo:'NAT y PAT',proximo:true,ref:'Network+ 1.7 – NAT/PAT'},
    {id:'arp',titulo:'ARP',gen:'red/arp',ref:'Network+ 1.x · CCNA 1 – ARP',obj:'saber a quién pregunta ARP y detectar señales de ARP spoofing.'}
  ]},
  {id:'conmutacion',titulo:'Conmutación y enrutamiento',icono:'🔀',descripcion:'Switches, VLAN y trunks, STP, rutas estáticas y por defecto, OSPF y Wi-Fi.',
   referencias:['Cisco Networking Academy, CCNA 2 «Conmutación, enrutamiento y redes inalámbricas»','CompTIA Network+ N10-009 — dominio 2 «Implementación de redes»'],nodos:[
    {titulo:'Switches, MAC y tablas',proximo:true,ref:'Network+ 2.x · CCNA 2 – Conmutación'},
    {titulo:'VLAN y trunks',proximo:true,ref:'Network+ 2.x · CCNA 2 – VLAN y 802.1Q'},
    {titulo:'STP (concepto)',proximo:true,ref:'CCNA 2 – Spanning Tree Protocol'},
    {titulo:'Enrutamiento estático',proximo:true,ref:'Network+ 2.x · CCNA 2 – Rutas estáticas'},
    {titulo:'Rutas por defecto',proximo:true,ref:'CCNA 2 – Ruta por defecto'},
    {titulo:'OSPF (concepto)',proximo:true,ref:'CCNA 3 – OSPF de área única'},
    {titulo:'Wi-Fi: estándares y seguridad WPA2/WPA3',proximo:true,ref:'Network+ 2.x · CCNA 2 – WLAN'}
  ]},
  {id:'operacion-redes',titulo:'Operación y troubleshooting de redes',icono:'🩺',descripcion:'Servicios de red, monitoreo (SNMP, syslog, NetFlow) y diagnóstico paso a paso.',
   referencias:['CompTIA Network+ N10-009 — dominios 3 «Operaciones» y 5 «Troubleshooting»'],nodos:[
    {titulo:'Servicios de red: NTP, SNMP y syslog',proximo:true,ref:'Network+ 3.x – Servicios y monitoreo'},
    {titulo:'Monitoreo: SNMP, syslog y NetFlow',proximo:true,ref:'Network+ 3.x – Monitoreo de red'},
    {titulo:'Troubleshooting metodológico',proximo:true,ref:'Network+ 5.1 – Metodología de resolución de problemas'}
  ]},
  {id:'firewalls',titulo:'Firewalls',icono:'🧱',descripcion:'Stateless, stateful y NGFW, políticas y orden, objetos, NAT, zonas, VPN y cada marca.',
   referencias:['Documentación oficial: FortiOS Administration Guide, PAN-OS Administrator’s Guide, Cisco Secure Firewall ASA, pfSense Documentation','CompTIA Security+ SY0-701 — 3.x «Arquitectura segura»'],nodos:[
    {titulo:'Stateless, stateful y NGFW',proximo:true,ref:'Security+ 3.x – Tipos de firewall'},
    {id:'politicas-firewall',gen:'fw/reglas',herramienta:'fw',ref:'Security+ 3.x / 4.x – Reglas de firewall y orden de evaluación',obj:'decidir qué regla se aplica a un paquete (primera coincidencia y deny implícito).'},
    {titulo:'Objetos y servicios',proximo:true,ref:'FortiOS / PAN-OS – Objetos de dirección y servicio (concepto general)'},
    {id:'nat',titulo:'NAT/PAT en el firewall',gen:'fw/nat',herramienta:'forti',ref:'Network+ 1.7 · FortiOS – NAT y VIP',obj:'calcular cómo cambia un paquete con SNAT, DNAT/VIP y PAT.'},
    {titulo:'Zonas',proximo:true,ref:'PAN-OS / FortiOS – Zonas e interfaces (concepto general)'},
    {titulo:'VPN en el firewall',proximo:true,ref:'FortiOS – IPsec VPN (concepto general)'},
    {id:'marcas',titulo:'FortiGate, Palo Alto, Cisco ASA y pfSense',gen:'fw/marcas',herramienta:'marcas',ref:'Documentación oficial de cada fabricante – equivalencias de conceptos',obj:'reconocer el mismo concepto en FortiGate, Palo Alto, Cisco ASA y pfSense.'},
    {titulo:'Buenas prácticas y auditoría de reglas',proximo:true,ref:'Security+ 4.x – Endurecimiento y revisión de reglas'}
  ]},
  {id:'vpn-cripto',titulo:'Criptografía y VPN',icono:'🔐',descripcion:'Simétrica, asimétrica, hashes, firmas, PKI, TLS, IPsec por fases y SSL VPN.',
   referencias:['CompTIA Security+ SY0-701 — 1.4 «Soluciones criptográficas»','RFC 7296 (IKEv2) y RFC 8446 (TLS 1.3), como referencia'],nodos:[
    {id:'cripto',titulo:'Simétrica, asimétrica, hash y firmas',gen:'vpn/cripto',ref:'Security+ 1.4 – Criptografía',obj:'elegir cifrado simétrico, asimétrico, hash o firma según el objetivo de seguridad.'},
    {titulo:'Certificados y PKI',proximo:true,ref:'Security+ 1.4 – Certificados y PKI'},
    {titulo:'TLS',proximo:true,ref:'Security+ 1.4 / 3.x – TLS'},
    {id:'vpn-fases',titulo:'IPsec: fases 1 y 2',gen:'vpn/fases',herramienta:'vpn',ref:'Security+ 3.x · RFC 7296 – IPsec e IKE',obj:'identificar en qué fase falla un túnel IPsec y por qué.'},
    {titulo:'SSL VPN',proximo:true,ref:'Security+ 3.x – Acceso remoto'},
    {titulo:'Troubleshooting de túneles',proximo:true,ref:'FortiOS – Diagnóstico de VPN (concepto general)'}
  ]},
  {id:'defensa',titulo:'Security+: seguridad defensiva',icono:'🚨',descripcion:'CIA, AAA y controles, amenazas, arquitectura segura, operaciones (hardening, parches, IAM, SIEM, IDS/IPS, incidentes) y gobierno.',
   referencias:['CompTIA Security+ SY0-701 — los 5 dominios','NIST SP 800-61 «Computer Security Incident Handling Guide»'],nodos:[
    {titulo:'CIA, AAA y tipos de controles',proximo:true,ref:'Security+ 1.1–1.2 – Conceptos generales de seguridad'},
    {titulo:'Amenazas y vulnerabilidades (reconocer y mitigar)',proximo:true,ref:'Security+ 2.x – Amenazas, vulnerabilidades y mitigaciones'},
    {titulo:'Ingeniería social y phishing',proximo:true,ref:'Security+ 2.2 – Vectores de amenaza'},
    {titulo:'Arquitectura segura',proximo:true,ref:'Security+ 3.x – Arquitectura de seguridad'},
    {titulo:'Identidades, accesos y MFA',proximo:true,ref:'Security+ 4.6 – Gestión de identidades y accesos'},
    {titulo:'Gestión de parches',proximo:true,ref:'Security+ 4.3 – Gestión de vulnerabilidades'},
    {titulo:'Hardening',proximo:true,ref:'Security+ 4.1 – Técnicas de endurecimiento'},
    {titulo:'Registros y SIEM',proximo:true,ref:'Security+ 4.4 – Monitoreo y SIEM'},
    {titulo:'IDS/IPS',proximo:true,ref:'Security+ 4.5 – IDS/IPS'},
    {id:'logs',titulo:'Lectura de logs y detección de ataques',gen:'def/logs',ref:'Security+ 4.9 – Fuentes de datos para investigar',obj:'reconocer patrones de ataque en registros y decidir la respuesta.'},
    {id:'incidentes',titulo:'Respuesta a incidentes (NIST)',banco:'ciber/incidentes',herramienta:'incidentes',ref:'Security+ 4.8 · NIST SP 800-61 – Respuesta a incidentes',obj:'diagnosticar un incidente y elegir la respuesta defensiva correcta.'},
    {titulo:'Forense básico (concepto)',proximo:true,ref:'Security+ 4.8 – Forense digital'},
    {titulo:'Copias de seguridad',proximo:true,ref:'Security+ 3.4 – Resiliencia y respaldos'},
    {titulo:'Riesgo, políticas y cumplimiento',proximo:true,ref:'Security+ 5.x – Gestión del programa de seguridad'},
    {titulo:'Concienciación',proximo:true,ref:'Security+ 5.6 – Concienciación en seguridad'},
    {id:'repaso-seguridad',titulo:'Preguntas de seguridad',banco:'ciber/examen',ref:'Security+ – Repaso general',obj:'responder preguntas generales de seguridad defensiva.'}
  ]},
  {id:'herramientas',titulo:'Escenarios y herramientas',icono:'🧰',descripcion:'Laboratorio, simuladores y calculadoras (siempre simulado y defensivo).',
   referencias:['Los simuladores son didácticos: la sintaxis real está en la documentación de cada fabricante'],nodos:[
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
