export const vista=()=>`
<h1>Comparar marcas</h1>
<p class="lead">Los conceptos son los mismos; cambian los nombres y dónde se configuran.</p>
<div class="wrap"><table>
<tr><th>Concepto</th><th>FortiGate</th><th>Palo Alto</th><th>Cisco ASA / FTD</th><th>pfSense</th></tr>
${[['Regla de tráfico','Firewall Policy','Security Policy','Access List (ACL) / Access Control Policy','Firewall Rule'],
['Agrupar interfaces','Zone / Interface','Zone (obligatoria)','Security level / nameif','Interface group'],
['NAT de salida','NAT en la política o Central NAT','NAT Policy separada','Object NAT / Twice NAT','Outbound NAT (Automatic/Hybrid/Manual)'],
['Publicar un servidor','Virtual IP (VIP)','Destination NAT','Static NAT','Port Forward'],
['Reconocer aplicaciones','Application Control','App-ID','AVC (en FTD)','Paquete opcional (Snort/Suricata con OpenAppID)'],
['Detección de intrusos','IPS Sensor','Vulnerability Protection','Snort (FTD)','Snort o Suricata'],
['Filtrado web','Web Filter (FortiGuard)','URL Filtering','URL Filtering (FTD)','pfBlockerNG / Squid'],
['Antivirus','AntiVirus profile','Antivirus / WildFire','AMP / Malware (FTD)','ClamAV vía paquetes'],
['VPN sitio a sitio','IPsec Tunnel','IPsec Tunnel + IKE Gateway','crypto map / VTI','IPsec (Phase 1 / Phase 2)'],
['VPN de usuarios','FortiClient (SSL/IPsec)','GlobalProtect','AnyConnect / Secure Client','OpenVPN / WireGuard'],
['Gestión central','FortiManager','Panorama','FMC','Varios equipos sin consola central nativa'],
['Orden de evaluación','Arriba → abajo, primera coincidencia','Arriba → abajo, primera coincidencia','ACL arriba → abajo','Por interfaz de entrada, arriba → abajo'],
['Regla final','Implicit deny','interzone-default: deny','Implicit deny al final de la ACL','Default deny']]
.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<td><strong>${c}</strong></td>`).join('')}</tr>`).join('')}
</table></div>
<h2>Diferencia clave</h2>
<div class="grid">
<div class="card"><h3>FortiGate</h3><p style="margin:0">La política lleva acción, NAT y perfiles de seguridad juntos. Es la más directa para aprender.</p></div>
<div class="card"><h3>Palo Alto</h3><p style="margin:0">Piensa en aplicaciones (App-ID) en vez de puertos. Seguridad y NAT son tablas separadas.</p></div>
<div class="card"><h3>Cisco ASA</h3><p style="margin:0">ACL aplicadas a interfaces y niveles de seguridad (0 a 100). FTD agrega funciones NGFW.</p></div>
<div class="card"><h3>pfSense</h3><p style="margin:0">Código abierto. Las reglas se aplican en la interfaz por donde ENTRA el tráfico.</p></div>
</div>`;
