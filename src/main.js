import {$} from './utilidades.js';
import * as inicio from './secciones/inicio.js';
import * as redes from './secciones/redes.js';
import * as subred from './secciones/subredes.js';
import * as vlan from './secciones/vlans.js';
import * as fw from './secciones/firewall.js';
import * as marcas from './secciones/marcas.js';
import * as forti from './secciones/fortigate.js';
import * as incidentes from './secciones/incidentes.js';
import * as quiz from './secciones/examen.js';

/* Cada sección exporta vista() y, si las necesita, alMostrar() y alClic(t, ir).
   La clave es la misma de data-s en el menú, del #hash de la URL y de localStorage. */
const S={inicio,redes,subred,vlan,fw,marcas,forti,incidentes,quiz};

/* ---------- navegación y eventos ---------- */
let cur='inicio';
function go(s){
  cur=S[s]?s:'inicio';
  $('#main').innerHTML=S[cur].vista();
  document.querySelectorAll('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.s===cur));
  try{localStorage.setItem('ciberlab-s',cur)}catch(e){}
  S[cur].alMostrar?.();
  window.scrollTo(0,0);
}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button[data-s]');if(b)go(b.dataset.s)});
$('#main').addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('[data-go]');if(c)go(c.dataset.go)}});
$('#main').addEventListener('click',e=>{
  const t=e.target.closest('button,[data-go],tr[data-pid]'); if(!t)return;
  if(t.dataset.go){go(t.dataset.go);return}
  S[cur].alClic?.(t,go);
});
let start='inicio';try{start=localStorage.getItem('ciberlab-s')||'inicio'}catch(e){}
const h=location.hash.slice(1); if(S[h])start=h;
go(start);
