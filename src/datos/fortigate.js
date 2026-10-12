/* Temas de "FortiGate a fondo": [título, explicación, ejemplo de CLI] */
export const fortiTopics={
 pol:['Políticas',`Cada política responde: ¿de qué interfaz a qué interfaz?, ¿quién?, ¿hacia dónde?, ¿qué servicio?, ¿cuándo? y ¿qué hago? (accept/deny).
Orden: de arriba hacia abajo; la primera que coincide gana. Si nada coincide: implicit deny (política 0).
Buenas prácticas:
 • Reglas específicas arriba y generales abajo.
 • Activa "Log Allowed Traffic" para poder investigar.
 • Usa objetos y grupos de direcciones en vez de IPs sueltas.`,
`config firewall address
    edit "LAN-Usuarios"
        set subnet 192.168.10.0 255.255.255.0
    next
end`],
 nat:['NAT y VIP',`NAT de origen (salida a Internet): se activa en la política con "set nat enable"; la IP privada sale como la IP de la interfaz WAN.
IP Pool: si quieres salir con otra IP pública distinta a la de la interfaz.
VIP (Virtual IP) = NAT de destino: publica un servidor interno. Luego creas una política WAN → DMZ con la VIP como destino.`,
`config firewall vip
    edit "VIP-Web"
        set extintf "wan1"
        set extip 200.10.10.5
        set mappedip "10.0.50.10"
        set portforward enable
        set extport 443
        set mappedport 443
    next
end`],
 vpn:['VPN',`IPsec sitio a sitio une dos oficinas:
 • Fase 1: los equipos se autentican (IKE, clave o certificado).
 • Fase 2: definen qué redes viajan por el túnel.
 • Necesitas políticas LAN → túnel y túnel → LAN, más una ruta estática hacia la red remota.
VPN de usuarios: FortiClient con SSL VPN o IPsec dial-up, idealmente con doble factor.`,
`config vpn ipsec phase1-interface
    edit "A-Sucursal"
        set interface "wan1"
        set remote-gw 198.51.100.20
        set proposal aes256-sha256
        set psksecret ********
    next
end
config vpn ipsec phase2-interface
    edit "A-Sucursal-p2"
        set phase1name "A-Sucursal"
        set src-subnet 192.168.10.0 255.255.255.0
        set dst-subnet 192.168.20.0 255.255.255.0
    next
end`],
 utm:['Perfiles de seguridad',`Se agregan a una política que permite tráfico:
 • AntiVirus: revisa archivos descargados.
 • Web Filter: bloquea categorías (malware, phishing, apuestas).
 • Application Control: identifica apps aunque usen el puerto 443.
 • IPS: detecta firmas de explotación conocidas.
 • DNS Filter: bloquea dominios maliciosos al resolverlos.
 • Inspección SSL: sin ella, casi todo HTTPS es opaco para los perfiles.`,
`config firewall policy
    edit 1
        set utm-status enable
        set av-profile "default"
        set webfilter-profile "default"
        set application-list "default"
        set ips-sensor "default"
        set ssl-ssh-profile "certificate-inspection"
    next
end`],
 diag:['Diagnóstico',`Comandos que un administrador usa para entender por qué un paquete pasa o no pasa:
 • diagnose sniffer packet: ver los paquetes en una interfaz.
 • diagnose debug flow: seguir el camino del paquete y ver qué política lo atrapa.
 • get router info routing-table all: revisar rutas.
 • diagnose sys session list: ver sesiones activas.`,
`diagnose debug flow filter addr 192.168.10.25
diagnose debug flow show function-name enable
diagnose debug enable
diagnose debug flow trace start 10
# ... al terminar:
diagnose debug disable`]
};
