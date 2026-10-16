/* Casos del laboratorio de incidentes (defensivo). La respuesta correcta se indica con a / da; las opciones se barajan una vez al iniciar la app */
export const incidents=[
 {t:'Muchos intentos de inicio de sesión',log:`date=2026-10-12 time=03:12:01 srcip=203.0.113.44 dstip=10.0.50.10 service=SSH action=deny msg="login failed user=admin"
date=2026-10-12 time=03:12:02 srcip=203.0.113.44 dstip=10.0.50.10 service=SSH action=deny msg="login failed user=root"
date=2026-10-12 time=03:12:02 srcip=203.0.113.44 dstip=10.0.50.10 service=SSH action=deny msg="login failed user=test"
... 2,431 eventos iguales en 10 minutos`,
  q:'¿Qué está pasando?',o:['Fuerza bruta de contraseñas','Tráfico normal de respaldo','Falla de DNS'],a:0,
  d:'¿Qué defensa aplicas primero?',do:['Permitir SSH solo desde IPs de administración o por VPN, y usar llaves o doble factor','Abrir más puertos para repartir la carga','Desactivar los registros para que no llenen el disco'],da:0,
  ex:'Un solo origen probando muchos usuarios es la firma clásica de fuerza bruta. SSH nunca debería estar abierto a todo Internet.'},
 {t:'Muchos puertos tocados en segundos',log:`srcip=198.51.100.7 dstip=200.10.10.5 dstport=21 action=deny
srcip=198.51.100.7 dstip=200.10.10.5 dstport=22 action=deny
srcip=198.51.100.7 dstip=200.10.10.5 dstport=23 action=deny
srcip=198.51.100.7 dstip=200.10.10.5 dstport=25 action=deny
... 1,000 puertos distintos en 8 segundos`,
  q:'¿Qué está pasando?',o:['Reconocimiento: escaneo de puertos','Actualización de Windows','Un usuario navegando'],a:0,
  d:'¿Qué haces?',do:['Confirmar que solo están publicados los servicios necesarios y dejar que el IPS bloquee al origen','Publicar todos los servicios para ver cuál le interesa','Reiniciar el firewall'],da:0,
  ex:'El escaneo es la fase de reconocimiento. La mejor defensa es una superficie pequeña: si solo existe la VIP 443, lo demás cae en la denegación implícita.'},
 {t:'Correo con enlace sospechoso',log:`webfilter: user=maria url=http://micr0soft-login.example/verify cat="Phishing" action=blocked
dnsfilter: qname=micr0soft-login.example category="Phishing" action=redirect`,
  q:'¿Qué intentó el atacante?',o:['Robar credenciales con phishing','Un escaneo de puertos','Un ataque físico'],a:0,
  d:'¿Qué capas ayudaron?',do:['Web Filter y DNS Filter; además, capacitar al usuario y activar doble factor','Ninguna, hay que quitar el firewall','Solo el antivirus del disco'],da:0,
  ex:'El dominio imita a una marca conocida. El filtrado web/DNS lo detuvo, pero la capacitación y el MFA son la defensa de fondo.'},
 {t:'Equipo interno hablando con un servidor raro cada minuto',log:`srcip=192.168.10.88 dstip=185.0.2.66 dstport=443 app="Unknown-SSL" bytes=512 interval=60s
srcip=192.168.10.88 dstip=185.0.2.66 dstport=443 app="Unknown-SSL" bytes=512 interval=60s
ips: botnet C&C signature match dst=185.0.2.66`,
  q:'¿Qué sugiere este patrón?',o:['Un equipo infectado contactando a su servidor de control','Una videollamada','Una impresora en red'],a:0,
  d:'¿Primera acción de respuesta?',do:['Aislar el equipo 192.168.10.88, bloquear el destino y revisar el equipo','Ignorarlo porque usa HTTPS','Dar más ancho de banda a ese equipo'],da:0,
  ex:'Conexiones pequeñas y periódicas a un mismo destino ("beaconing") son señal típica de malware. Primero se contiene, luego se investiga.'},
 {t:'Tráfico enorme hacia el servidor web',log:`srcip=varios (12,000 IPs) dstip=200.10.10.5 dstport=443 sessions=480,000/s
system: session table 95% full, CPU 98%`,
  q:'¿Qué ocurre?',o:['Denegación de servicio distribuida (DDoS)','Una campaña de marketing exitosa','Un respaldo nocturno'],a:0,
  d:'¿Cómo se mitiga?',do:['Políticas DoS con límites por origen y protección anti-DDoS del proveedor o en la nube','Desactivar el firewall para que no se sature','Cambiar la contraseña del administrador'],da:0,
  ex:'Miles de orígenes a la vez apuntan a DDoS. Se combina limitación en el firewall (DoS policy) con mitigación aguas arriba, porque el enlace también se satura.'},
 {t:'Archivos del servidor renombrados de golpe',log:`srcip=192.168.10.42 dstip=10.0.30.0/24 service=SMB dstport=445 action=accept sessions=1,850 en 3 minutos
ips: attack="SMB.Lateral.Movement" srcip=192.168.10.42 severity=critical action=detected
fileserver: 4,200 archivos renombrados a *.locked por user=lgomez
fileserver: nuevo archivo LEEME_RECUPERAR.txt en 312 carpetas`,
  q:'¿Qué está pasando?',o:['Ransomware cifrando archivos y propagándose por SMB','Un respaldo programado del servidor','Una actualización de antivirus'],a:0,
  d:'¿Primera acción de respuesta?',do:['Aislar el equipo 192.168.10.42, cortar SMB desde la red de usuarios y restaurar desde respaldos fuera de línea','Pagar el rescate para recuperar los archivos rápido','Reiniciar todos los servidores al mismo tiempo'],da:0,
  ex:'Miles de archivos renombrados y una nota de rescate son la firma del ransomware. Se contiene aislando el equipo; segmentar con políticas (usuarios → servidores solo lo necesario) y tener respaldos desconectados es lo que evita el desastre.'},
 {t:'Consultas DNS extrañas desde un solo equipo',log:`srcip=192.168.10.61 dstip=203.0.113.53 service=DNS qtype=TXT qname=Y2xpZW50ZXMuY3N2.a91.data-sync.example
srcip=192.168.10.61 dstip=203.0.113.53 service=DNS qtype=TXT qname=bm9taW5hXzIwMjYueGxzeA.a92.data-sync.example
srcip=192.168.10.61 dstip=203.0.113.53 service=DNS qtype=TXT qname=ZmFjdHVyYXMuemlw.a93.data-sync.example
... 38,000 consultas al mismo dominio en 1 hora`,
  q:'¿Qué sugiere este patrón?',o:['Robo de información escondido dentro de DNS (túnel DNS)','Navegación normal del usuario','Sincronización de la hora del equipo'],a:0,
  d:'¿Qué defensa aplicas?',do:['Permitir DNS solo hacia los servidores autorizados, bloquear el dominio con DNS Filter e investigar el equipo','Permitir el puerto 53 hacia cualquier destino','Desactivar el DNS en toda la red'],da:0,
  ex:'Subdominios largos y aleatorios hacia un mismo dominio, con un servidor DNS que no es el de la empresa, indican que se están sacando datos codificados. Por eso las políticas deben limitar DNS a servidores conocidos.'},
 {t:'El mismo usuario conectado desde dos países',log:`date=2026-10-12 time=08:02:11 vpn: user=jperez tunnel=ssl-vpn remip=192.0.2.40 country="México" action=tunnel-up
date=2026-10-12 time=08:21:47 vpn: user=jperez tunnel=ssl-vpn remip=198.51.100.230 country="Japón" action=tunnel-up
date=2026-10-12 time=08:23:05 user=jperez srcip=10.212.134.5 dstip=10.0.30.15 service=SMB bytes=2.1GB action=accept`,
  q:'¿Qué es lo más probable?',o:['Alguien usa las credenciales robadas del usuario','El usuario viajó a Japón en 20 minutos','El reloj del firewall está mal configurado'],a:0,
  d:'¿Qué haces primero?',do:['Cerrar la sesión VPN sospechosa, restablecer la contraseña y exigir doble factor en la VPN','Nada, porque el inicio de sesión fue exitoso','Apagar la VPN para todos los usuarios de forma permanente'],da:0,
  ex:'Dos conexiones imposibles de hacer por la misma persona ("viaje imposible") delatan credenciales robadas. El doble factor habría impedido el acceso aunque la contraseña se filtrara.'},
 {t:'Direcciones web raras contra el servidor público',log:`srcip=203.0.113.77 dstip=10.0.50.10 service=HTTPS url="/productos?id=5' OR '1'='1" ips: attack="SQL.Injection" severity=high action=blocked
srcip=203.0.113.77 dstip=10.0.50.10 service=HTTPS url="/login?user=admin'--" ips: attack="SQL.Injection" severity=high action=blocked
... 640 variaciones en 15 minutos desde el mismo origen`,
  q:'¿Qué intenta el atacante?',o:['Inyección SQL para leer o modificar la base de datos','Un buscador indexando el sitio','Un cliente que olvidó su contraseña'],a:0,
  d:'¿Cuál es la defensa correcta?',do:['Mantener el IPS/WAF en modo bloqueo, corregir la aplicación con consultas parametrizadas y revisar si hubo accesos','Desactivar el IPS porque genera demasiadas alertas','Publicar la base de datos directamente en Internet'],da:0,
  ex:'Comillas y fragmentos como OR 1=1 en la URL son intentos de inyección SQL. El IPS lo frenó esta vez, pero la defensa de fondo es corregir el código; el firewall es una capa más, no un sustituto.'},
 {t:'Usuarios conectados a un Wi-Fi que no es el de la empresa',log:`wids: ssid="Empresa" bssid=02:1a:2b:3c:4d:5e security=open channel=6 status=rogue (no pertenece al controlador)
wids: deauth flood ssid="Empresa" ap=AP-Piso2 frames=12,400/min
wifi: 9 clientes se desconectaron de AP-Piso2 y se asociaron a bssid=02:1a:2b:3c:4d:5e`,
  q:'¿Qué está pasando?',o:['Un punto de acceso falso (evil twin) que imita la red de la empresa','Un vecino que tiene un router de la misma marca','Interferencia de un horno de microondas'],a:0,
  d:'¿Qué defensa aplicas?',do:['Contener el AP falso con WIPS, usar WPA3-Enterprise con 802.1X y avisar a los usuarios','Cambiar el nombre del SSID todos los días','Pedir a los usuarios que se conecten a la red con mejor señal'],da:0,
  ex:'El atacante desconecta a los usuarios (deauth) y les ofrece una copia abierta del SSID para espiar su tráfico. Con 802.1X el equipo verifica el certificado del servidor y no se une a la red falsa; el WIPS la detecta y contiene.'},
 {t:'Una cuenta de servicio crea administradores de madrugada',log:`win-dc01: EventID=4720 user_created=soporte2 by=svc_backup time=02:41
win-dc01: EventID=4732 member_added=soporte2 group="Domain Admins" by=svc_backup time=02:42
win-dc01: EventID=4624 logon user=soporte2 src=10.0.20.57 type=RemoteInteractive time=02:47`,
  q:'¿Qué está pasando?',o:['Una cuenta comprometida está creando persistencia con privilegios altos','El respaldo nocturno funcionando normal','Un usuario que olvidó su contraseña'],a:0,
  d:'¿Qué haces primero?',do:['Deshabilitar svc_backup y soporte2, revocar sesiones, aislar 10.0.20.57 y revisar qué más hicieron','Esperar al lunes para preguntarle al equipo de respaldos','Agregar más cuentas al grupo de administradores para comparar'],da:0,
  ex:'Una cuenta de servicio no debería crear usuarios ni meterlos a Domain Admins. Es una señal clásica de persistencia: primero se contiene (deshabilitar cuentas y aislar el equipo) y luego se investiga con los registros.'},
 {t:'Decenas de avisos de doble factor que nadie pidió',log:`idp: mfa_push user=jlopez result=denied count=1 time=23:58
idp: mfa_push user=jlopez result=denied count=27 window=6min src_ip=198.51.100.23
idp: mfa_push user=jlopez result=approved time=00:05 src_ip=198.51.100.23`,
  q:'¿Qué está pasando?',o:['Fatiga de MFA: el atacante ya tiene la contraseña y bombardea avisos hasta que alguien acepta','Una falla del servidor de correo','El usuario está viajando'],a:0,
  d:'¿Qué haces?',do:['Revocar las sesiones, cambiar la contraseña, revisar lo que hizo la sesión y pasar a MFA con número de verificación o llaves FIDO2','Pedir al usuario que acepte todos los avisos para que paren','Desactivar el MFA de esa cuenta'],da:0,
  ex:'Si llegan avisos de MFA que no pediste, alguien tiene tu contraseña. Aceptar uno le abre la puerta. La defensa: nunca aceptar, reportar, y usar MFA resistente a la fatiga (número de verificación o llaves físicas).'},
 {t:'Un almacenamiento en la nube abierto a todo internet',log:`cloud-audit: bucket=respaldos-clientes acl=public-read objects=18,442 changed_by=dev_temp time=2026-10-02
cloud-access: GET /respaldos-clientes/clientes_2025.csv src_ip=203.0.113.150 user=anonymous
cloud-access: GET /respaldos-clientes/clientes_2024.csv src_ip=203.0.113.150 user=anonymous`,
  q:'¿Qué pasó?',o:['Una mala configuración dejó público el almacenamiento y alguien descargó datos de clientes','El proveedor de nube fue hackeado','Una copia de seguridad normal'],a:0,
  d:'¿Qué haces?',do:['Quitar el acceso público, conservar los registros, revisar qué se descargó, avisar al área legal y aplicar políticas que impidan buckets públicos','Borrar los registros para que no se sepa','Cambiar el nombre del bucket y no decir nada'],da:0,
  ex:'En la nube, la configuración es responsabilidad del cliente (modelo de responsabilidad compartida). Contener (quitar lo público), medir el alcance con los registros y cumplir con los avisos legales; después, controles que impidan repetirlo.'},
 {t:'Una memoria USB encontrada en el estacionamiento',log:`edr: device_connected type=USB_mass_storage label="NOMINA_2026" host=PC-RH-04 user=acastro
edr: process_start "NOMINA_2026.pdf.exe" parent=explorer.exe host=PC-RH-04
edr: outbound_connection host=PC-RH-04 dst=192.0.2.200:443 proc="NOMINA_2026.pdf.exe" verdict=malicious`,
  q:'¿Qué está pasando?',o:['Malware entregado en una USB «olvidada» (cebo) que el usuario abrió','Un documento de nómina normal','Una actualización del sistema'],a:0,
  d:'¿Qué haces?',do:['Aislar PC-RH-04 con el EDR, bloquear el destino, analizar el malware y bloquear el uso de USB no autorizadas; capacitar sobre cebos','Pasar la USB a otro equipo para ver si funciona','Formatear la PC sin revisar nada'],da:0,
  ex:'El «.pdf.exe» es un ejecutable disfrazado. Las USB tiradas a propósito son una técnica de ingeniería social. Se contiene el equipo, se bloquean USB no autorizadas y se enseña a entregar a TI cualquier dispositivo encontrado.'},
 {t:'Un proveedor «cambia» su cuenta bancaria',log:`mail: from="Facturación Proveedor" <facturas@proveedor-pagos.example> reply-to=<cobranza@pagos-rapidos.example>
mail: subject="URGENTE: nueva cuenta para el pago de hoy" attach=carta_banco.pdf spf=fail dmarc=fail
erp: solicitud cambio_cuenta proveedor=ACME monto=$184,500 solicitado_por=correo`,
  q:'¿Qué es?',o:['Fraude de correo empresarial (BEC) para desviar un pago','Un cambio de banco legítimo','Spam sin importancia'],a:0,
  d:'¿Qué haces?',do:['No pagar, confirmar por teléfono con el proveedor a su número conocido, reportar el correo y exigir doble aprobación para cambios de cuenta','Pagar rápido porque dice urgente','Responder al mismo correo para confirmar'],da:0,
  ex:'Urgencia, un reply-to distinto y SPF/DMARC fallidos son señales de BEC. Nunca se confirma por el mismo correo: se llama al número que ya tenías. Los cambios de cuenta deben pasar por doble aprobación.'},
 {t:'Servidores al 100 % de CPU hablando con un puerto raro',log:`monitor: host=srv-app02 cpu=100% sostenido 6h proceso="kworkerds"
fw: srcip=10.0.30.12 dstip=203.0.113.88 dstport=3333 app="Unknown-TCP" bytes_out=bajo duracion=6h
edr: file_created /tmp/.x/kworkerds hash=sospechoso origen=vulnerabilidad web sin parche`,
  q:'¿Qué está pasando?',o:['Criptominería maliciosa instalada a través de una vulnerabilidad sin parche','Un respaldo grande','El servidor procesando ventas de fin de mes'],a:0,
  d:'¿Qué haces?',do:['Aislar el servidor, eliminar el proceso y su persistencia, parchar la vulnerabilidad y bloquear el destino; revisar otros servidores','Comprar un servidor más potente','Ignorarlo porque no roba datos'],da:0,
  ex:'Un proceso con nombre que imita al sistema, CPU al máximo y conexión constante a un puerto de minería son señales de criptominería. Aunque «solo» use recursos, entró por una vulnerabilidad: el atacante podría hacer más. Contener, erradicar y parchar.'},
 {t:'Una PC se conecta a muchas otras por 445 y 3389',log:`netflow: src=10.0.10.45 dst=10.0.10.0/24 dstport=445 conexiones=212 en 4 min
netflow: src=10.0.10.45 dst=10.0.40.0/24 dstport=3389 conexiones=58 en 4 min
win: EventID=4625 logon_failed src=10.0.10.45 cuentas_distintas=37`,
  q:'¿Qué está pasando?',o:['Movimiento lateral desde un equipo comprometido','Un usuario imprimiendo','Sincronización normal de archivos'],a:0,
  d:'¿Qué haces?',do:['Aislar 10.0.10.45, revisar qué credenciales usó, restablecerlas y limitar SMB/RDP entre segmentos','Abrir más puertos para que termine rápido','Reiniciar todos los servidores'],da:0,
  ex:'Una sola PC probando cientos de equipos por SMB y RDP con muchas cuentas distintas es movimiento lateral. La segmentación y el mínimo privilegio lo frenan; aislar el equipo es la primera acción.'},
 {t:'«Su conexión no es privada» en el portal de clientes',log:`monitor-tls: host=portal.empresa.example cert_expiry=2026-10-14T23:59:59Z estado=EXPIRED
web: errores_tls=4,812 en 2 h motivo="certificate has expired"
cambios: ningún cambio registrado en las últimas 72 h`,
  q:'¿Qué está pasando?',o:['El certificado TLS venció; no hay señales de ataque','Un ataque on-path robando sesiones','El servidor fue hackeado'],a:0,
  d:'¿Qué haces?',do:['Renovar e instalar el certificado con su cadena completa, verificar y activar alertas y renovación automática','Pedir a los clientes que acepten la advertencia','Apagar el portal para siempre'],da:0,
  ex:'No todo incidente es un ataque: aquí el certificado venció a medianoche y nadie cambió nada. Pedir que acepten la advertencia los acostumbra a ignorar alertas reales. La lección es monitorear vencimientos y automatizar la renovación.'},
 {t:'Un empleado que renunció copia miles de archivos',log:`dlp: user=rmartinez action=upload dst="almacenamiento-personal.example" files=3,904 size=6.2GB
dlp: user=rmartinez action=copy dst=USB_E: files=1,210 label="Confidencial"
rrhh: rmartinez fecha_salida=2026-10-16 (aviso de renuncia 2026-10-01)`,
  q:'¿Qué está pasando?',o:['Posible fuga de información por una amenaza interna','Un respaldo autorizado','Una actualización del antivirus'],a:0,
  d:'¿Qué haces?',do:['Bloquear las cargas y el USB, conservar la evidencia, coordinar con RR. HH. y legal, y revisar sus accesos','Borrar los registros del DLP','Dar más permisos al empleado para que termine'],da:0,
  ex:'Copiar miles de archivos confidenciales justo antes de irse es una señal de amenaza interna. El DLP ayuda a detectarlo. Se contiene, se conserva la evidencia y se actúa con RR. HH. y legal, sin acusar antes de investigar.'},
 {t:'El fabricante avisa de una vulnerabilidad crítica en tu VPN',log:`aviso-fabricante: CVSS=9.8 producto=VPN-SSL versiones<7.4.3 explotacion_activa=SI
vpn: version=7.2.1 expuesta_a_internet=SI
vpn: login user=cuenta_inexistente status=success src=198.51.100.61 time=03:22  (no existe en el directorio)`,
  q:'¿Qué está pasando?',o:['Una vulnerabilidad crítica de la VPN probablemente ya fue explotada','Un usuario nuevo conectándose','Un falso positivo del aviso'],a:0,
  d:'¿Qué haces?',do:['Aplicar el parche o la mitigación del fabricante de emergencia, cortar sesiones, revisar indicadores de compromiso y rotar credenciales','Esperar a la ventana de mantenimiento del próximo mes','Desactivar los registros de la VPN'],da:0,
  ex:'CVSS 9.8, explotación activa y un equipo expuesto exigen un cambio de emergencia. Un login exitoso de una cuenta que no existe indica que ya pudieron entrar: además de parchar, hay que buscar qué hicieron (indicadores de compromiso) y rotar credenciales.'}
];
