export const vista=()=>`
<h1>Redes</h1>
<p class="lead">Un firewall decide con información de varias capas. Las clásicas (capa 3 y 4) miran IP y puerto; los de nueva generación (NGFW) llegan a capa 7 y reconocen aplicaciones.</p>
<h2>Modelo OSI</h2>
<div class="osi">
${[[7,'Aplicación','HTTP, DNS, SSH. Aquí trabajan App Control, WebFilter e IPS.'],[6,'Presentación','Cifrado TLS, codificación. Inspección SSL profunda.'],[5,'Sesión','Mantener conversaciones abiertas.'],[4,'Transporte','TCP/UDP y puertos. El firewall stateful sigue el estado de cada sesión.'],[3,'Red','Direcciones IP y enrutamiento. Políticas por origen/destino.'],[2,'Enlace','MAC, VLAN, switches.'],[1,'Física','Cables, fibra, señal.']]
 .map(([n,t,d])=>`<div><b>L${n}</b><span><strong>${t}</strong></span><span>${d}</span></div>`).join('')}
</div>
<h2>Puertos que verás en todas las políticas</h2>
<div class="wrap"><table><tr><th>Servicio</th><th>Protocolo</th><th>Puerto</th><th>Nota de seguridad</th></tr>
${[['HTTP','TCP','80','Sin cifrar; redirige a HTTPS.'],['HTTPS','TCP','443','El más usado; requiere inspección SSL para ver contenido.'],['SSH','TCP','22','Administración: limítalo a IPs de administradores.'],['DNS','UDP/TCP','53','Controla qué servidores DNS se permiten.'],['RDP','TCP','3389','Nunca expuesto directo a Internet; usa VPN.'],['SMTP','TCP','25','Solo los servidores de correo deberían usarlo.'],['SNMP','UDP','161','Usa v3 y restringe orígenes.'],['IPsec','UDP','500/4500','Usado por VPN sitio a sitio.']]
 .map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>
<h2>Stateful en una frase</h2>
<p class="lead">Si permites que la LAN abra una conexión a Internet, la respuesta vuelve sola: el firewall recuerda la sesión. Por eso casi nunca necesitas una regla de "regreso".</p>`;
