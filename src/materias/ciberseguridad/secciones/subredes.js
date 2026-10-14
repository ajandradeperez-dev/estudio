import {$,ip2n,n2ip,mask} from '../../../utilidades.js';

export const vista=()=>`
<div class="card"><div class="row">
 <label for="sip">Dirección IP<input id="sip" value="192.168.10.77"></label>
 <label for="sbits">Prefijo<select id="sbits">${Array.from({length:33},(_,i)=>`<option ${i===24?'selected':''}>${i}</option>`).join('')}</select></label>
 <button class="btn" id="scalc">Calcular</button></div>
 <div id="sout" class="result mono"></div></div>`;

export function calcSub(){
  const n=ip2n($('#sip').value),b=+$('#sbits').value;
  if(n==null){$('#sout').innerHTML='<span class="deny">La IP no es válida. Usa cuatro números de 0 a 255 separados por puntos.</span>';return}
  const m=mask(b),net=(n&m)>>>0,bc=(net|(~m>>>0))>>>0,hosts=b>=31?(b===31?2:1):Math.pow(2,32-b)-2;
  $('#sout').innerHTML=`Red:        ${n2ip(net)}/${b}<br>Máscara:    ${n2ip(m)}<br>Broadcast:  ${n2ip(bc)}<br>Primer host:${b>=31?n2ip(net):n2ip(net+1)}<br>Último host:${b>=31?n2ip(bc):n2ip(bc-1)}<br>Hosts útiles: ${hosts.toLocaleString('es')}`;
}

export function alMostrar(){calcSub()}

export function alClic(t){
  if(t.id==='scalc'){calcSub();return true}
}
