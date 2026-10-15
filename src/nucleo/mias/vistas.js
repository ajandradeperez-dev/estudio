/* Pantallas de "🎓 Mis materias". Rutas (las resuelve vistaMias en main.js):
   'mias' lista · 'mias/nueva' asistente · 'mias/<id>' materia (cuenta regresiva, hoy, preparación, plan) · 'mias/<id>/editar' asistente
   'mias/<id>/t/<tema>' tema (practicar, lección generada, notas) · 'mias/<id>/simulacro' simulacro de examen
   Todo funciona sin IA; los botones ✨ (ia.js) piden la clave propia del usuario. Todo texto del usuario pasa por esc(). */
import {esc} from '../../utilidades.js';
import {vacio,boton,confirmar,aviso,barra,chip} from '../ui.js';
import {conFormulas} from '../formula.js';
import {htmlPasos,abrirProcedimiento} from '../procedimiento.js';
import {crearSesion} from '../sesion.js';
import {rutaLeccion} from '../materias.js';
import {progreso,registrarEjercicio,registrarRespuesta,cerrarSesionHabilidad,marcarEstudiado,datosHabilidad,hoy} from '../progreso.js';
import {nivelDe} from '../metodo.js';
import {crear} from '../generadores/index.js';
import {generadorDe} from '../practica.js';
import {guardarArchivo,leerArchivo,nuevoId} from '../cuaderno/db.js';
import {comprimirFoto} from '../cuaderno/medios.js';
import {descargar} from '../cuaderno/respaldo.js';
import {todasLasNotas} from '../cuaderno/db.js';
import {crearNota} from '../cuaderno/notas.js';
import {leerTemario} from './temario.js';
import {normal} from './emparejar.js';
import {comprobarPlan,diasEntre,deFecha,aFecha,sumar} from './plan.js';
import {misMaterias,miMateria,materiaVacia,temaNuevo,nuevoIdUnidad,nuevoIdExamen,emparejarTodo,catalogo,habilidadDe,guardarMateria,borrarMateria,
  dominioTema,planDe,proximoExamen,preparacion,temasDebiles,buscarTema,generado,ejerciciosVivos,preguntaGenerada,paqueteMateria,importarMateria,COLORES,ICONOS} from './datos.js';
import * as IA from './ia.js';

const repintar=()=>document.dispatchEvent(new Event('repintar'));
const DIAS=['D','L','M','X','J','V','S'],DIAS_LARGOS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const fechaLarga=f=>deFecha(f).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'});
const fechaCorta=f=>deFecha(f).toLocaleDateString('es',{weekday:'short',day:'numeric',month:'short'});
const cuenta=f=>{const n=diasEntre(hoy(),f);return n===0?'¡hoy!':n===1?'mañana':`en ${n} días`};
const pct=v=>Math.round(v*100);
const temaDeId=(m,tid)=>buscarTema(m,tid)?.t;
const estiloMateria=m=>`style="--mp:${esc(m.color)}"`;

/* ---------- portada de Aprender ---------- */
export function htmlMiasPortada(){
  const ms=misMaterias();
  if(!ms.length)return `<button class="card mp-cta" data-go="mias/nueva"><span class="mp-cta-icono" aria-hidden="true">🎓</span><span><b>¿Tienes una materia que pasar?</b><span class="nota"> Escribe o fotografía tu temario, pon la fecha del examen y la app te arma un plan día por día.</span></span></button>`;
  return `<div class="mp-portada"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">🎓 Mis materias</h2><button class="btn ghost btn-chico" data-go="mias">Ver todas</button></div>
<div class="lista-nav">${ms.slice(0,3).map(tarjeta).join('')}</div></div>`;
}
function tarjeta(m){
  const ex=proximoExamen(m),prep=preparacion(m),v=prep.length?prep.reduce((a,x)=>a+x.valor,0)/prep.length:0,plan=planDe(m),h=plan.hoy;
  const hoyTxt=h?h.bloques.map(b=>b.tipo==='tema'?`${b.min} min de ${esc(temaDeId(m,b.tema)?.titulo||'un tema')}`:b.tipo==='simulacro'?`${b.min} min de simulacro`:`${b.min} min de repaso`).join(' + '):'';
  return `<button class="tarjeta-nav mp-tarjeta" ${estiloMateria(m)} data-go="mias/${m.id}"><span class="icono mp-icono" aria-hidden="true">${esc(m.icono)}</span>
<span class="texto"><span class="titulo">${esc(m.nombre)}</span><span class="desc">${ex?`${esc(ex.nombre)} ${cuenta(ex.fecha)}`:'Sin examen próximo'}${hoyTxt?` · Hoy: ${hoyTxt}`:''}</span>
${barra(pct(v),100)}<span class="nota">${pct(v)} % preparado</span></span></button>`;
}

/* ---------- lista ---------- */
function vistaLista(){
  return {
    titulo:'Mis materias',
    vista(){
      const ms=misMaterias();
      return `<h1>🎓 Mis materias</h1><p class="intro">Tus materias de la escuela o la universidad: la app arma un plan hasta el examen con práctica de lo que la app ya tiene y, si quieres, con IA para lo que falta.</p>
<div class="row" style="margin-bottom:16px"><button class="btn" data-go="mias/nueva">＋ Crear materia</button><label class="btn ghost" for="mp-importar">📥 Importar</label><input type="file" id="mp-importar" accept="application/json,.json" class="oculto-visual"></div>
${ms.length?`<div class="lista-nav">${ms.map(tarjeta).join('')}</div>`:vacio({icono:'🎓',titulo:'Aún no tienes materias propias',texto:'Crea una con tu temario (escrito o en foto) y la fecha de tu examen. Un compañero también puede compartirte la suya y la importas aquí.'})}`;
    },
    alMostrar(){activarImportarMateria()}
  };
}
function activarImportarMateria(){
  const inp=document.getElementById('mp-importar');
  inp?.addEventListener('change',async()=>{const f=inp.files[0];inp.value='';if(!f)return;
    try{const r=await importarMateria(await f.text());aviso(`📥 Importada: ${r.materia.nombre}`);document.dispatchEvent(new CustomEvent('ir',{detail:'mias/'+r.materia.id}))}catch(e){aviso(e.message,4000)}});
}

