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
  ex:'El atacante desconecta a los usuarios (deauth) y les ofrece una copia abierta del SSID para espiar su tráfico. Con 802.1X el equipo verifica el certificado del servidor y no se une a la red falsa; el WIPS la detecta y contiene.'}
];
