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
    {id:'cableado',titulo:'Cableado y medios (concepto)',gen:'red/cableado',ref:'Network+ 1.5 – Medios de transmisión y tipos de cable',obj:'elegir el medio adecuado (cobre o fibra) según distancia, velocidad e interferencia.'},
    {id:'ethernet-mac',titulo:'Ethernet y direcciones MAC',gen:'red/ethernet',ref:'Network+ 1.x · CCNA 1 – Ethernet',obj:'leer direcciones MAC, reconocer el OUI y el broadcast, y entender la MTU.'},
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
    {id:'nat-pat',titulo:'NAT y PAT',gen:'red/nat-pat',ref:'Network+ 1.7 – NAT/PAT',obj:'distinguir NAT estático, dinámico, PAT y port forwarding, y reconocer rangos privados.'},
    {id:'arp',titulo:'ARP',gen:'red/arp',ref:'Network+ 1.x · CCNA 1 – ARP',obj:'saber a quién pregunta ARP y detectar señales de ARP spoofing.'}
  ]},
  {id:'conmutacion',titulo:'Conmutación y enrutamiento',icono:'🔀',descripcion:'Switches, VLAN y trunks, STP, rutas estáticas y por defecto, OSPF y Wi-Fi.',
   referencias:['Cisco Networking Academy, CCNA 2 «Conmutación, enrutamiento y redes inalámbricas»','CompTIA Network+ N10-009 — dominio 2 «Implementación de redes»'],nodos:[
    {id:'switches',titulo:'Switches, MAC y tablas',gen:'sw/switches',ref:'Network+ 2.x · CCNA 2 – Conmutación',obj:'explicar cómo aprende y reenvía un switch y qué son los dominios de colisión y broadcast.'},
    {id:'vlan-trunks',titulo:'VLAN y trunks',gen:'sw/vlan',ref:'Network+ 2.x · CCNA 2 – VLAN y 802.1Q',obj:'separar redes con VLAN y llevar varias por un trunk 802.1Q.'},
    {id:'stp',titulo:'STP (concepto)',gen:'sw/stp',ref:'CCNA 2 – Spanning Tree Protocol',obj:'explicar cómo STP evita bucles y elegir el root bridge.'},
    {id:'enrutamiento-estatico',titulo:'Enrutamiento estático',gen:'sw/estatico',ref:'Network+ 2.x · CCNA 2 – Rutas estáticas',obj:'elegir la ruta correcta por prefijo más largo y distancia administrativa.'},
    {id:'rutas-defecto',titulo:'Rutas por defecto',gen:'sw/defecto',ref:'CCNA 2 – Ruta por defecto',obj:'usar la ruta por defecto y la puerta de enlace para salir de la red.'},
    {id:'ospf',titulo:'OSPF (concepto)',gen:'sw/ospf',ref:'CCNA 3 – OSPF de área única',obj:'explicar cómo OSPF elige caminos por costo y organiza áreas.'},
    {id:'wifi',titulo:'Wi-Fi: estándares y seguridad WPA2/WPA3',gen:'sw/wifi',ref:'Network+ 2.x · CCNA 2 – WLAN',obj:'elegir banda, canales y seguridad Wi-Fi (WPA2/WPA3, Enterprise).'}
  ]},
  {id:'operacion-redes',titulo:'Operación y troubleshooting de redes',icono:'🩺',descripcion:'Servicios de red, monitoreo (SNMP, syslog, NetFlow) y diagnóstico paso a paso.',
   referencias:['CompTIA Network+ N10-009 — dominios 3 «Operaciones» y 5 «Troubleshooting»'],nodos:[
    {id:'servicios-red',titulo:'Servicios de red: NTP, SNMP y syslog',gen:'op/servicios',ref:'Network+ 3.x – Servicios y monitoreo',obj:'configurar con criterio NTP, SNMPv3 y syslog central.'},
    {id:'monitoreo',titulo:'Monitoreo: SNMP, syslog y NetFlow',gen:'op/monitoreo',ref:'Network+ 3.x – Monitoreo de red',obj:'combinar métricas, eventos y flujos para detectar anomalías contra una línea base.'},
    {id:'troubleshooting',titulo:'Troubleshooting metodológico',gen:'op/troubleshooting',ref:'Network+ 5.1 – Metodología de resolución de problemas',obj:'resolver fallas de red con los 7 pasos de la metodología.'}
  ]},
  {id:'firewalls',titulo:'Firewalls',icono:'🧱',descripcion:'Stateless, stateful y NGFW, políticas y orden, objetos, NAT, zonas, VPN y cada marca.',
   referencias:['Documentación oficial: FortiOS Administration Guide, PAN-OS Administrator’s Guide, Cisco Secure Firewall ASA, pfSense Documentation','CompTIA Security+ SY0-701 — 3.x «Arquitectura segura»'],nodos:[
    {id:'tipos-firewall',titulo:'Stateless, stateful y NGFW',gen:'fw/tipos',ref:'Security+ 3.x – Tipos de firewall',obj:'distinguir firewall stateless, stateful, NGFW y WAF.'},
    {id:'politicas-firewall',gen:'fw/reglas',herramienta:'fw',ref:'Security+ 3.x / 4.x – Reglas de firewall y orden de evaluación',obj:'decidir qué regla se aplica a un paquete (primera coincidencia y deny implícito).'},
    {id:'objetos',titulo:'Objetos y servicios',gen:'fw/objetos',ref:'FortiOS / PAN-OS – Objetos de dirección y servicio (concepto general)',obj:'organizar reglas con objetos de dirección, de servicio y grupos.'},
    {id:'nat',titulo:'NAT/PAT en el firewall',gen:'fw/nat',herramienta:'forti',ref:'Network+ 1.7 · FortiOS – NAT y VIP',obj:'calcular cómo cambia un paquete con SNAT, DNAT/VIP y PAT.'},
    {id:'zonas',titulo:'Zonas',gen:'fw/zonas',ref:'PAN-OS / FortiOS – Zonas e interfaces (concepto general)',obj:'diseñar zonas (interna, externa y DMZ) y las reglas entre ellas.'},
    {id:'vpn-firewall',titulo:'VPN en el firewall',gen:'fw/vpn',ref:'FortiOS – IPsec VPN (concepto general)',obj:'configurar con criterio VPN sitio a sitio y de acceso remoto: túnel, rutas y reglas.'},
    {id:'marcas',titulo:'FortiGate, Palo Alto, Cisco ASA y pfSense',gen:'fw/marcas',herramienta:'marcas',ref:'Documentación oficial de cada fabricante – equivalencias de conceptos',obj:'reconocer el mismo concepto en FortiGate, Palo Alto, Cisco ASA y pfSense.'},
    {id:'auditoria-reglas',titulo:'Buenas prácticas y auditoría de reglas',gen:'fw/auditoria',ref:'Security+ 4.x – Endurecimiento y revisión de reglas',obj:'auditar reglas: mínimo privilegio, sombreadas, sin uso y documentadas.'}
  ]},
  {id:'vpn-cripto',titulo:'Criptografía y VPN',icono:'🔐',descripcion:'Simétrica, asimétrica, hashes, firmas, PKI, TLS, IPsec por fases y SSL VPN.',
   referencias:['CompTIA Security+ SY0-701 — 1.4 «Soluciones criptográficas»','RFC 7296 (IKEv2) y RFC 8446 (TLS 1.3), como referencia'],nodos:[
    {id:'cripto',titulo:'Simétrica, asimétrica, hash y firmas',gen:'vpn/cripto',ref:'Security+ 1.4 – Criptografía',obj:'elegir cifrado simétrico, asimétrico, hash o firma según el objetivo de seguridad.'},
    {id:'pki',titulo:'Certificados y PKI',gen:'vpn/pki',ref:'Security+ 1.4 – Certificados y PKI',obj:'explicar certificados, CA, cadena de confianza y revocación.'},
    {id:'tls',titulo:'TLS',gen:'vpn/tls',ref:'Security+ 1.4 / 3.x – TLS',obj:'explicar el handshake de TLS y elegir versiones y cifrados seguros.'},
    {id:'vpn-fases',titulo:'IPsec: fases 1 y 2',gen:'vpn/fases',herramienta:'vpn',ref:'Security+ 3.x · RFC 7296 – IPsec e IKE',obj:'identificar en qué fase falla un túnel IPsec y por qué.'},
    {id:'ssl-vpn',titulo:'SSL VPN',gen:'vpn/ssl',ref:'Security+ 3.x – Acceso remoto',obj:'elegir entre portal y túnel, y proteger una SSL VPN con MFA y parches.'},
    {id:'troubleshooting-tuneles',titulo:'Troubleshooting de túneles',gen:'vpn/tuneles',ref:'FortiOS – Diagnóstico de VPN (concepto general)',obj:'diagnosticar un túnel IPsec fase por fase.'}
  ]},
  {id:'defensa',titulo:'Security+: seguridad defensiva',icono:'🚨',descripcion:'CIA, AAA y controles, amenazas, arquitectura segura, operaciones (hardening, parches, IAM, SIEM, IDS/IPS, incidentes) y gobierno.',
   referencias:['CompTIA Security+ SY0-701 — los 5 dominios','NIST SP 800-61 «Computer Security Incident Handling Guide»'],nodos:[
    {id:'cia-aaa',titulo:'CIA, AAA y tipos de controles',gen:'def/cia',ref:'Security+ 1.1–1.2 – Conceptos generales de seguridad',obj:'clasificar riesgos por la CIA y controles por categoría y función.'},
    {id:'amenazas',titulo:'Amenazas y vulnerabilidades (reconocer y mitigar)',gen:'def/amenazas',ref:'Security+ 2.x – Amenazas, vulnerabilidades y mitigaciones',obj:'reconocer malware y ataques comunes y elegir su mitigación.'},
    {id:'ingenieria-social',titulo:'Ingeniería social y phishing',gen:'def/social',ref:'Security+ 2.2 – Vectores de amenaza',obj:'reconocer y reportar phishing, vishing, smishing, BEC y tailgating.'},
    {id:'arquitectura',titulo:'Arquitectura segura',gen:'def/arquitectura',ref:'Security+ 3.x – Arquitectura de seguridad',obj:'aplicar defensa en profundidad, segmentación y confianza cero.'},
    {id:'identidades',titulo:'Identidades, accesos y MFA',gen:'def/iam',ref:'Security+ 4.6 – Gestión de identidades y accesos',obj:'gestionar identidades con MFA, SSO, RBAC y bajas a tiempo.'},
    {id:'parches',titulo:'Gestión de parches',gen:'def/parches',ref:'Security+ 4.3 – Gestión de vulnerabilidades',obj:'priorizar y aplicar parches con inventario, CVSS, pruebas y verificación.'},
    {id:'hardening',titulo:'Hardening',gen:'def/hardening',ref:'Security+ 4.1 – Técnicas de endurecimiento',obj:'reducir la superficie de ataque con una línea base segura.'},
    {id:'siem',titulo:'Registros y SIEM',gen:'def/siem',ref:'Security+ 4.4 – Monitoreo y SIEM',obj:'usar un SIEM para correlacionar, alertar y afinar falsos positivos.'},
    {id:'ids-ips',titulo:'IDS/IPS',gen:'def/ids',ref:'Security+ 4.5 – IDS/IPS',obj:'elegir entre IDS e IPS y entre detección por firmas y por anomalías.'},
    {id:'logs',titulo:'Lectura de logs y detección de ataques',gen:'def/logs',ref:'Security+ 4.9 – Fuentes de datos para investigar',obj:'reconocer patrones de ataque en registros y decidir la respuesta.'},
    {id:'incidentes',gen:'def/incidentes',titulo:'Respuesta a incidentes (NIST)',banco:'ciber/incidentes',herramienta:'incidentes',ref:'Security+ 4.8 · NIST SP 800-61 – Respuesta a incidentes',obj:'diagnosticar un incidente y elegir la respuesta defensiva correcta.'},
    {id:'forense',titulo:'Forense básico (concepto)',gen:'def/forense',ref:'Security+ 4.8 – Forense digital',obj:'conservar evidencia: orden de volatilidad, cadena de custodia y hashes.'},
    {id:'respaldos',titulo:'Copias de seguridad',gen:'def/respaldos',ref:'Security+ 3.4 – Resiliencia y respaldos',obj:'diseñar respaldos 3-2-1 con RPO y RTO, y probar restauraciones.'},
    {id:'riesgo',titulo:'Riesgo, políticas y cumplimiento',gen:'def/riesgo',ref:'Security+ 5.x – Gestión del programa de seguridad',obj:'calcular y responder al riesgo (SLE, ALE) y relacionarlo con políticas.'},
    {id:'concienciacion',titulo:'Concienciación',gen:'def/concienciacion',ref:'Security+ 5.6 – Concienciación en seguridad',obj:'diseñar y medir un programa de concienciación en seguridad.'},
    {id:'repaso-seguridad',gen:'def/repaso',titulo:'Preguntas de seguridad',banco:'ciber/examen',ref:'Security+ – Repaso general',obj:'responder preguntas generales de seguridad defensiva.'}
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
