export const vista=()=>`
<h1>Aprende seguridad de redes practicando</h1>
<p class="lead">Elige una sección. Todo ocurre dentro de esta página: los paquetes, firewalls y registros son simulados, así que puedes experimentar sin tocar ningún equipo real.</p>
<div class="grid">
 ${[['redes','Redes','Modelo OSI, puertos y protocolos que todo firewall usa.'],
    ['subred','Calculadora de subredes','Escribe una IP y máscara y ve red, broadcast y hosts.'],
    ['fw','Simulador de políticas','Crea reglas, envía un paquete y mira qué regla lo atrapa. Cambia entre FortiGate, Palo Alto, Cisco ASA y pfSense.'],
    ['marcas','Comparar marcas','Cómo se llama lo mismo en cada fabricante.'],
    ['forti','FortiGate a fondo','Políticas, NAT/VIP, VPN y perfiles de seguridad explicados.'],
    ['incidentes','Laboratorio de incidentes','Lee registros simulados, identifica el ataque y elige la defensa correcta.'],
    ['quiz','Examen rápido','Pon a prueba lo aprendido.']]
   .map(([k,t,d])=>`<div class="card click" data-go="${k}" tabindex="0"><h3>${t}</h3><p style="margin:0;color:var(--muted)">${d}</p></div>`).join('')}
</div>`;
