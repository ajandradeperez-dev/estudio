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
  ex:'Miles de orígenes a la vez apuntan a DDoS. Se combina limitación en el firewall (DoS policy) con mitigación aguas arriba, porque el enlace también se satura.'}
];