/* ---------- asistente de 4 pasos ---------- */
const textoDeTemario=m=>m.unidades.map((u,i)=>`Unidad ${i+1}: ${u.titulo}\n${u.temas.map((t,j)=>`  ${i+1}.${j+1} ${t.titulo}${t.subtemas.map(s=>`\n    - ${s}`).join('')}`).join('\n')}`).join('\n');
// Al volver a leer el texto, los temas con el mismo nombre conservan su id (y con él su avance y lo generado)
function reconstruir(m,leidas){
  const viejos=new Map(),viejasU=new Map();
  for(const u of m.unidades){viejasU.set(normal(u.titulo),u);for(const t of u.temas)viejos.set(normal(t.titulo),t)}
  m.unidades=leidas.map(u=>{const vu=viejasU.get(normal(u.titulo));
    return {id:vu?.id||nuevoIdUnidad(),titulo:u.titulo.slice(0,200),temas:u.temas.map(t=>{const vt=viejos.get(normal(t.titulo));return vt?{...vt,titulo:t.titulo.slice(0,200),subtemas:t.subtemas}:temaNuevo(t.titulo.slice(0,200),t.subtemas)})}});
  const ids=new Set(m.unidades.map(u=>u.id));
  m.examenes=m.examenes.map(x=>({...x,unidades:x.unidades.filter(id=>ids.has(id))})).map(x=>x.unidades.length?x:{...x,unidades:[...ids]});
  return emparejarTodo(m);
}
function vistaAsistente(id){
  let m=null,paso=1,texto='',textoOriginal='',error='',urls=[];
  const PASOS=['Materia','Temario','Fechas','Revisar'];
  const leerTexto=()=>{const t=document.getElementById('mp-texto');if(t)texto=t.value};
  async function pintarFotos(){
    const caja=document.getElementById('mp-fotos');if(!caja)return;urls.forEach(u=>URL.revokeObjectURL(u));urls=[];
    caja.innerHTML=(m.fotos||[]).map(f=>`<button type="button" class="mp-foto" data-ver-foto="${esc(f)}"><img data-foto="${esc(f)}" alt="Foto del temario"></button>`).join('');
    for(const img of caja.querySelectorAll('img[data-foto]')){const a=await leerArchivo(img.dataset.foto).catch(()=>null);if(a?.blob){const u=URL.createObjectURL(a.blob);urls.push(u);img.src=u}}
  }
  const unidadesHtml=()=>m.unidades.map((u,ui)=>`<div class="mp-unidad card" data-unidad="${u.id}">
<div class="mp-unidad-cab"><input class="mp-input mp-unidad-titulo" data-campo="unidad" data-u="${u.id}" value="${esc(u.titulo)}" aria-label="Nombre de la unidad ${ui+1}">
<button type="button" class="btn-icono" data-borrar-unidad="${u.id}" aria-label="Borrar la unidad ${esc(u.titulo)}">🗑️</button></div>
<ul class="mp-temas">${u.temas.map((t,ti)=>{const h=habilidadDe(t.habilidad);
  return `<li class="mp-tema" data-tema="${t.id}"><div class="mp-tema-fila"><button type="button" class="btn-icono mp-arrastrar" data-arrastrar="${t.id}" aria-label="Arrastrar para reordenar">⠿</button>
<input class="mp-input" data-campo="tema" data-t="${t.id}" value="${esc(t.titulo)}" aria-label="Tema ${ti+1}">
<button type="button" class="btn-icono" data-subir="${t.id}" aria-label="Subir">↑</button><button type="button" class="btn-icono" data-bajar="${t.id}" aria-label="Bajar">↓</button>
<button type="button" class="btn-icono" data-borrar-tema="${t.id}" aria-label="Borrar el tema">🗑️</button></div>
<div class="mp-tema-opciones"><button type="button" class="chip-filtro" data-sabe="${t.id}" aria-pressed="${t.sabe}">✅ Ya lo sé</button><button type="button" class="chip-filtro" data-dificil="${t.id}" aria-pressed="${t.dificil}">🔥 Difícil</button>
<button type="button" class="mp-emparejado ${h?'si':'no'}" data-elegir-habilidad="${t.id}">${h?`✓ La app tiene práctica: <b>${esc(h.l.titulo)}</b>`:'Sin práctica todavía'} <span class="nota">· cambiar</span></button></div></li>`}).join('')}</ul>
<button type="button" class="btn ghost btn-chico" data-agregar-tema="${u.id}">＋ Tema</button></div>`).join('');
  function moverTema(tid,destino,antes=true){
    let tema=null;for(const u of m.unidades){const i=u.temas.findIndex(t=>t.id===tid);if(i>=0){tema=u.temas.splice(i,1)[0];break}}
    if(!tema)return;
    for(const u of m.unidades){const j=u.temas.findIndex(t=>t.id===destino);if(j>=0){u.temas.splice(antes?j:j+1,0,tema);return}}
    m.unidades.find(u=>u.id===destino)?.temas.push(tema);
  }
  const quitarUnidadesVacias=()=>{m.unidades=m.unidades.filter(u=>u.temas.length);const ids=new Set(m.unidades.map(u=>u.id));m.examenes=m.examenes.map(x=>({...x,unidades:x.unidades.filter(i=>ids.has(i))}))};
  return {
    titulo:id?'Editar materia':'Nueva materia',inmersiva:true,
    alEntrar(){
      paso=1;error='';
      const x=id&&miMateria(id);m=x?structuredClone(x):materiaVacia();
      texto=textoOriginal=x?textoDeTemario(m):'';
      if(!x)m.examenes=[];
    },
    alSalir(){urls.forEach(u=>URL.revokeObjectURL(u))},
    vista(){
      if(id&&!miMateria(id))return vacio({icono:'🎓',titulo:'Esa materia no existe',boton:'<button class="btn" data-go="mias">Mis materias</button>'});
      const cab=`<div class="mp-asistente" ${estiloMateria(m)}><div class="mp-asis-cab"><button type="button" class="btn-icono" data-go="${id?`mias/${id}`:'mias'}" aria-label="Cancelar">✕</button>
<div class="bien-puntos" aria-label="Paso ${paso} de 4">${PASOS.map((_,i)=>`<span class="${i<paso?'on':''}"></span>`).join('')}</div><span class="nota">${paso}/4</span></div>
<h1>${['','¿Qué materia es?','Tu temario','Fechas y tiempo','Revisa tu temario'][paso]}</h1>${error?`<p class="aviso-linea">⚠️ ${esc(error)}</p>`:''}`;
      const pie=`<div class="bien-pie">${paso>1?'<button type="button" class="btn ghost" id="mp-atras">Atrás</button>':''}<button type="button" class="btn" id="mp-sig">${paso<4?'Siguiente':'💾 Guardar materia'}</button></div></div>`;
      if(paso===1)return `${cab}
<label class="campo">Nombre de la materia<input id="mp-nombre" class="mp-input" value="${esc(m.nombre)}" maxlength="80" placeholder="Ej.: Cálculo diferencial" autocomplete="off"></label>
<label class="campo">Escuela o profesor <span class="nota">(opcional)</span><input id="mp-escuela" class="mp-input" value="${esc(m.escuela||'')}" maxlength="80" placeholder="Ej.: UNAM · Prof. García" autocomplete="off"></label>
<p class="campo" style="margin-bottom:4px">Color</p><div class="mp-colores" role="group" aria-label="Color">${COLORES.map(c=>`<button type="button" class="mp-color" data-color="${c}" style="--c:${c}" aria-pressed="${m.color===c}" aria-label="Color ${c}"></button>`).join('')}</div>
<p class="campo" style="margin-bottom:4px">Ícono</p><div class="mp-iconos" role="group" aria-label="Ícono">${ICONOS.map(i=>`<button type="button" class="mp-icono-op" data-icono="${i}" aria-pressed="${m.icono===i}">${i}</button>`).join('')}</div>${pie}`;
      if(paso===2){const leidas=leerTemario(texto),nt=leidas.reduce((a,u)=>a+u.temas.length,0);
        return `${cab}<p class="intro">Escribe o pega tu temario: una línea por unidad, tema o subtema. Se reconocen «Unidad 2», «1.», «1.1», números romanos y viñetas.</p>
<textarea id="mp-texto" class="nota-cuerpo mp-texto" placeholder="Unidad 1: Límites\n1.1 Definición de límite\n1.2 Límites laterales\nUnidad 2: Derivadas\n2.1 Regla de la cadena">${esc(texto)}</textarea>
<p class="nota" id="mp-reconocido">${nt?`Se reconocen ${leidas.length} ${leidas.length===1?'unidad':'unidades'} y ${nt} ${nt===1?'tema':'temas'}.`:'Aún no hay temas.'}</p>
<h2>📷 Foto del programa <span class="nota">(opcional)</span></h2>
<p class="nota">Tómale foto al temario para tenerla a la vista mientras lo escribes${IA.disponible()?', o deja que la IA la lea por ti':''}.</p>
<div class="row"><label class="btn ghost btn-chico" for="mp-foto-camara">📷 Cámara</label><label class="btn ghost btn-chico" for="mp-foto-galeria">🖼️ Galería</label>
<input type="file" id="mp-foto-camara" accept="image/*" capture="environment" class="oculto-visual"><input type="file" id="mp-foto-galeria" accept="image/*" multiple class="oculto-visual">
${m.fotos.length?`<button type="button" class="btn btn-chico" id="mp-leer-ia">✨ Leer con IA <span class="nota">(${IA.costo('foto',m.fotos.length)})</span></button>`:''}</div>
<div id="mp-fotos" class="mp-fotos"></div>${pie}`}
      if(paso===3){
        return `${cab}<h2>Exámenes</h2><p class="nota">Pon cada parcial o final con su fecha y qué unidades entran. El plan se arma hasta cada uno.</p>
${m.examenes.map((x,i)=>`<div class="card mp-examen"><div class="row" style="justify-content:space-between;align-items:center"><input class="mp-input" data-campo="examen-nombre" data-x="${x.id}" value="${esc(x.nombre)}" aria-label="Nombre del examen ${i+1}" style="flex:1">
<button type="button" class="btn-icono" data-borrar-examen="${x.id}" aria-label="Borrar el examen">🗑️</button></div>
<label class="campo">Fecha<input type="date" class="mp-input" data-campo="examen-fecha" data-x="${x.id}" value="${esc(x.fecha)}" min="${hoy()}"></label>
<p class="campo" style="margin-bottom:4px">Unidades que entran</p><div class="mp-chips">${m.unidades.map((u,j)=>`<button type="button" class="chip-filtro" data-examen-unidad="${x.id}|${u.id}" aria-pressed="${x.unidades.includes(u.id)}">${j+1}. ${esc(u.titulo)}</button>`).join('')}</div></div>`).join('')}
<button type="button" class="btn ghost ancho" id="mp-agregar-examen">＋ Agregar examen</button>
<h2>Tu tiempo</h2><p class="campo" style="margin-bottom:4px">Días que puedes estudiar</p>
<div class="mp-chips">${[1,2,3,4,5,6,0].map(d=>`<button type="button" class="chip-filtro mp-dia" data-dia="${d}" aria-pressed="${m.disponibilidad.dias.includes(d)}" aria-label="${DIAS_LARGOS[d]}">${DIAS[d]}</button>`).join('')}</div>
<label class="campo">Minutos por día<select id="mp-minutos" class="mp-input">${[10,15,20,30,45,60,90,120].map(n=>`<option value="${n}"${m.disponibilidad.minutos===n?' selected':''}>${n} minutos</option>`).join('')}</select></label>
<div class="ajuste"><span>🔔 Avisarme una semana y un día antes del examen</span><span class="segmentos" role="group"><button type="button" data-avisos="true" aria-pressed="${!!m.avisos}">Sí</button><button type="button" data-avisos="false" aria-pressed="${!m.avisos}">No</button></span></div>${pie}`;
      }
      const conPractica=m.unidades.flatMap(u=>u.temas).filter(t=>t.habilidad).length,total=m.unidades.flatMap(u=>u.temas).length;
      return `${cab}<p class="intro">Corrige nombres, reordena (arrastra ⠿ o usa ↑↓), borra lo que no entra y marca lo que ya sabes o te cuesta. <b>${conPractica} de ${total}</b> temas tienen práctica en la app.</p>
<div id="mp-unidades">${unidadesHtml()}</div>
<button type="button" class="btn ghost ancho" id="mp-agregar-unidad">＋ Unidad</button>${pie}`;
    },
    alMostrar(){
      if(paso===2){
        const t=document.getElementById('mp-texto'),r=document.getElementById('mp-reconocido');
        t?.addEventListener('input',()=>{texto=t.value;const l=leerTemario(texto),n=l.reduce((a,u)=>a+u.temas.length,0);r.textContent=n?`Se reconocen ${l.length} ${l.length===1?'unidad':'unidades'} y ${n} ${n===1?'tema':'temas'}.`:'Aún no hay temas.'});
        for(const idInp of ['mp-foto-camara','mp-foto-galeria'])document.getElementById(idInp)?.addEventListener('change',async e=>{
          const fs=[...e.target.files];e.target.value='';leerTexto();
          for(const f of fs){try{const img=await comprimirFoto(f),idf=nuevoId();await guardarArchivo({id:idf,nota:m.id,blob:img.blob,tipo:img.blob.type,ancho:img.ancho,alto:img.alto,creada:Date.now()});m.fotos.push(idf)}catch(err){aviso(err.message||'No se pudo guardar la foto.')}}
          repintar();});
        pintarFotos();
      }
      // arrastrar para reordenar temas (dedo o ratón)
      document.querySelectorAll('[data-arrastrar]').forEach(h=>h.addEventListener('pointerdown',e=>{
        e.preventDefault();const tid=h.dataset.arrastrar,fila=h.closest('.mp-tema');fila.classList.add('arrastrando');h.setPointerCapture(e.pointerId);const y0=e.clientY;
        const mover=ev=>{fila.style.transform=`translateY(${ev.clientY-y0}px)`};
        const soltar=ev=>{h.removeEventListener('pointermove',mover);h.removeEventListener('pointerup',soltar);h.removeEventListener('pointercancel',soltar);fila.style.transform='';fila.classList.remove('arrastrando');
          fila.style.visibility='hidden';const debajo=document.elementFromPoint(ev.clientX,ev.clientY);fila.style.visibility='';
          const destino=debajo?.closest('.mp-tema'),unidad=debajo?.closest('.mp-unidad');
          if(destino&&destino!==fila){const r=destino.getBoundingClientRect();moverTema(tid,destino.dataset.tema,ev.clientY<r.top+r.height/2);quitarUnidadesVacias();repintar()}
          else if(unidad&&!destino){moverTema(tid,unidad.dataset.unidad);quitarUnidadesVacias();repintar()}};
        h.addEventListener('pointermove',mover);h.addEventListener('pointerup',soltar);h.addEventListener('pointercancel',soltar);}));
      // campos de texto: se guardan en el borrador al escribir
      document.querySelectorAll('[data-campo]').forEach(inp=>inp.addEventListener(inp.type==='date'?'change':'input',()=>{
        const v=inp.value,c=inp.dataset.campo;
        if(c==='unidad'){const u=m.unidades.find(x=>x.id===inp.dataset.u);if(u)u.titulo=v.slice(0,200)}
        if(c==='tema'){const x=buscarTema(m,inp.dataset.t);if(x)x.t.titulo=v.slice(0,200)}
        if(c==='examen-nombre'){const x=m.examenes.find(e=>e.id===inp.dataset.x);if(x)x.nombre=v.slice(0,80)}
        if(c==='examen-fecha'){const x=m.examenes.find(e=>e.id===inp.dataset.x);if(x)x.fecha=v}}));
      document.getElementById('mp-minutos')?.addEventListener('change',e=>{m.disponibilidad.minutos=+e.target.value});
    },
    async alClic(t,ir){
      const leer1=()=>{const n=document.getElementById('mp-nombre'),e=document.getElementById('mp-escuela');if(n)m.nombre=n.value.trim().slice(0,80);if(e)m.escuela=e.value.trim().slice(0,80)};
      if(t.dataset.color){leer1();m.color=t.dataset.color;repintar();return true}
      if(t.dataset.icono){leer1();m.icono=t.dataset.icono;repintar();return true}
      if(t.dataset.verFoto){verFoto(t.dataset.verFoto);return true}
      if(t.id==='mp-leer-ia'){leerTexto();
        const r=await IA.leerTemarioFotos(m.fotos,{boton:t});if(r){reconstruir(m,r.unidades);texto=textoDeTemario(m);
          if(r.examenes?.length)for(const x of r.examenes)if(!m.examenes.some(e=>e.fecha===x.fecha))m.examenes.push({id:nuevoIdExamen(),nombre:x.nombre.slice(0,80),fecha:x.fecha,unidades:m.unidades.map(u=>u.id)});
          if(r.nombre&&!m.nombre)m.nombre=r.nombre.slice(0,80);
          aviso('✨ Temario leído: revísalo antes de guardar');paso=4;repintar()}
        return true}
      if(t.id==='mp-atras'){leerTexto();leer1();error='';paso--;repintar();window.scrollTo(0,0);return true}
      if(t.id==='mp-sig'){
        error='';
        if(paso===1){leer1();if(!m.nombre){error='Escribe el nombre de la materia.';repintar();return true}}
        if(paso===2){leerTexto();const l=leerTemario(texto);
          if(!l.length&&!m.unidades.length){error='Escribe al menos un tema (una línea por tema).';repintar();return true}
          if(texto!==textoOriginal||!m.unidades.length){reconstruir(m,l);textoOriginal=texto=textoDeTemario(m)}
          // un examen sugerido en 4 semanas (se cambia en el paso 3)
          if(!m.examenes.length)m.examenes.push({id:nuevoIdExamen(),nombre:'Examen',fecha:sumar(hoy(),28),unidades:m.unidades.map(u=>u.id)})}
        if(paso===3){
          if(m.examenes.some(x=>!x.fecha||!x.nombre.trim())){error='Cada examen necesita nombre y fecha.';repintar();return true}
          if(m.examenes.some(x=>!x.unidades.length)){error='Marca qué unidades entran en cada examen.';repintar();return true}
          if(!m.disponibilidad.dias.length){error='Elige al menos un día para estudiar.';repintar();return true}}
        if(paso===4){
          quitarUnidadesVacias();
          if(!m.unidades.length){error='La materia necesita al menos un tema.';repintar();return true}
          m.examenes=m.examenes.filter(x=>x.unidades.length);
          try{const g=await guardarMateria(m);aviso(id?'💾 Cambios guardados':'🎓 Materia creada: este es tu plan');ir(`mias/${g.id}`)}catch(e){error=e.message;repintar()}
          return true}
        paso++;repintar();window.scrollTo(0,0);return true;
      }
      if(t.id==='mp-agregar-examen'){const ult=m.examenes.at(-1);
        m.examenes.push({id:nuevoIdExamen(),nombre:ult?'Final':'Parcial 1',fecha:sumar(ult?.fecha>hoy()?ult.fecha:hoy(),ult?14:28),unidades:m.unidades.map(u=>u.id)});repintar();return true}
      if(t.dataset.borrarExamen){m.examenes=m.examenes.filter(x=>x.id!==t.dataset.borrarExamen);repintar();return true}
      if(t.dataset.examenUnidad){const [xid,uid]=t.dataset.examenUnidad.split('|'),x=m.examenes.find(e=>e.id===xid);if(x){x.unidades=x.unidades.includes(uid)?x.unidades.filter(i=>i!==uid):[...x.unidades,uid];t.setAttribute('aria-pressed',String(x.unidades.includes(uid)))}return true}
      if(t.dataset.dia!==undefined){const d=+t.dataset.dia,l=m.disponibilidad.dias;m.disponibilidad.dias=l.includes(d)?l.filter(x=>x!==d):[...l,d].sort();t.setAttribute('aria-pressed',String(m.disponibilidad.dias.includes(d)));return true}
      if(t.dataset.avisos){m.avisos=t.dataset.avisos==='true';if(m.avisos)IA.pedirPermisoAvisos?.();repintar();return true}
      if(t.dataset.sabe){const x=buscarTema(m,t.dataset.sabe);if(x){x.t.sabe=!x.t.sabe;t.setAttribute('aria-pressed',String(x.t.sabe))}return true}
      if(t.dataset.dificil){const x=buscarTema(m,t.dataset.dificil);if(x){x.t.dificil=!x.t.dificil;t.setAttribute('aria-pressed',String(x.t.dificil))}return true}
      if(t.dataset.subir||t.dataset.bajar){const tid=t.dataset.subir||t.dataset.bajar;
        for(const u of m.unidades){const i=u.temas.findIndex(x=>x.id===tid);if(i<0)continue;const j=t.dataset.subir?i-1:i+1;
          if(j>=0&&j<u.temas.length)[u.temas[i],u.temas[j]]=[u.temas[j],u.temas[i]];
          else{const ui=m.unidades.indexOf(u),otra=m.unidades[t.dataset.subir?ui-1:ui+1];if(otra){const [x]=u.temas.splice(i,1);t.dataset.subir?otra.temas.push(x):otra.temas.unshift(x);quitarUnidadesVacias()}}break}
        repintar();return true}
      if(t.dataset.borrarTema){for(const u of m.unidades)u.temas=u.temas.filter(x=>x.id!==t.dataset.borrarTema);quitarUnidadesVacias();repintar();return true}
      if(t.dataset.borrarUnidad){const u=m.unidades.find(x=>x.id===t.dataset.borrarUnidad);
        if(u&&(!u.temas.length||await confirmar({titulo:`¿Borrar «${esc(u.titulo)}»?`,texto:`Se quitan sus ${u.temas.length} temas.`,si:'Borrar',peligro:true}))){m.unidades=m.unidades.filter(x=>x!==u);quitarUnidadesVacias();repintar()}return true}
      if(t.dataset.agregarTema){const u=m.unidades.find(x=>x.id===t.dataset.agregarTema);u?.temas.push(temaNuevo('Tema nuevo'));repintar();
        setTimeout(()=>{const l=document.querySelectorAll(`[data-unidad="${u.id}"] [data-campo="tema"]`);l[l.length-1]?.select()},50);return true}
      if(t.id==='mp-agregar-unidad'){m.unidades.push({id:nuevoIdUnidad(),titulo:`Unidad ${m.unidades.length+1}`,temas:[temaNuevo('Tema nuevo')]});
        for(const x of m.examenes)x.unidades.push(m.unidades.at(-1).id);repintar();return true}
      if(t.dataset.elegirHabilidad){const x=buscarTema(m,t.dataset.elegirHabilidad);if(!x)return true;
        const h=await elegirHabilidad(x.t);if(h!==undefined){x.t.habilidad=h;x.t.emparejado=h?'manual':'ninguno';if(!h)x.t.emparejado='manual';repintar()}return true}
    }
  };
}
// Elegir a mano la habilidad de la app para un tema (o ninguna). Devuelve {materia,id} | null | undefined (cancelado)
function elegirHabilidad(t){
  return new Promise(res=>{
    const todas=catalogo(),f=document.createElement('div');f.className='modal-fondo';
    const lista=q=>todas.filter(x=>!q||normal(`${x.materiaNombre} ${x.tema} ${x.titulo}`).includes(normal(q))).slice(0,50)
      .map(x=>`<button type="button" class="opcion-enlace" data-h="${x.materia}|${x.id}">${esc(x.titulo)} <span class="nota">· ${esc(x.materiaNombre)}${x.tema?` · ${esc(x.tema)}`:''}</span></button>`).join('')||'<p class="nota">Sin resultados.</p>';
    f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="eh-t"><h2 id="eh-t">Práctica para «${esc(t.titulo)}»</h2>
<input type="search" id="eh-buscar" placeholder="Buscar en la app" value="" autocomplete="off"><div class="lista-enlaces" id="eh-lista">${lista('')}</div>
<button type="button" class="btn ghost ancho" data-ninguna>Sin práctica de la app</button><button type="button" class="btn ghost ancho" data-x style="margin-top:8px">Cancelar</button></div>`;
    const cerrar=v=>{f.remove();res(v)};
    f.addEventListener('click',e=>{const b=e.target.closest('button');if(e.target===f||b?.dataset.x!==undefined)cerrar(undefined);else if(b?.dataset.ninguna!==undefined)cerrar(null);
      else if(b?.dataset.h){const [materia,id]=b.dataset.h.split('|');cerrar({materia,id})}});
    document.body.appendChild(f);const q=f.querySelector('#eh-buscar');q.addEventListener('input',()=>{f.querySelector('#eh-lista').innerHTML=lista(q.value)});
  });
}
async function verFoto(id){
  const a=await leerArchivo(id).catch(()=>null);if(!a?.blob)return;
  const u=URL.createObjectURL(a.blob),f=document.createElement('div');f.className='modal-fondo mp-visor';
  f.innerHTML=`<div class="mp-visor-caja"><img src="${u}" alt="Foto del temario"><button type="button" class="btn" data-x>Cerrar</button></div>`;
  f.addEventListener('click',e=>{if(e.target.closest('[data-x]')||e.target===f){f.remove();URL.revokeObjectURL(u)}});
  document.body.appendChild(f);
}

/* ---------- página de la materia ---------- */
const descBloque=(m,b)=>b.tipo==='tema'?`${b.min} min de <b>${esc(temaDeId(m,b.tema)?.titulo||'un tema')}</b>`:b.tipo==='simulacro'?`${b.min} min de <b>simulacro</b>`:`${b.min} min de <b>repaso</b>`;
const rutaBloque=(m,b)=>b.tipo==='tema'?`mias/${m.id}/t/${b.tema}`:b.tipo==='simulacro'?`mias/${m.id}/simulacro`:'repaso';
function vistaMateria(id){
  return {
    titulo:miMateria(id)?.nombre||'Materia',
    vista(){
      const m=miMateria(id);if(!m)return vacio({icono:'🎓',titulo:'Esa materia no existe',boton:'<button class="btn" data-go="mias">Mis materias</button>'});
      const p=progreso(),plan=planDe(m,p),ex=proximoExamen(m),prep=preparacion(m,p),debiles=temasDebiles(m,p),h=plan.hoy,prox=plan.proximo;
      const errores=comprobarPlan(m,plan);
      return `<div class="mp-pagina" ${estiloMateria(m)}><div class="nota-cab"><button type="button" class="btn-icono" data-go="mias" aria-label="Volver a Mis materias">←</button><span></span>
<button type="button" class="btn-icono" data-go="mias/${m.id}/editar" aria-label="Editar la materia">✏️</button></div>
<div class="mp-cab"><span class="mp-icono-grande" aria-hidden="true">${esc(m.icono)}</span><div><h1 style="margin:0">${esc(m.nombre)}</h1>${m.escuela?`<p class="nota" style="margin:2px 0 0">${esc(m.escuela)}</p>`:''}</div></div>
${ex?`<div class="card mp-cuenta"><span class="mp-cuenta-num">${Math.max(0,diasEntre(hoy(),ex.fecha))}</span><div><b>${diasEntre(hoy(),ex.fecha)===0?'¡Hoy es el examen!':`días para ${esc(ex.nombre)}`}</b><p class="nota" style="margin:0">${fechaLarga(ex.fecha)}</p></div></div>`
  :'<p class="aviso-linea">No hay exámenes próximos. Agrega uno en ✏️ Editar para armar el plan.</p>'}
<h2>👉 Hoy</h2>
${h?`<div class="card mp-hoy"><p style="margin-top:0">${h.bloques.map(b=>descBloque(m,b)).join(' + ')}</p><div class="pila">${h.bloques.map(b=>`<button class="btn ancho${b.tipo==='tema'?'':' ghost'}" data-go="${rutaBloque(m,b)}">${b.tipo==='tema'?'📖 Estudiar':b.tipo==='simulacro'?'⏱️ Simulacro':'🔁 Repasar'}: ${b.tipo==='tema'?esc(temaDeId(m,b.tema)?.titulo||''):b.min+' min'}</button>`).join('')}</div></div>`
  :`<div class="card"><p style="margin:0">${prox?`Hoy no toca${ex?'':' nada'}: descansa o adelanta. Lo próximo: <b>${fechaCorta(prox.fecha)}</b> — ${prox.bloques.map(b=>descBloque(m,b)).join(' + ')}.`:'Nada pendiente en el plan.'}</p>${prox?`<button class="btn ghost ancho" style="margin-top:8px" data-go="${rutaBloque(m,prox.bloques[0])}">Adelantar</button>`:''}</div>`}
<h2>📊 Preparación</h2>
<div class="card">${prep.map(x=>`<div class="mp-prep"><span>${esc(x.u.titulo)}</span>${barra(pct(x.valor),100)}<span class="nota">${pct(x.valor)} %</span></div>`).join('')}
<p class="nota" style="margin:8px 0 0">Estimado con tu dominio en la práctica, lo que ya sabes y tus simulacros.</p></div>
${debiles.length?`<h2>🎯 Temas débiles</h2><div class="lista-nav">${debiles.map(x=>`<button class="tarjeta-nav" data-go="mias/${m.id}/t/${x.t.id}"><span class="icono" aria-hidden="true">${x.t.dificil?'🔥':'📖'}</span><span class="texto"><span class="titulo">${esc(x.t.titulo)}</span><span class="desc">${pct(x.v)} % · ${esc(x.u.titulo)}</span></span></button>`).join('')}</div>`:''}
<div class="row" style="margin:16px 0"><button class="btn" data-go="mias/${m.id}/simulacro">⏱️ Simulacro de examen</button>${IA.disponible()?`<button class="btn ghost" data-go="mias/${m.id}/preguntar">💬 Pregúntale a tu temario</button>`:''}</div>
<h2>🗓️ Tu plan</h2>${errores.length?`<p class="aviso-linea">⚠️ ${esc(errores[0])}</p>`:''}
${plan.semanas.length?plan.semanas.map((s,i)=>`<details class="mp-semana"${i===0?' open':''}><summary>Semana ${s.n} <span class="nota">· ${fechaCorta(s.dias[0].fecha)} a ${fechaCorta(s.dias.at(-1).fecha)}</span></summary>
<ul class="mp-dias">${s.dias.map(d=>`<li class="${d.fecha===hoy()?'hoy':''}"><b>${fechaCorta(d.fecha)}</b> ${d.tipo==='simulacro'?'⏱️':d.tipo==='repaso'?'🔁':'📖'} ${d.bloques.map(b=>descBloque(m,b)).join(' + ')}</li>`).join('')}</ul></details>`).join('')
  :'<p class="nota">Sin días en el plan: agrega un examen con fecha futura.</p>'}
<p class="nota">El plan se reajusta solo cada día según lo que vas dominando: si un día no estudias, se reparte lo que falta.</p>
<h2>📚 Temario</h2>
${m.unidades.map(u=>`<details class="mp-semana"><summary>${esc(u.titulo)} <span class="nota">· ${u.temas.length} ${u.temas.length===1?'tema':'temas'}</span></summary><div class="lista-nav">${u.temas.map(t=>{const v=dominioTema(m,t,p);
  return `<button class="tarjeta-nav" data-go="mias/${m.id}/t/${t.id}"><span class="icono" aria-hidden="true">${t.sabe?'✅':v>=.8?'👑':t.habilidad?'🎯':generado(m.id,t.id)?'✨':'📖'}</span><span class="texto"><span class="titulo">${esc(t.titulo)}</span><span class="desc">${t.sabe?'Ya lo sé':`${pct(v)} %`}${t.habilidad?' · práctica de la app':generado(m.id,t.id)?' · práctica generada':''}</span></span></button>`}).join('')}</div></details>`).join('')}
<div class="pila" style="margin-top:20px"><button class="btn ghost ancho" data-go="notas/foto/${m.id}">📸 Foto a nota</button><button class="btn ghost ancho" id="mp-compartir">📤 Compartir con mi grupo</button>${m.fotos.length?'<button class="btn ghost ancho" id="mp-ver-fotos">📷 Fotos del temario</button>':''}
<button class="btn ghost ancho peligro-texto" id="mp-borrar">🗑️ Borrar materia</button></div></div>`;
    },
    async alClic(t,ir){
      const m=miMateria(id);if(!m)return;
      if(t.id==='mp-compartir'){const pq=paqueteMateria(m),nombre=`${m.nombre.replace(/[^\p{L}\p{N} _-]/gu,'').trim()||'materia'}.json`,blob=new Blob([JSON.stringify(pq)],{type:'application/json'});
        try{const file=new File([blob],nombre,{type:'application/json'});
          if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:m.nombre,text:`Mi materia «${m.nombre}» para importarla en la app (🎓 Mis materias → 📥 Importar).`});return true}}catch(e){if(e.name==='AbortError')return true}
        descargar(blob,nombre);aviso('📤 Archivo descargado: mándalo a tu grupo; ellos lo importan en 🎓 Mis materias');return true}
      if(t.id==='mp-ver-fotos'){verFoto(m.fotos[0]);return true}
      if(t.id==='mp-borrar'){if(await confirmar({titulo:`¿Borrar «${esc(m.nombre)}»?`,texto:'Se borran su temario, su plan, sus fotos y lo generado con IA de este teléfono. Tus notas se conservan.',si:'Borrar',peligro:true})){await borrarMateria(m);aviso('🗑️ Materia borrada');ir('mias')}return true}
    }
  };
}

/* ---------- página de un tema ---------- */
// Práctica con el banco generado: el nivel (1–3) sigue la dificultad adaptativa del tema
function sesionGenerada(m,t,{volver}){
  const nivel=()=>Math.max(1,Math.min(3,Math.ceil(nivelDe(datosHabilidad(progreso(),m.id,t.id)?.rating||1)*3/5)));
  const vistos=new Set();let n=0;const N=8;
  return crearSesion({
    titulo:t.titulo,salir:volver,materia:m.id,habilidad:t.id,total:()=>N,
    siguiente:()=>{if(n>=N)return null;const l=ejerciciosVivos(m,t.id);if(!l.length)return null;
      const objetivo=nivel(),cand=l.filter(e=>!vistos.has(e.id)).sort((a,b)=>Math.abs(a.nivel-objetivo)-Math.abs(b.nivel-objetivo)||Math.random()-.5);
      const ej=cand[0]||l[Math.floor(Math.random()*l.length)];vistos.add(ej.id);n++;
      return {...preguntaGenerada(m,t,ej),contexto:`✨ Generado con IA · ${m.nombre}`}},
    responder(p,r){const bien=r.correcto&&!r.pista,xp=r.correcto?(r.pista?5:10):0;
      registrarRespuesta(m.id,t.id,r);registrarEjercicio({materia:m.id,ref:p.ref,correcto:bien,xp});return {xp}},
    fin(st){const res=cerrarSesionHabilidad(m.id,t.id,{ok:st.historial.filter(x=>x.r.correcto&&!x.r.pista).length,total:st.historial.length});
      return `<span class="fin-icono" aria-hidden="true">${res.dominada?'👑':'💪'}</span><h1>¡Sesión completa!</h1><p class="nota">${st.ok} de ${st.i} bien.</p>
<button class="btn ancho" data-go="${volver}">Volver al tema</button>`}
  });
}
function vistaTema(id,tid){
  let ses=null;
  return {
    get titulo(){return buscarTema(miMateria(id)||{unidades:[]},tid)?.t.titulo||'Tema'},
    get inmersiva(){return !!ses},
    alEntrar(){ses=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const m=miMateria(id),x=m&&buscarTema(m,tid);
      if(!x)return vacio({icono:'📖',titulo:'Ese tema no existe',boton:`<button class="btn" data-go="${m?`mias/${id}`:'mias'}">Volver</button>`});
      const {t,u}=x,h=habilidadDe(t.habilidad),g=generado(m.id,t.id),v=dominioTema(m,t),vivos=ejerciciosVivos(m,t.id).length;
      return `<div class="mp-pagina" ${estiloMateria(m)}><div class="nota-cab"><button type="button" class="btn-icono" data-go="mias/${m.id}" aria-label="Volver a ${esc(m.nombre)}">←</button><span class="nota">${esc(m.nombre)}</span><span></span></div>
<p class="etiqueta-actividad">${esc(u.titulo)}</p><h1>${esc(t.titulo)}</h1>${t.subtemas.length?`<ul class="nota">${t.subtemas.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
<div class="row" style="margin-bottom:12px">${chip(t.sabe?'✅ Ya lo sé':`${pct(v)} % dominado`,v>=.8||t.sabe?'ok':'area')}
<button type="button" class="chip-filtro" data-t-dificil aria-pressed="${t.dificil}">🔥 Difícil</button><button type="button" class="chip-filtro" data-t-sabe aria-pressed="${t.sabe}">✅ Ya lo sé</button></div>
${h?`<div class="card"><p style="margin-top:0">🎯 La app tiene práctica para esto: <b>${esc(h.l.titulo)}</b> (${esc(h.m.nombre)}). Lo que practiques cuenta aquí y allá.</p>${boton({texto:`Practicar ${esc(h.l.titulo)}`,go:rutaLeccion(h.m,h.l),clase:'ancho'})}</div>`:''}
${g?`<div class="card mp-leccion"><p class="ia-etiqueta">✨ Generado con IA: revisa con tu libro o profesor si algo no cuadra.</p>
<h3>💡 Idea clave</h3><div>${conFormulas(esc(g.leccion.idea))}</div>
<h3>👀 Ejemplo resuelto</h3><div class="pregunta">${conFormulas(esc(g.leccion.ejemplo.enunciado))}</div>${htmlPasos(g.leccion.ejemplo.pasos.map(limpiarPaso),{acciones:false})}
<h3>✍️ Ahora tú</h3><div class="pregunta">${conFormulas(esc(g.leccion.hueco.enunciado))}</div>${htmlPasos(g.leccion.hueco.pasos.map(limpiarPaso),{acciones:false})}
<p><b>${conFormulas(esc(g.leccion.hueco.pregunta))}</b></p><details><summary>Ver respuesta</summary><p>${conFormulas(esc(String(g.leccion.hueco.respuesta)))}</p></details>
${vivos?`<button class="btn ancho" id="tp-practicar">✏️ Practicar (${vivos} ejercicios)</button>`:'<p class="nota">Reportaste todos los ejercicios: genera de nuevo.</p>'}</div>`
  :!h?`<div class="card"><p style="margin-top:0">La app todavía no tiene práctica para este tema.</p>
${IA.disponible()?`<button class="btn ancho" id="tp-generar">✨ Generar lección y ejercicios <span class="nota">(${IA.costo('tema')})</span></button>`:`<p class="nota">${IA.SIN_CLAVE}</p>`}
<button class="btn ghost ancho" id="tp-estudie" style="margin-top:8px">${datosHabilidad(progreso(),m.id,t.id)?.estudiado===hoy()?'✅ Marcado como estudiado hoy':'✅ Lo estudié (con mis apuntes o el libro)'}</button></div>`:''}
${g&&IA.disponible()?`<button class="btn ghost ancho" id="tp-generar">🔄 Generar de nuevo <span class="nota">(${IA.costo('tema')})</span></button>`:''}
<h2>📝 Mis notas de este tema</h2><div id="tp-notas"><p class="cargando">Buscando</p></div>
<div class="pila"><button class="btn ghost ancho" id="tp-nota">🗒️ Nota nueva</button><button class="btn ghost ancho" data-go="notas/foto/${m.id}/${t.id}">📸 Foto a nota</button>${IA.disponible()?`<button class="btn ghost ancho" data-go="mias/${m.id}/preguntar/${t.id}">💬 Pregúntale a tu temario</button>`:''}</div></div>`;
    },
    alMostrar(){
      if(ses){ses.alMostrar?.();return}
      const caja=document.getElementById('tp-notas');if(!caja)return;
      todasLasNotas().then(l=>{const ns=l.filter(n=>n.materia===id&&n.tema===tid).sort((a,b)=>b.editada-a.editada);
        caja.innerHTML=ns.length?`<div class="pila-notas">${ns.map(n=>`<button class="nota-item" data-go="notas/n/${esc(n.id)}"><b>${esc(n.titulo||'Sin título')}</b></button>`).join('')}</div>`:'<p class="nota">Aún no tienes notas de este tema. Puedes crear una o tomar 📸 foto de tu cuaderno.</p>'}).catch(()=>{caja.innerHTML=''});
    },
    async alClic(b,ir,repintarV){
      if(ses)return ses.alClic(b,ir,repintarV);
      const m=miMateria(id),x=m&&buscarTema(m,tid);if(!x)return;
      if(b.dataset.tDificil!==undefined||b.dataset.tSabe!==undefined){const c=structuredClone(m),y=buscarTema(c,tid);
        if(b.dataset.tDificil!==undefined)y.t.dificil=!y.t.dificil;else y.t.sabe=!y.t.sabe;await guardarMateria(c);repintarV();return true}
      if(b.id==='tp-estudie'){marcarEstudiado(m.id,tid);aviso('✅ Anotado: cuenta para tu plan');repintarV();return true}
      if(b.id==='tp-practicar'){ses=sesionGenerada(m,x.t,{volver:`mias/${id}/t/${tid}`});ses.alEntrar();repintarV();return true}
      if(b.id==='tp-generar'){const r=await IA.generarTema(m,x.t,{boton:b});if(r){aviso('✨ Lección y ejercicios listos');repintarV()}return true}
      if(b.id==='tp-nota'){const n=await crearNota({materia:m.id,tema:tid,titulo:x.t.titulo});ir(`notas/n/${n.id}`);return true}
    }
  };
}
const limpiarPaso=p=>({...p,que:esc(p.que),como:esc(p.como),porque:esc(p.porque),ojo:p.ojo?esc(p.ojo):undefined});

/* ---------- simulacro de examen ---------- */
function preguntasSimulacro(m,ex,n){
  const temas=m.unidades.filter(u=>ex.unidades.includes(u.id)).flatMap(u=>u.temas).filter(t=>!t.sabe);
  const fuentes=[];
  for(const t of temas){
    const h=habilidadDe(t.habilidad),g=h&&generadorDe(h.l);
    if(g)fuentes.push(()=>{try{const nivel=nivelDe(datosHabilidad(progreso(),h.m.id,h.l.id)?.rating||2);
      const p=crear(h.l.gen,Math.max(2,nivel));return {...p,ref:`${h.m.id}/g/${h.l.id}/${Math.max(2,nivel)}`,materia:h.m.id,habilidad:h.l.id,temaPropio:t.id}}catch(e){return null}});
    const vivos=ejerciciosVivos(m,t.id).filter(e=>e.tipo!=='opcion'||true);
    if(vivos.length)fuentes.push(()=>{const ej=vivos[Math.floor(Math.random()*vivos.length)];return {...preguntaGenerada(m,t,ej),temaPropio:t.id}});
  }
  // simulacros con estilo de exámenes pasados (generados con IA desde fotos de referencia)
  const sim=generado(m.id,`simulacro-${ex.id}`);
  for(const ej of sim?.ejercicios||[])if(!m.reportados?.[`simulacro-${ex.id}/${ej.id}`])fuentes.push(()=>({...preguntaGenerada(m,{id:`simulacro-${ex.id}`},ej),temaPropio:ej.tema||null}));
  if(!fuentes.length)return [];
  const out=[],usados=new Set();
  for(let i=0;out.length<n&&i<n*6;i++){const f=fuentes[i%fuentes.length],p=f();if(p&&!usados.has(p.enunciado)){usados.add(p.enunciado);out.push(p)}}
  return out.sort(()=>Math.random()-.5);
}
function vistaSimulacro(id){
  let ses=null,examen=null,n=10;
  return {
    titulo:'Simulacro',
    get inmersiva(){return !!ses},
    alEntrar(){ses=null;examen=null},alSalir(){ses?.alSalir?.()},
    vista(){
      if(ses)return ses.vista();
      const m=miMateria(id);if(!m)return vacio({icono:'⏱️',titulo:'Esa materia no existe',boton:'<button class="btn" data-go="mias">Mis materias</button>'});
      const exs=[...m.examenes].sort((a,b)=>a.fecha<b.fecha?-1:1),ex=examen&&exs.find(x=>x.id===examen)||proximoExamen(m)||exs.at(-1);examen=ex?.id;
      const disponibles=ex?preguntasSimulacro(m,ex,n).length:0;
      return `<div class="mp-pagina" ${estiloMateria(m)}><div class="nota-cab"><button type="button" class="btn-icono" data-go="mias/${m.id}" aria-label="Volver">←</button><span class="nota">${esc(m.nombre)}</span><span></span></div>
<h1>⏱️ Simulacro de examen</h1><p class="intro">Como el examen real: con tiempo, sin pistas y sin ver si acertaste hasta el final. Luego revisas cada error con su procedimiento.</p>
${exs.length>1?`<div class="mp-chips">${exs.map(x=>`<button type="button" class="chip-filtro" data-sim-examen="${x.id}" aria-pressed="${x.id===examen}">${esc(x.nombre)}</button>`).join('')}</div>`:''}
<div class="mp-chips" style="margin-top:8px">${[5,10,15].map(k=>`<button type="button" class="chip-filtro" data-sim-n="${k}" aria-pressed="${k===n}">${k} preguntas</button>`).join('')}</div>
${disponibles?`<p class="nota">${disponibles} preguntas de los temas de «${esc(ex.nombre)}» · ${Math.round(disponibles*1.5)} minutos.</p><button class="btn ancho" id="sim-empezar">Empezar simulacro</button>`
  :`<p class="aviso-linea">Los temas de este examen todavía no tienen práctica. Empareja temas con la app (✏️ Editar → Revisar) o genera ejercicios con IA en cada tema.</p>`}
${IA.disponible()&&ex?`<h2>📄 Con el estilo de tu profesor</h2><p class="nota">Sube fotos de exámenes pasados o tareas: la IA genera un simulacro parecido (sin copiar las preguntas).</p>
<div class="row"><label class="btn ghost btn-chico" for="sim-ref">📷 Agregar fotos (${m.referencias.length})</label><input type="file" id="sim-ref" accept="image/*" multiple class="oculto-visual">
${m.referencias.length?`<button class="btn btn-chico" id="sim-generar">✨ Generar simulacro <span class="nota">(${IA.costo('simulacro',m.referencias.length)})</span></button>`:''}</div>`:''}
${m.simulacros.length?`<h2>Tus simulacros</h2><ul class="mp-dias">${[...m.simulacros].reverse().slice(0,5).map(s=>`<li><b>${fechaCorta(s.fecha)}</b> ${esc(m.examenes.find(x=>x.id===s.examen)?.nombre||'')}: ${s.ok}/${s.total} (${pct(s.ok/s.total)} %)</li>`).join('')}</ul>`:''}</div>`;
    },
    alMostrar(){
      if(ses){ses.alMostrar?.();return}
      const inp=document.getElementById('sim-ref');
      inp?.addEventListener('change',async()=>{const m=miMateria(id),fs=[...inp.files];inp.value='';const c=structuredClone(m);
        for(const f of fs){try{const img=await comprimirFoto(f),idf=nuevoId();await guardarArchivo({id:idf,nota:m.id,blob:img.blob,tipo:img.blob.type,ancho:img.ancho,alto:img.alto,creada:Date.now()});c.referencias.push(idf)}catch(e){}}
        await guardarMateria(c);repintar()});
    },
    async alClic(b,ir,repintarV){
      if(ses)return ses.alClic(b,ir,repintarV);
      const m=miMateria(id);if(!m)return;
      if(b.dataset.simExamen){examen=b.dataset.simExamen;repintarV();return true}
      if(b.dataset.simN){n=+b.dataset.simN;repintarV();return true}
      if(b.id==='sim-generar'){const ex=m.examenes.find(x=>x.id===examen);const r=await IA.generarSimulacro(m,ex,{boton:b});if(r){aviso('✨ Simulacro con tu estilo listo');repintarV()}return true}
      if(b.id==='sim-empezar'){
        const ex=m.examenes.find(x=>x.id===examen),preg=preguntasSimulacro(m,ex,n);if(!preg.length)return true;let i=0;
        ses=crearSesion({titulo:`Simulacro: ${ex.nombre}`,salir:`mias/${id}`,materia:m.id,sinPistas:true,sinFeedback:true,crono:Math.round(preg.length*90),total:()=>preg.length,
          siguiente:()=>preg[i++]||null,
          responder(p,r){registrarEjercicio({materia:p.materia||m.id,ref:p.ref,correcto:r.correcto,xp:r.correcto?10:0});if(p.habilidad&&p.materia&&!/^simulacro-/.test(p.habilidad))registrarRespuesta(p.materia,p.habilidad,r);return {xp:r.correcto?10:0}},
          fin(st){
            const porTema={};for(const x of st.historial){const k=x.p.temaPropio;if(!k)continue;porTema[k]=porTema[k]||[0,0];porTema[k][1]++;if(x.r.correcto)porTema[k][0]++}
            const ok=st.historial.filter(x=>x.r.correcto).length,total=st.historial.length,sinResponder=preg.length-total;
            if(total&&!st.guardado){st.guardado=true;const c=structuredClone(miMateria(id));c.simulacros.push({fecha:hoy(),examen:ex.id,ok,total:preg.length,porTema});guardarMateria(c)}
            st.errores=st.historial.filter(x=>!x.r.correcto);
            return `<span class="fin-icono" aria-hidden="true">${ok/preg.length>=.8?'🏆':ok/preg.length>=.6?'💪':'📚'}</span><h1>${ok} de ${preg.length}</h1>
<p class="nota">Calificación estimada: <b>${(ok/preg.length*10).toFixed(1)}</b> / 10${sinResponder?` · ${sinResponder} sin responder (se acabó el tiempo)`:''}</p>
${st.errores.length?`<h2>Revisa tus errores</h2><ol class="mp-revision">${st.errores.map((x,k)=>`<li><div class="pregunta">${conFormulas(x.p.enunciado)}</div><p class="nota">Tu respuesta: «${esc(x.r.entrada??'')}» · Correcta: ${conFormulas(esc(String(x.p.tipo==='opcion'?x.p.opciones[x.p.correcta]:x.p.respuesta)))}</p>
${x.p.pasos?.length?`<button type="button" class="btn ghost btn-chico" data-sim-proc="${k}">📖 Ver procedimiento</button>`:''}${x.p.generado?`<button type="button" class="btn ghost btn-chico" data-reportar="${esc(x.p.ref)}">⚠️ Reportar error</button>`:''}</li>`).join('')}</ol>`:'<p>¡Sin errores!</p>'}
<button class="btn ancho" data-go="mias/${id}">Volver a la materia</button>`;
          }});
        // botones de la revisión final
        const original=ses.alClic.bind(ses);
        ses.alClic=async(t,ir2,rep)=>{const st=ses.estado();
          if(t.dataset.simProc!==undefined){const x=st.errores?.[+t.dataset.simProc];if(x)abrirProcedimiento(x.p,{revelar:false});return true}
          if(t.dataset.reportar){await reportarEjercicio(id,t.dataset.reportar);t.textContent='✅ Reportado';t.disabled=true;return true}
          return original(t,ir2,rep)};
        ses.alEntrar();repintarV();return true;
      }
    }
  };
}
// "⚠️ Reportar error": el ejercicio generado queda marcado, sale del repaso y no vuelve a salir
export async function reportarEjercicio(mid,ref){
  const [,,tid,eid]=String(ref).split('/');const m=miMateria(mid);if(!m||!tid||!eid)return;
  const c=structuredClone(m);c.reportados[`${tid}/${eid}`]=hoy();await guardarMateria(c);
  const {quitarRepaso}=await import('../progreso.js');quitarRepaso(ref);aviso('⚠️ Reportado: ese ejercicio ya no saldrá');
}

window.addEventListener('reportar-ejercicio',e=>{const {materia,ref}=e.detail||{};if(/^mp-/.test(materia||''))reportarEjercicio(materia,ref)});
// Vista según la subruta de 'mias/…'
export function vistaMias(resto=[]){
  const [id,sub,x]=resto;
  if(!id)return vistaLista();
  if(id==='nueva')return vistaAsistente(null);
  if(sub==='editar')return vistaAsistente(id);
  if(sub==='t'&&x)return vistaTema(id,x);
  if(sub==='simulacro')return vistaSimulacro(id);
  if(sub==='preguntar')return IA.vistaPreguntar(id,x);
  return vistaMateria(id);
}
