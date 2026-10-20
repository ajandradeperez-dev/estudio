/* Componentes de interfaz (HTML como texto; estilos en src/estilos/componentes.css).
   Todos los textos que pasan aquí son contenido de confianza o ya vienen escapados con esc(). */
import {esc} from '../utilidades.js';

// Barra de progreso redondeada (gruesa en la cabecera de una sesión). Es un <span> para poder ir dentro de un botón.
export const barra=(a,b,{gruesa=false}={})=>`<span class="barra${gruesa?' gruesa':''}" role="progressbar" aria-valuemin="0" aria-valuemax="${b||0}" aria-valuenow="${a||0}"><span style="width:${b?Math.max(0,Math.min(100,Math.round(a/b*100))):0}%"></span></span>`;
// Dificultad 1–5 con puntos
export const puntos=(n,max=5)=>`<span class="puntos" title="Dificultad ${n} de ${max}" aria-label="Dificultad ${n} de ${max}">${Array.from({length:max},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
export const chip=(txt,clase='')=>`<span class="chip ${clase}">${txt}</span>`;
// Botón: principal (3D), secundario, éxito, peligro o del color del área
export const boton=({texto,id,go,clase='',tipo='button',extra=''})=>`<button type="${tipo}" class="btn ${clase}"${id?` id="${id}"`:''}${go!==undefined?` data-go="${esc(go)}"`:''} ${extra}>${texto}</button>`;
// Tarjeta de navegación (área, materia, tema): todo es un botón grande
export const tarjetaNav=({go,icono,titulo,desc='',pie='',clase=''})=>`<button class="tarjeta-nav ${clase}" data-go="${esc(go)}"><span class="icono" aria-hidden="true">${icono}</span>
<span class="texto"><span class="titulo">${titulo}</span>${desc?`<span class="desc">${desc}</span>`:''}${pie}</span></button>`;
export const cabecera=({icono,titulo,desc=''})=>`<div class="cabecera"><span class="icono-grande" aria-hidden="true">${icono}</span><div><h1>${titulo}</h1>${desc?`<p>${desc}</p>`:''}</div></div>`;
// Explicación corta de 1–3 líneas + "¿Cómo se usa?" plegable
export const intro=(texto,pasos=[])=>`<p class="intro">${texto}</p>${pasos.length?`<details class="como-se-usa"><summary>¿Cómo se usa?</summary><ol>${pasos.map(p=>`<li>${p}</li>`).join('')}</ol></details>`:''}`;
// Estado vacío amable
export const vacio=({icono='🌱',titulo,texto='',boton:b=''})=>`<div class="vacio"><span class="vacio-icono" aria-hidden="true">${icono}</span><h2 style="margin:0">${titulo}</h2>${texto?`<p>${texto}</p>`:''}${b}</div>`;

/* ---------- hoja inferior de feedback ---------- */
// bien: verde con ✓; mal: roja con la respuesta correcta, por qué y la regla. Se monta fuera de #vista.
export function abrirHoja({bien,titulo,cuerpo='',boton:textoBoton='Continuar',id='hoja-seguir'}){
  cerrarHoja();
  const h=document.createElement('div');
  h.id='hoja';h.className=`hoja ${bien?'bien':'mal'}`;h.setAttribute('role','dialog');h.setAttribute('aria-live','assertive');h.setAttribute('aria-label',titulo);
  h.innerHTML=`<div class="hoja-dentro"><p class="hoja-titulo"><span class="hoja-icono" aria-hidden="true">${bien?'✓':'✗'}</span>${titulo}</p>${cuerpo}
<button class="btn ${bien?'exito':'peligro'}" id="${id}">${textoBoton}</button></div>`;
  document.body.appendChild(h);
  requestAnimationFrame(()=>{h.classList.add('abierta');h.querySelector(`#${id}`)?.focus({preventScroll:true})});
  return h;
}
export function cerrarHoja(){document.getElementById('hoja')?.remove()}

/* ---------- modal de confirmación ---------- */
// Devuelve una promesa con el valor del botón elegido (o null si se cierra)
// atrasConfirma: el botón Atrás del sistema, con este diálogo abierto, cuenta como «sí» (p. ej. «¿Salir de la lección?»)
export function confirmar({titulo,texto='',si='Sí',no='Cancelar',peligro=false,atrasConfirma=false}){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='modal-fondo';if(atrasConfirma)f.dataset.atras='si';
    f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><h2 id="modal-t">${titulo}</h2>${texto?`<p>${texto}</p>`:''}
<div class="pila"><button class="btn ${peligro?'peligro':''} ancho" data-r="1">${si}</button><button class="btn ghost ancho" data-r="0">${no}</button></div></div>`;
    const cerrar=v=>{f.remove();document.removeEventListener('keydown',tecla,true);res(v)};
    const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(false)}};
    f.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b)cerrar(b.dataset.r==='1');else if(e.target===f)cerrar(false)});
    document.addEventListener('keydown',tecla,true);
    document.body.appendChild(f);f.querySelector('[data-r="1"]').focus();
  });
}

// Menú de acciones en un diálogo de la app: resuelve con el valor elegido o null (Cancelar, fondo, Escape o Atrás)
export function menuAcciones({titulo,opciones}){
  return new Promise(res=>{
    const f=document.createElement('div');f.className='modal-fondo';
    f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><h2 id="modal-t">${titulo}</h2>
<div class="pila">${opciones.map(([v,t,c=''])=>`<button class="btn ghost ancho ${c}" data-r="${v}">${t}</button>`).join('')}<button class="btn ghost ancho" data-r="0">Cancelar</button></div></div>`;
    const cerrar=v=>{f.remove();document.removeEventListener('keydown',tecla,true);res(v)};
    const tecla=e=>{if(e.key==='Escape'){e.stopPropagation();cerrar(null)}};
    f.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b)cerrar(b.dataset.r==='0'?null:b.dataset.r);else if(e.target===f)cerrar(null)});
    document.addEventListener('keydown',tecla,true);
    document.body.appendChild(f);f.querySelector('[data-r]').focus();
  });
}

/* ---------- aviso breve (toast) ---------- */
// Aviso con una acción (p. ej. «Nota borrada · Deshacer»): se queda ms milisegundos; la acción lo cierra
export function avisoAccion(texto,accion,alTocar,ms=8000){
  document.getElementById('aviso')?.remove();
  const a=document.createElement('div');a.id='aviso';a.className='aviso aviso-accion';a.setAttribute('role','status');
  a.innerHTML=`<span></span><button type="button" class="aviso-btn">${accion}</button>`;a.firstChild.textContent=texto;
  let hecho=false;const cerrar=()=>{a.classList.remove('visible');setTimeout(()=>a.remove(),300)};
  a.querySelector('button').addEventListener('click',e=>{e.stopPropagation();if(hecho)return;hecho=true;cerrar();alTocar()});
  document.body.appendChild(a);requestAnimationFrame(()=>a.classList.add('visible'));
  setTimeout(()=>{if(!hecho)cerrar()},ms);
}
export function aviso(texto,ms=2600){
  document.getElementById('aviso')?.remove();
  const a=document.createElement('div');a.id='aviso';a.className='aviso';a.setAttribute('role','status');a.textContent=texto;
  document.body.appendChild(a);requestAnimationFrame(()=>a.classList.add('visible'));
  setTimeout(()=>{a.classList.remove('visible');setTimeout(()=>a.remove(),300)},ms);
}
