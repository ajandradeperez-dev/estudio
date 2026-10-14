import {esc} from '../../../utilidades.js';

const cliVlan=`config system interface
    edit "vlan20-usuarios"
        set interface "internal1"
        set vlanid 20
        set ip 192.168.20.1 255.255.255.0
        set allowaccess ping
        set role lan
    next
    edit "vlan99-invitados"
        set interface "internal1"
        set vlanid 99
        set ip 192.168.99.1 255.255.255.0
        set role lan
    next
end`;

export const vista=()=>`
<h2>Cómo se conectan las piezas</h2>
<div class="grid">
<div class="card"><h3>Puerto de acceso</h3><p style="margin:0">Pertenece a una sola VLAN. La PC o impresora conectada no sabe que existe la VLAN: el switch etiqueta y quita la etiqueta por ella.</p></div>
<div class="card"><h3>Troncal 802.1Q</h3><p style="margin:0">Un solo cable lleva varias VLAN. Cada trama viaja con una etiqueta que indica su VLAN (ID de 1 a 4094). Así se unen switches, firewalls y puntos de acceso.</p></div>
<div class="card"><h3>Ruteo entre VLAN</h3><p style="margin:0">Dos VLAN no se ven entre sí sin pasar por un router o firewall. Si ese paso lo hace el firewall, puedes controlarlo con políticas, igual que entre lan y dmz.</p></div>
<div class="card"><h3>SSID → VLAN</h3><p style="margin:0">El punto de acceso conecta cada red Wi-Fi a una VLAN del troncal: "Empresa" a la VLAN 20, "Invitados" a la 99. Cada SSID hereda la seguridad de su VLAN.</p></div>
</div>
<h2>Conceptos</h2>
<div class="wrap"><table>
<tr><th>Concepto</th><th>Qué es</th><th>Buena práctica</th></tr>
${[['VLAN','Red lógica (dominio de broadcast) dentro de un switch','Una por función: usuarios, servidores, voz, invitados'],
['802.1Q','Etiqueta de 4 bytes con el ID de VLAN','Documenta qué ID usa cada red'],
['Puerto de acceso','Pertenece a una sola VLAN, sin etiquetas','Para PCs, impresoras y cámaras'],
['Troncal (trunk)','Lleva varias VLAN etiquetadas por un cable','Permite solo las VLAN necesarias'],
['VLAN nativa','La que viaja sin etiqueta en un troncal','Cámbiala de la VLAN 1 (evita VLAN hopping)'],
['SSID','Nombre de una red Wi-Fi','Un SSID por tipo de usuario, cada uno en su VLAN'],
['WPA3-Personal','Cifrado con una clave compartida (SAE)','Para casa o redes pequeñas'],
['WPA3-Enterprise','Cada usuario entra con 802.1X contra un RADIUS','En empresas: se da de baja a uno sin cambiar la clave'],
['Red de invitados','SSID aislado que solo sale a Internet','Política invitados → wan; nunca invitados → lan'],
['Aislamiento de clientes','Los equipos del mismo SSID no se ven entre sí','Actívalo en invitados e IoT'],
['AP falso (rogue AP)','Punto de acceso no autorizado o que imita tu SSID','Usa WIDS/WIPS del controlador y 802.1X']]
.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<td><strong>${c}</strong></td>`).join('')}</tr>`).join('')}
</table></div>
<h2>En un FortiGate</h2>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
 <div class="card"><h3>VLAN como subinterfaz</h3><p style="white-space:pre-line;margin:0">Cada VLAN es una interfaz nueva sobre el puerto físico, con su propia IP como puerta de enlace.
Después creas políticas entre ellas como entre cualquier par de interfaces. Si no hay política, la denegación implícita las mantiene separadas: la VLAN de invitados no llega a la de usuarios.</p></div>
 <pre>${esc(cliVlan)}</pre>
</div>`;
