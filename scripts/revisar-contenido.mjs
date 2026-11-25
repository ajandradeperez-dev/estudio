// Revisa que las lecciones cumplan el método de aprendizaje (ver CLAUDE.md). Uso: npm run revisar
// Sale con código 1 si alguna regla no se cumple.
import {readdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {coincide,casiIgual} from '../src/nucleo/comparar.js';
import {MIN_PRODUCCION,MAX_PALABRAS,UBICACION_MIN,UBICACION_MAX,esProduccion,repartoUbicacion,preguntasUbicacion,palabras} from '../src/nucleo/metodo.js';

const raiz=join(dirname(fileURLToPath(import.meta.url)),'..','src','materias');
const errores=[],avisos=[];
const mal=(donde,msg)=>errores.push(`${donde}: ${msg}`);

// Jerarquía: áreas (src/areas/<id>/area.js) → materias (area:'<id>' en materia.js) → temas (temas.js + temas/<id>/) → lecciones
const dirAreas=join(raiz,'..','areas'),areas={};
for(const id of readdirSync(dirAreas).sort()){
  const f=join(dirAreas,id,'area.js');
  if(!existsSync(f)){mal(`área ${id}`,'falta area.js');continue}
  const a=(await import(pathToFileURL(f).href)).default;areas[id]=[];
  for(const k of ['nombre','icono','descripcion'])if(!a[k])mal(`área ${id}`,`falta ${k}`);
}
const IDS_RESERVADOS=['l','ubicacion','repaso','progreso','notas','inicio','logros','perfil','cofre','jefe','retos','examen-final','certificado'];
globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
const {GENERADORES,BANCOS}=await import(pathToFileURL(join(raiz,'..','nucleo','generadores','index.js')).href);
// Límites legibles (bug «lim x→→−2» con el subíndice al lado): \lim con el subíndice abajo, la flecha separada del signo
// menos y nada de límites escritos como texto en un enunciado (lím (x→0) de …, lím<sub>…</sub>). Lo usan los generadores y las lecciones.
const katexLim=(await import(pathToFileURL(join(raiz,'..','..','node_modules','katex','dist','katex.mjs')).href)).default;
const {prepararTex}=await import(pathToFileURL(join(raiz,'..','nucleo','tex.js')).href);
function malLimite(t,enunciado=false){
  const s=String(t??''),fuera=s.replace(/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/g,' ');
  if(/l[ií]m\s*<sub>/i.test(s))return `límite con <sub> (el subíndice queda al lado): usa \\(\\lim_{x\\to a}\\) en «${s.slice(0,60)}»`;
  if(/→\s*→/.test(fuera.replace(/<[^>]+>/g,'')))return `flecha doble en «${s.slice(0,60)}»`;
  if(enunciado&&/(^|[^\p{L}])l[ií]m\s*(\(|_|\{|\p{L}\s*→)/u.test(fuera.replace(/<[^>]+>/g,'')))return `límite escrito como texto en el enunciado: usa \\(\\lim_{x\\to a}\\) en «${s.slice(0,60)}»`;
  for(const m of s.matchAll(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g)){
    const fx=prepararTex(m[1]||m[2]),n=(fx.match(/\\lim(?![a-zA-Z])/g)||[]).length;if(!n)continue;
    let html='';try{html=katexLim.renderToString(fx,{throwOnError:false,strict:false,trust:c=>c.command==='\\htmlClass',macros:{'\\cambio':'\\htmlClass{cambio}{#1}'}})}catch(e){}
    if((html.match(/op-limits/g)||[]).length<(fx.match(/\\lim(?![a-zA-Z])(?:\\limits)?\s*_/g)||[]).length||/\\nolimits/.test(fx))return `el subíndice del límite no queda abajo en «${fx.slice(0,60)}»`;
    if(/\\to\s*[-−]/.test(fx))return `la flecha queda pegada al signo menos (se lee «→→») en «${fx.slice(0,60)}»`;
  }
  return null;
}
let limitesRevisados=0;
const unidadesIngles=new Set((await import(pathToFileURL(join(raiz,'ingles','hablar','unidades.js')).href)).UNIDADES.map(u=>u.id));
const sinGenerador=[];
for(const materia of readdirSync(raiz).sort()){
  const fm=join(raiz,materia,'materia.js');
  if(!existsSync(fm))continue;
  const area=readFileSync(fm,'utf8').match(/[{,\s]area\s*:\s*'([^']+)'/)?.[1];
  if(!area)mal(materia,"materia.js necesita area:'<id del área>'");else if(!areas[area])mal(materia,`el área ${area} no existe en src/areas/`);else areas[area].push(materia);
  if(areas[materia]&&area!==materia)mal(materia,'una materia no puede tener el id de otra área');
  // Archivos de lecciones en orden: lecciones/*.js o, si hay temas, temas/<tema>/*.js en el orden de temas.js
  const archivos=[],dirTemas=join(raiz,materia,'temas'),fTemas=join(raiz,materia,'temas.js');
  // claves de secciones de materia.js (para validar los enlaces {ir}) e ids de habilidades de toda la materia
  const secciones=[...readFileSync(fm,'utf8').matchAll(/^\s{2,}([a-z][\w-]*):\{titulo:/gm)].map(x=>x[1]),idsMateria=new Set();
  if(existsSync(join(raiz,materia,'lecciones')))for(const f of readdirSync(join(raiz,materia,'lecciones')).filter(f=>f.endsWith('.js')).sort())archivos.push({f,ruta:join(raiz,materia,'lecciones',f)});
  if(existsSync(fTemas)||existsSync(dirTemas)){
    if(archivos.length)mal(materia,'usa lecciones/ o temas/, no las dos');
    if(!existsSync(fTemas)){mal(materia,'tiene la carpeta temas/ pero falta temas.js con la lista de temas');}
    else{
      const defs=(await import(pathToFileURL(fTemas).href)).default,vistos=new Set();
      if(!Array.isArray(defs)||!defs.length)mal(`${materia}/temas.js`,'debe exportar una lista de temas');
      for(const t of defs||[]){
        const dt=`${materia} tema ${t.id}`;
        if(!/^[a-z0-9-]+$/.test(t.id||''))mal(dt,'id inválido (minúsculas, números y guiones)');
        if(vistos.has(t.id))mal(dt,'id de tema repetido');vistos.add(t.id);
        if(IDS_RESERVADOS.includes(t.id))mal(dt,'ese id está reservado para rutas');
        if(secciones.includes(t.id))mal(dt,`el id choca con la sección «${t.id}» de la materia: la ruta abriría el tema y no la herramienta`);
        for(const k of ['titulo','icono','descripcion'])if(!t[k])mal(dt,`falta ${k}`);
        const dir=join(dirTemas,t.id),fs=existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith('.js')).sort():[];
        const deArchivo=new Set(fs.map(f=>f.replace(/^\d+-/,'').replace(/\.js$/,'')));
        if(!Array.isArray(t.nodos)||!t.nodos.length){mal(dt,'necesita nodos: habilidades, herramientas o próximamente');continue}
        t.nodos.forEach((n,i)=>{
          const dn=`${dt} nodo ${i+1}`;
          if(n.proximo){if(!n.titulo?.trim())mal(dn,'un nodo próximamente necesita titulo');return}
          if(n.ir!==undefined){
            if(!n.titulo)mal(dn,'un enlace necesita titulo');
            const [sec,sub,id]=String(n.ir).split('/');
            if(!secciones.includes(sec))mal(dn,`la sección «${sec}» no existe en ${materia}`);
            if(sec==='hablar'&&sub==='u'&&!unidadesIngles.has(id))mal(dn,`la unidad «${id}» no existe`);
            return;
          }
          if(!/^[a-z0-9-]+$/.test(n.id||'')){mal(dn,'una habilidad necesita id (minúsculas, números y guiones)');return}
          if(idsMateria.has(n.id))mal(dn,`el id «${n.id}» se repite en la materia (el progreso se guarda por materia e id)`);idsMateria.add(n.id);
          if(!deArchivo.has(n.id)&&!n.gen&&!n.banco)mal(dn,`«${n.id}» no tiene lección (temas/${t.id}/NN-${n.id}.js), generador ni banco`);
          if(!deArchivo.has(n.id)&&!n.titulo)mal(dn,`«${n.id}» no tiene lección: necesita titulo`);
          if(n.herramienta&&!secciones.includes(n.herramienta))mal(dn,`la herramienta «${n.herramienta}» no existe en ${materia}`);
          if(n.gen&&!GENERADORES[n.gen])sinGenerador.push(`${materia}/${n.id} → ${n.gen}`);
          if(n.banco&&!BANCOS[n.banco])sinGenerador.push(`${materia}/${n.id} → banco ${n.banco}`);
        });
        // lecciones de la carpeta que no están en nodos: se agregan solas, pero su id también debe ser único
        for(const id of deArchivo)if(!t.nodos.some(n=>n.id===id)){if(idsMateria.has(id))mal(`${dt}/${id}`,'id de lección repetido en la materia');idsMateria.add(id)}
        for(const f of fs)archivos.push({f,ruta:join(dir,f),tema:t.id});
      }
      if(existsSync(dirTemas))for(const d of readdirSync(dirTemas))if(!vistos.has(d))mal(`${materia}/temas/${d}`,'carpeta de tema que no está en temas.js');
    }
  }
  if(!archivos.length)continue;
  const lecciones=[],ids=new Set();
  for(const {f,ruta,tema} of archivos){
    const donde=`${materia}/${tema?`temas/${tema}/`:''}${f}`,l=(await import(pathToFileURL(ruta).href)).default;
    const id=f.replace(/^\d+-/,'').replace(/\.js$/,'');
    if(ids.has(id))mal(donde,`el id de lección "${id}" se repite en la materia (el progreso se guarda por materia e id)`);ids.add(id);
    lecciones.push(l);
    if(!/^\d+-[a-z0-9-]+\.js$/.test(f))mal(donde,'el nombre debe ser NN-id.js (minúsculas y guiones)');
    for(const k of ['titulo','resumen'])if(!l[k])mal(donde,`falta ${k}`);
    const p=palabras((l.explicacion||[]).join(' '));
    if(p>MAX_PALABRAS)mal(donde,`la explicación tiene ${p} palabras (máximo ${MAX_PALABRAS})`);
    if(!l.ejemplos?.length)mal(donde,'faltan ejemplos');
    {const m=[...(l.explicacion||[]),...(l.ejemplos||[]).flat()].map(x=>malLimite(x)).find(Boolean);if(m)mal(donde,m)}
    if(!Array.isArray(l.rondas)||l.rondas.length<2){mal(donde,'necesita al menos 2 rondas de ejercicios distintas (para repetir si no se domina)');continue}
    const vistas=new Set();
    l.rondas.forEach((ronda,r)=>{
      const d=`${donde} ronda ${r+1}`;
      if(ronda.length<5)mal(d,`tiene ${ronda.length} ejercicios (mínimo 5)`);
      const prod=ronda.filter(esProduccion).length;
      if(prod/ronda.length<MIN_PRODUCCION)mal(d,`producción ${prod}/${ronda.length} (mínimo ${MIN_PRODUCCION*100}%)`);
      ronda.forEach((ej,i)=>{
        const e=`${d} ej. ${i+1}`,texto=ej.pregunta||ej.frente;
        {const m=[ej.pregunta,ej.frente,...(ej.opciones||[])].map(x=>malLimite(x,true)).find(Boolean);if(m)mal(e,m)}
        if(vistas.has(texto))mal(e,'pregunta repetida en la lección: las rondas deben tener ejercicios distintos');
        vistas.add(texto);
        if(ej.tipo==='opcion'){
          if(i!==0)mal(e,'la opción múltiple solo se usa para introducir: debe ser el primer ejercicio de la ronda');
          if(!(ej.correcta>=0&&ej.correcta<ej.opciones?.length))mal(e,'correcta fuera de rango');
          ej.opciones?.forEach((_,k)=>{if(k!==ej.correcta&&!ej.porque?.[k])mal(e,`falta el porqué de la opción incorrecta ${k}`)});
        }else if(ej.tipo==='completar'){
          if(!ej.respuestas?.length||ej.respuestas.some(x=>typeof x!=='string'||!x.trim()))mal(e,'respuestas vacías');
          if(!ej.errores||!Object.keys(ej.errores).length)avisos.push(`${e}: sin errores típicos (se mostrará una explicación genérica)`);
          for(const x of Object.keys(ej.errores||{}))if(coincide(x,ej.respuestas||[]))mal(e,`el error típico «${x}» coincide con una respuesta correcta`);
        }else if(ej.tipo!=='tarjeta')mal(e,`tipo desconocido: ${ej.tipo}`);
        if(ej.tipo!=='tarjeta'&&!ej.regla)mal(e,'falta la regla que se muestra al fallar');
      });
    });
  }
  // Examen de ubicación: entre 10 y 15 preguntas y suficientes ejercicios de producción en la última ronda
  if(lecciones.length){
    const k=repartoUbicacion(lecciones.length),total=k.reduce((a,b)=>a+b,0);
    if(total<UBICACION_MIN||total>UBICACION_MAX)mal(materia,`el examen de ubicación tendría ${total} preguntas`);
    lecciones.forEach((l,j)=>{const n=preguntasUbicacion(l,k[j]).length;if(n<k[j])mal(`${materia}/${archivos[j].f}`,`la última ronda tiene ${n} ejercicios de producción y la ubicación necesita ${k[j]}`)});
    console.log(`${materia}: ${lecciones.length} lecciones · ubicación de ${total} preguntas`);
  }
}
for(const [id,ms] of Object.entries(areas))if(!ms.length)mal(`área ${id}`,'no tiene materias');
// Inglés · habla: diálogos, pares mínimos, frases útiles y unidades
{
  globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
  const ing=join(raiz,'ingles'),imp=r=>import(pathToFileURL(join(ing,r)).href);
  const {DIALOGOS}=await imp('hablar/dialogos.js'),{FRASES}=await imp('hablar/frases.js'),{SONIDOS}=await imp('errores-pronunciacion.js');
  const {UNIDADES}=await imp('hablar/unidades.js'),{CONTENIDO}=await imp('hablar/contenido.js');
  const {evaluarRespuesta}=await import(pathToFileURL(join(raiz,'..','nucleo','pronunciacion.js')).href);
  // Un ejemplo concreto de un patrón: sin = ni ^, y * cambiado por palabras
  const ejemplo=p=>p.replace(/^[=^]/,'').replace(/\*/g,'maria lopez');
  const ids=new Set();let turnos=0;
  for(const d of DIALOGOS){
    const dd=`diálogo ${d.id}`;
    if(ids.has(d.id))mal(dd,'id repetido');ids.add(d.id);
    for(const k of ['titulo','nivel','personaje','escena'])if(!d[k])mal(dd,`falta ${k}`);
    if(!d.turnos?.length){mal(dd,'sin turnos');continue}
    d.turnos.forEach((t,i)=>{
      const e=`${dd} turno ${i+1}`;turnos++;
      for(const k of ['dice','es','tarea','pista','modelo','regla'])if(!t[k])mal(e,`falta ${k}`);
      if(!(t.acepta?.length>=2))mal(e,'necesita al menos 2 respuestas aceptadas');
      if(t.modelo&&t.acepta&&!evaluarRespuesta([t.modelo],{acepta:t.acepta,errores:t.errores}).ok)mal(e,`el modelo «${t.modelo}» no se acepta`);
      for(const [p,por] of Object.entries(t.errores||{})){
        if(!por)mal(e,`el error «${p}» no explica por qué`);
        const r=evaluarRespuesta([ejemplo(p)],{acepta:t.acepta,errores:t.errores});
        if(r.ok||!r.error)mal(e,`el error «${p}» no se detecta (con «${ejemplo(p)}»)`);
      }
    });
  }
  for(const s of SONIDOS){
    const e=`sonido ${s.id}`;
    for(const k of ['nombre','causa','tip'])if(!s[k])mal(e,`falta ${k}`);
    if(!(s.pares?.length>=3))mal(e,`necesita al menos 3 pares mínimos (tiene ${s.pares?.length||0})`);
    (s.pares||[]).forEach(par=>{if(par.length!==2||!par[0]||!par[1]||par[0].toLowerCase()===par[1].toLowerCase())mal(e,`par mínimo inválido: ${JSON.stringify(par)}`)});
    if(!s.frases?.length)mal(e,'sin frases para practicar');
  }
  for(const [n,lista] of Object.entries(FRASES))lista.forEach((x,i)=>{if(!x.en||!x.es||!x.uso)mal(`frases ${n} #${i+1}`,'faltan en, es o uso')});
  const lecIng=new Set(readdirSync(join(ing,'temas')).flatMap(t=>readdirSync(join(ing,'temas',t)).map(f=>f.replace(/^\d+-/,'').replace(/\.js$/,''))));
  for(const u of UNIDADES){
    const e=`unidad ${u.id}`,c=CONTENIDO[u.id];
    for(const k of ['titulo','nivel','tarea'])if(!u[k])mal(e,`falta ${k}`);
    u.lecciones.forEach(id=>{if(!lecIng.has(id))mal(e,`la lección ${id} no existe`)});
    [...u.dialogos,u.jefe].forEach(id=>{if(!ids.has(id))mal(e,`el diálogo ${id} no existe`)});
    if(!SONIDOS.some(s=>s.id===u.sonido))mal(e,`el sonido ${u.sonido} no existe`);
    if(!c){mal(e,'falta su contenido en contenido.js (escucha, chunks, fluidez)');continue}
    const p=palabras(c.escucha?.texto||'');
    if(p<40||p>120)mal(`${e} escucha`,`el texto tiene ${p} palabras (entre 40 y 120)`);
    const qs=c.escucha?.preguntas||[];
    if(qs.length<3)mal(`${e} escucha`,`tiene ${qs.length} preguntas (mínimo 3)`);
    qs.forEach((q,i)=>{const d=`${e} escucha pregunta ${i+1}`;
      if(q.tipo!=='completar')mal(d,'las preguntas de escucha son de escribir (completar)');
      if(!q.respuestas?.length)mal(d,'respuestas vacías');
      if(!q.regla)mal(d,'falta la regla')});
    if(!(c.chunks?.length>=6))mal(`${e} chunks`,`tiene ${c.chunks?.length||0} frases (mínimo 6)`);
    (c.chunks||[]).forEach((x,i)=>{if(!x.en||!x.es||!x.uso)mal(`${e} chunk ${i+1}`,'faltan en, es o uso')});
    if(!c.fluidez?.tema||!(c.fluidez.guia?.length>=2))mal(`${e} fluidez`,'necesita tema y al menos 2 ideas de guía');
  }
  for(const id of Object.keys(CONTENIDO))if(!UNIDADES.some(u=>u.id===id))mal(`contenido ${id}`,'no corresponde a ninguna unidad');
  console.log(`ingles/hablar: ${DIALOGOS.length} diálogos (${turnos} turnos) · ${SONIDOS.length} sonidos · ${UNIDADES.length} unidades`);
  // Práctica por nivel (P3b): lecturas, escuchas, vocabulario y escritura con rúbrica; en un nivel completo, los mínimos
  const {NIVELES,MINIMOS,palabrasDe,revisarEscrito,contarPalabras}=await imp('nivel/datos.js');
  const {coincide}=await import(pathToFileURL(join(raiz,'..','nucleo','comparar.js')).href);
  const idsN=new Set(),resumen=[];
  for(const [n,d] of Object.entries(NIVELES)){
    const e0=`inglés ${n}`;
    const textos=(tipo,min,max,minQ)=>d[tipo].forEach(t=>{const e=`${e0} ${t.id}`;
      if(idsN.has(t.id))mal(e,'id repetido');idsN.add(t.id);
      if(!t.titulo||!t.texto)mal(e,'falta titulo o texto');
      const w=contarPalabras(t.texto);if(w<min||w>max)mal(e,`el texto tiene ${w} palabras (entre ${min} y ${max})`);
      if(!(t.preguntas?.length>=minQ))mal(e,`tiene ${t.preguntas?.length||0} preguntas (mínimo ${minQ})`);
      (t.preguntas||[]).forEach((x,i)=>{const ep=`${e} pregunta ${i+1}`;
        if(x.tipo!=='completar'||!x.respuestas?.length||!x.regla)mal(ep,'necesita tipo completar, respuestas y regla');
        else if(!coincide(x.respuestas[0],x.respuestas))mal(ep,'la primera respuesta no pasa su propia comprobación');
        for(const v of Object.keys(x.errores||{}))if(coincide(v,x.respuestas))mal(ep,`el error típico «${v}» es una respuesta correcta`)})});
    textos('lecturas',60,220,4);textos('escuchas',40,160,3);
    const vistas=new Set();let nv=0;
    d.vocabulario.forEach((t,ti)=>{if(!t.tema)mal(`${e0} vocabulario ${ti+1}`,'falta el tema');
      palabrasDe(t).forEach((w,i)=>{nv++;const e=`${e0} vocabulario «${t.tema}» #${i+1}`;
        if(!w.en||!w.es||!w.ej)mal(e,'faltan en, es o ejemplo');
        const k=String(w.en).toLowerCase();if(vistas.has(k))mal(e,`«${w.en}» repetida en el nivel`);vistas.add(k)})});
    d.escritura.forEach(t=>{const e=`${e0} ${t.id}`;
      if(idsN.has(t.id))mal(e,'id repetido');idsN.add(t.id);
      for(const k of ['titulo','consigna','modelo'])if(!t[k])mal(e,`falta ${k}`);
      if(!(t.min>0&&t.max>t.min))mal(e,'min y max de palabras inválidos');
      if(!(t.criterios?.length>=3))mal(e,'la rúbrica necesita al menos 3 criterios');
      for(const c of t.criterios||[])try{new RegExp(c.re,'im')}catch(x){mal(e,`criterio «${c.texto}»: expresión inválida`)}
      const r=revisarEscrito(t,t.modelo);if(r.puntos<r.total)mal(e,`el texto modelo no cumple su rúbrica: ${r.criterios.filter(c=>!c.ok).map(c=>c.texto).join('; ')}`)});
    const nd=DIALOGOS.filter(x=>x.nivel===n).length,cuenta={lecturas:d.lecturas.length,escuchas:d.escuchas.length,vocabulario:nv,escritura:d.escritura.length,dialogos:nd};
    if(d.completo)for(const [k,min] of Object.entries(MINIMOS))if(cuenta[k]<min)mal(e0,`${k}: ${cuenta[k]} (mínimo ${min})`);
    resumen.push(`${n}${d.completo?'':' (en construcción)'}: ${cuenta.lecturas} lecturas, ${cuenta.escuchas} escuchas, ${nd} diálogos, ${nv} palabras, ${cuenta.escritura} escritos`);
  }
  console.log(`ingles/nivel: ${resumen.join(' · ')}`);
  // 🏁 Simulacros: contenido original, longitudes por nivel, una sola respuesta correcta por pregunta, rúbricas y escenas
  const sim=await imp('simulacros/motor.js');
  for(const x of sim.validar())mal('simulacros',x);
  console.log(`ingles/simulacros: ${sim.SIMULACROS.length} simulacros (${sim.NIVELES.map(n=>`${n} ${sim.SIMULACROS.filter(s=>s.nivel===n).length}`).join(', ')}) · ${sim.SIMULACROS.reduce((a,s)=>a+sim.partesDe(s).length,0)} partes`);
}
// Excel: el evaluador de fórmulas da el resultado esperado en cada caso de la tabla (cada función y cada error)
{
  const XL=await import(pathToFileURL(join(raiz,'..','nucleo','excel','formulas.js')).href);
  const {HOJA,HOY,CASOS,COPIAS}=await import(pathToFileURL(join(raiz,'..','..','scripts','fixtures','excel-casos.mjs')).href);
  const h=XL.crearHoja(HOJA,{filas:12,cols:8,hoy:HOY});let n=0;
  for(const [f,esp] of CASOS){const v=XL.evaluar(h,f);if(!XL.mismoValor(v,esp))mal('excel: evaluador',`${f} da ${JSON.stringify(v)} (se esperaba ${JSON.stringify(esp)})`);n++}
  for(const [f,de,a,esp] of COPIAS){const v=XL.copiarFormula(f,de,a);if(v!==esp)mal('excel: copiar fórmula',`${f} de ${de} a ${a} da ${v} (se esperaba ${esp})`)}
  const faltan=['SUMA','PROMEDIO','CONTAR','CONTARA','MAX','MIN','REDONDEAR','SI','Y','O','SI.ERROR','CONTAR.SI','SUMAR.SI','PROMEDIO.SI','BUSCARV','BUSCARX','INDICE','COINCIDIR','CONCATENAR','CONCAT','IZQUIERDA','DERECHA','EXTRAE','LARGO','MAYUSC','MINUSC','ESPACIOS','HOY','FECHA','DIAS']
    .filter(fn=>!CASOS.some(([f])=>f.toUpperCase().includes(fn+'(')));
  if(faltan.length)mal('excel: casos de prueba',`faltan casos de ${faltan.join(', ')}`);
  for(const e of ['#¡DIV/0!','#N/A','#¿NOMBRE?','#¡REF!','#¡VALOR!'])if(!CASOS.some(([,x])=>x?.err===e))mal('excel: casos de prueba',`falta un caso que dé ${e}`);
  console.log(`excel: ${n} casos del evaluador (cada función y cada error) y ${COPIAS.length} copias de fórmulas`);
}
// 🗳️ Propuestas: reglas y cliente contra un Supabase simulado (límites, duplicados, aprobación a los 5 votos, sin conexión)
{
  const src=join(raiz,'..','nucleo','propuestas');
  const L=await import(pathToFileURL(join(src,'logica.js')).href);
  const {crearApi}=await import(pathToFileURL(join(src,'api.js')).href);
  const {crearPropuestas}=await import(pathToFileURL(join(src,'estado.js')).href);
  const {crearSimulado}=await import(pathToFileURL(join(raiz,'..','..','scripts','fixtures','supabase-simulado.mjs')).href);
  const e='propuestas';
  if(L.validarPropuesta({tipo:'curso',titulo:'Python',descripcion:''})||L.validarPropuesta({tipo:'curso',titulo:'ab'})!=='titulo'||L.validarPropuesta({tipo:'x',titulo:'Python'})!=='tipo'
    ||L.validarPropuesta({tipo:'tema',titulo:'Algo',descripcion:'x'.repeat(281)})!=='descripcion'||L.validarPropuesta({tipo:'libro',titulo:'eres un idiota'})!=='ofensivo'
    ||L.validarPropuesta({tipo:'tema',titulo:'Volumen de un cono'}))mal(e,'la validación de propuestas falla (largo, tipo o filtro de palabras)');
  const sim=crearSimulado();for(let i=0;i<6;i++)sim.agregar('curso',`Curso ${i+1}`);sim.agregar('tema','Ya hecho','disponible',{enlace:'cursos/excel'});
  const api=crearApi({url:'https://x.supabase.co',clave:'sb_publishable_prueba',fetch:sim.fetch});
  const mem=()=>{const m={};return {getItem:k=>m[k]??null,setItem:(k,v)=>{m[k]=String(v)}}};
  const yo=crearPropuestas({api,almacen:mem()});
  if(!(await yo.cargar()).ok||yo.datos.lista.length!==7)mal(e,'no carga la lista publicada');
  for(const id of [1,2,3])if(!(await yo.votar(id)).ok)mal(e,`no deja votar la propuesta ${id}`);
  if((await yo.votar(4)).error!=='limite_votos')mal(e,'deja votar más de 3 propuestas a la vez');
  await yo.votar(1);if(sim.db.votos.filter(v=>v.propuesta===1).length!==1)mal(e,'un voto repetido cuenta dos veces');
  if(!(await yo.quitar(3)).ok||!(await yo.votar(4)).ok)mal(e,'no se puede quitar un voto y moverlo a otra');
  // la base también lo impide aunque la app se salte la regla
  const d=yo.dispositivo;if((await api.votar(d,5)).error!=='limite_votos')mal(e,'la base acepta un 4.º voto activo');
  // 5 dispositivos distintos → aprobada sola
  for(let k=0;k<4;k++){const otro=crearPropuestas({api,almacen:mem()});await otro.cargar();await otro.votar(1)}
  await yo.cargar();if(yo.datos.lista.find(p=>p.id===1).estado!=='aprobada')mal(e,'con 5 votos no pasa a aprobada');
  if((await yo.quitar(1)).error!=='cerrada')mal(e,'deja quitar el voto de una propuesta ya aprobada');
  // sin conexión: el voto queda en cola, se ve, y se envía al volver la red
  sim.red(false);const r=await yo.votar(6);
  if(!r.ok||!r.enCola||!yo.datos.mios.includes(6)||yo.datos.cola.length!==1)mal(e,'sin conexión el voto no queda en cola');
  if((await yo.cargar()).ok)mal(e,'sin conexión dice que cargó');
  if(yo.datos.lista.length!==7)mal(e,'sin conexión se pierde el último estado guardado');
  sim.red(true);await yo.cargar();
  if(yo.datos.cola.length||!sim.db.votos.some(v=>v.dispositivo===d&&v.propuesta===6))mal(e,'al volver la red no se envían los votos pendientes');
  // 429: mensaje amable y nada se pierde
  sim.limite(true);const q=await api.listar();sim.limite(false);if(q.error!=='limite_uso'||!L.MENSAJES.limite_uso)mal(e,'un 429 no da el mensaje de límite de uso');
  // propuestas: quedan pendientes (no se ven) y máximo 2 por semana
  const p1=await yo.proponer({tipo:'libro',titulo:'Cien años de soledad',descripcion:'Para leer en grupo'}),p2=await yo.proponer({tipo:'tema',titulo:'Física II'});
  if(!p1.ok||!p2.ok)mal(e,'no deja proponer');
  if((await yo.proponer({tipo:'curso',titulo:'Uno más'})).error!=='limite_propuestas')mal(e,'deja más de 2 propuestas por semana');
  if((await api.proponer('otro-disp',{tipo:'curso',titulo:'maldito idiota'})).error!=='ofensivo')mal(e,'la base acepta palabras ofensivas');
  await yo.cargar();if(yo.datos.lista.some(p=>p.estado==='pendiente'))mal(e,'una propuesta pendiente se ve en la lista pública');
  // «¡Ya está lo que pediste!»: solo a quien votó, una vez
  sim.db.propuestas[3].estado='disponible';await yo.cargar();
  if(yo.nuevasDisponibles().map(p=>p.id).join()!=='4')mal(e,'no avisa que ya está lo que votaste');
  yo.marcarVisto(4);if(yo.nuevasDisponibles().length)mal(e,'el aviso se repite');
  // sin servidor configurado: no rompe
  const nada=crearPropuestas({api:crearApi({}),almacen:mem()});if((await nada.cargar()).error!=='sin_servidor'||nada.datos.lista.length!==L.SEMILLA.length)mal(e,'sin Supabase configurado no muestra la lista inicial');
  console.log('propuestas: límites (3 votos, 1 por propuesta, 2 por semana), aprobación a los 5, cola sin conexión, 429 y avisos con un Supabase simulado');
}
// Las claves privadas nunca van al repositorio (la pública de Supabase sí puede ir en src/config.js)
{
  const {execSync}=await import('node:child_process');
  let archivos=[];try{archivos=execSync('git ls-files',{cwd:join(raiz,'..','..'),encoding:'utf8'}).split('\n').filter(Boolean)}catch(e){}
  const {readFileSync:leer}=await import('node:fs');
  for(const f of archivos){if(/\.(png|jpg|webp|ico|woff2?)$/.test(f))continue;let t='';try{t=leer(join(raiz,'..','..',f),'utf8')}catch(e){continue}
    if(/service_role['"]?\s*[:=]\s*['"]eyJ|sk-ant-[a-z0-9]{10}|AIza[0-9A-Za-z_-]{30}|AQ\.[0-9A-Za-z_-]{30}|sb_secret_[A-Za-z0-9]{10}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(t))mal(f,'parece contener una clave privada: no la subas al repositorio')}
}
// IA: la capa común (nucleo/ia.js) arma bien las peticiones de Gemini y de Claude (texto, imágenes y JSON por esquema),
// lee sus respuestas y da mensajes amables (429, clave inválida, respuesta cortada); con respuestas simuladas, sin red real
{
  const mem={},antes={ls:globalThis.localStorage,f:globalThis.fetch};
  globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
  const IA=await import(pathToFileURL(join(raiz,'..','nucleo','ia.js')).href);
  const e='ia';let ult=null,resp=null;
  globalThis.fetch=async(url,op)=>{ult={url,op,cuerpo:JSON.parse(op.body)};const [st,cu]=resp(ult);return {ok:st<300,status:st,json:async()=>cu}};
  const esquema={type:'object',additionalProperties:false,required:['explicacion'],properties:{explicacion:{type:'string'}}};
  const img={media_type:'image/jpeg',data:'AAAA'};
  // por defecto: Gemini; una clave vieja de Anthropic ({clave, modelo}) sigue funcionando con Claude
  if(IA.leerAjustes().proveedor!=='gemini')mal(e,'el proveedor por defecto no es Gemini');
  mem['ciberlab-ia']=JSON.stringify({clave:'sk-ant-vieja',modelo:'claude-haiku-5-5'});
  if(IA.leerAjustes().proveedor!=='claude'||IA.leerAjustes().clave!=='sk-ant-vieja')mal(e,'se pierde la clave de Anthropic guardada antes');
  // Gemini
  IA.guardarAjustes({proveedor:'gemini',clave:'AIzaPRUEBA'});
  resp=()=>[200,{candidates:[{finishReason:'STOP',content:{parts:[{text:'{"explicacion":"Hola"}'}]}}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:5}}];
  let uso=null;const g=await IA.pedir({sistema:'S',mensajes:[{role:'user',content:'Explica'}],imagenes:[img],esquemaJSON:esquema,nivel:'vision',alUso:u=>{uso=u}});
  const gc=ult.cuerpo;
  if(g?.explicacion!=='Hola')mal(e,'Gemini: no lee la respuesta JSON');
  if(!/\/models\/gemini-3\.8-flash:generateContent$/.test(ult.url)||ult.op.headers['x-goog-api-key']!=='AIzaPRUEBA')mal(e,'Gemini: URL, modelo o cabecera de la clave incorrectos');
  if(gc.systemInstruction?.parts?.[0]?.text!=='S'||gc.generationConfig?.responseMimeType!=='application/json'||!gc.generationConfig?.responseJsonSchema)mal(e,'Gemini: falta systemInstruction o el esquema JSON');
  if(!gc.contents[0].parts[0].inlineData||gc.contents[0].parts[0].inlineData.mimeType!=='image/jpeg'||gc.contents[0].parts.at(-1).text!=='Explica')mal(e,'Gemini: la imagen no va como inlineData');
  if(uso?.input_tokens!==10)mal(e,'Gemini: no reporta los tokens usados');
  await IA.pedir({mensajes:[{role:'user',content:'a'},{role:'assistant',content:'b'},{role:'user',content:'c'}]});
  if(ult.cuerpo.contents.map(c=>c.role).join()!=='user,model,user')mal(e,'Gemini: los turnos del asistente no van como model');
  for(const [st,cu,codigo] of [[429,{error:{status:'RESOURCE_EXHAUSTED',message:'quota'}},'429'],[400,{error:{status:'INVALID_ARGUMENT',message:'API key not valid. Please pass a valid API key.'}},'401'],[200,{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{"ex'}]}}]},'cortada']]){
    resp=()=>[st,cu];try{await IA.pedir({mensajes:[{role:'user',content:'x'}],esquemaJSON:esquema});mal(e,`Gemini: no falla con ${codigo}`)}catch(x){if(x.codigo!==codigo||!x.message)mal(e,`Gemini: error ${codigo} mal reportado (${x.codigo})`)}}
  // Claves «AQ.» (formato nuevo de Google): se aceptan y van igual en x-goog-api-key (claves falsas)
  for(const [p,v,ok] of [['gemini','AIzaFALSA',true],['gemini','AQ.FALSA',true],['gemini','sk-ant-FALSA',false],['gemini','AQFALSA',false],['claude','sk-ant-FALSA',true],['claude','AQ.FALSA',false]])
    if(IA.pareceClave(p,v)!==ok)mal(e,`pareceClave(${p}, ${v.slice(0,4)}…) debería ser ${ok}`);
  IA.guardarAjustes({proveedor:'gemini',clave:'AQ.FALSA'});
  resp=()=>[200,{candidates:[{finishReason:'STOP',content:{parts:[{text:'ok'}]}}]}];
  await IA.pedir({mensajes:[{role:'user',content:'x'}]});
  if(ult.op.headers['x-goog-api-key']!=='AQ.FALSA'||ult.op.headers.authorization)mal(e,'Gemini: la clave AQ. no va en x-goog-api-key');
  // «Probar»: clave inválida (401/403), límite (429) y sin conexión, cada uno con su mensaje
  const {mensajePrueba}=await import(pathToFileURL(join(raiz,'..','nucleo','ia-ajustes.js')).href).catch(()=>({}));
  const casos=[[401,{error:{status:'UNAUTHENTICATED',message:'x',details:[{reason:'ACCESS_TOKEN_TYPE_UNSUPPORTED'}]}},/^Clave inválida/],[403,{error:{status:'PERMISSION_DENIED',message:'x'}},/^Clave inválida/],[429,{error:{status:'RESOURCE_EXHAUSTED',message:'x'}},/^Límite agotado.*gratuito/]];
  for(const [st,cu,re] of casos){resp=()=>[st,cu];try{await IA.probarClave();mal(e,`Probar: no falla con ${st}`)}catch(x){if(st===401&&!/tipo de clave/.test(x.message))mal(e,'Gemini: ACCESS_TOKEN_TYPE_UNSUPPORTED no se explica');if(mensajePrueba&&!re.test(mensajePrueba(x,'Gemini')))mal(e,`Probar: mensaje de ${st} poco claro: ${mensajePrueba(x,'Gemini')}`)}}
  {const f0=globalThis.fetch;globalThis.fetch=async()=>{throw new TypeError('Failed to fetch')};
   try{await IA.probarClave();mal(e,'Probar: no falla sin conexión')}catch(x){if(mensajePrueba&&!/^Sin conexión/.test(mensajePrueba(x,'Gemini')))mal(e,`Probar: sin conexión mal reportado: ${x.codigo}`)}
   globalThis.fetch=f0}
  if(!mensajePrueba)mal(e,'no se pudo cargar mensajePrueba de ia-ajustes.js');
  // Claude
  IA.guardarAjustes({proveedor:'claude',clave:'sk-ant-PRUEBA',modelo:'claude-haiku-5-5'});
  resp=()=>[200,{stop_reason:'end_turn',content:[{type:'text',text:'{"explicacion":"Hi"}'}],usage:{input_tokens:7,output_tokens:3}}];
  const c=await IA.pedir({sistema:'S',mensajes:[{role:'user',content:'Explica'}],imagenes:[img],esquemaJSON:esquema,nivel:'vision'});
  if(c?.explicacion!=='Hi')mal(e,'Claude: no lee la respuesta JSON');
  if(ult.url!=='https://api.anthropic.com/v1/messages'||ult.op.headers['x-api-key']!=='sk-ant-PRUEBA'||ult.cuerpo.model!=='claude-sonnet-5-5')mal(e,'Claude: URL, clave o modelo de visión incorrectos');
  if(ult.cuerpo.messages[0].content[0].type!=='image'||ult.cuerpo.output_config?.format?.type!=='json_schema')mal(e,'Claude: la imagen o el esquema no van en el formato de Anthropic');
  await IA.pedirJSON({system:'S',messages:[{role:'user',content:'x'}],schema:esquema});if(ult.cuerpo.model!=='claude-haiku-5-5')mal(e,'Claude: el texto no usa el modelo elegido');
  resp=()=>[429,{error:{message:'rate'}}];try{await IA.pedir({mensajes:[{role:'user',content:'x'}]});mal(e,'Claude: no falla con 429')}catch(x){if(x.codigo!=='429')mal(e,'Claude: 429 mal reportado')}
  // Groq, OpenRouter y Mistral (API compatible con OpenAI), JSON por esquema o en el prompt, y 🔁 respaldo automático
  {
    const ok=(texto,extra={})=>[200,{choices:[{finish_reason:'stop',message:{content:texto}}],usage:{prompt_tokens:4,completion_tokens:2},...extra}];
    for(const [p,clave,url,modelo] of [['groq','gsk_FALSA','https://api.groq.com/openai/v1/chat/completions','openai/gpt-oss-120b'],
      ['openrouter','sk-or-FALSA','https://openrouter.ai/api/v1/chat/completions','google/gemma-4-31b-it:free'],['mistral','abcdefghijklmnopqrstuvwxyzABCDEF','https://api.mistral.ai/v1/chat/completions','mistral-small-latest']]){
      if(!IA.pareceClave(p,clave)||IA.pareceClave(p,'AIzaFALSA'))mal(e,`${p}: reconoce mal su clave`);
      IA.guardarAjustes({proveedor:p,clave});resp=()=>ok('{"explicacion":"Hola"}');
      const r=await IA.pedir({sistema:'S',mensajes:[{role:'user',content:'Explica'}],esquemaJSON:esquema});
      if(r?.explicacion!=='Hola'||ult.url!==url||ult.op.headers.authorization!==`Bearer ${clave}`||ult.cuerpo.model!==modelo)mal(e,`${p}: URL, clave Bearer, modelo o respuesta incorrectos`);
      if(ult.cuerpo.messages[0].role!=='system'||ult.cuerpo.response_format?.type!=='json_schema'||!ult.cuerpo.response_format.json_schema?.schema)mal(e,`${p}: falta el mensaje de sistema o el esquema en response_format`);
    }
    if(!/:free$/.test(IA.PROVEEDORES.openrouter.texto)||!/:free$/.test(IA.PROVEEDORES.openrouter.vision))mal(e,'OpenRouter: un modelo que no es «:free»');
    // imágenes en formato OpenAI (Mistral lee fotos; Groq no: se salta)
    IA.guardarAjustes({proveedor:'mistral'});resp=()=>ok('{"explicacion":"Foto"}');
    await IA.pedir({mensajes:[{role:'user',content:'Lee'}],imagenes:[img],esquemaJSON:esquema,nivel:'vision'});
    if(ult.cuerpo.model!=='ministral-8b-latest'||ult.cuerpo.messages.at(-1).content[0].type!=='image_url'||!ult.cuerpo.messages.at(-1).content[0].image_url.url.startsWith('data:image/jpeg;base64,'))mal(e,'Mistral: la foto no va como image_url o no usa el modelo de visión');
    // un modelo que no acepta el esquema: se pide en el prompt (json_object) y se valida la respuesta
    IA.guardarAjustes({proveedor:'groq'});let n=0;
    resp=u=>{n++;return u.cuerpo.response_format?.type==='json_schema'?[400,{error:{message:'response_format json_schema is not supported by this model'}}]:ok('Claro: {"explicacion":"Sí"}')};
    const rp=await IA.pedir({sistema:'S',mensajes:[{role:'user',content:'x'}],esquemaJSON:esquema});
    if(rp?.explicacion!=='Sí'||n!==2||ult.cuerpo.response_format?.type!=='json_object'||!/esquema JSON/.test(ult.cuerpo.messages[0].content))mal(e,'sin esquema en la API: no se pide el JSON en el prompt o no se lee');
    resp=()=>ok('{"otra":"cosa"}');try{await IA.pedir({mensajes:[{role:'user',content:'x'}],esquemaJSON:esquema});mal(e,'un JSON que no cumple el esquema se acepta')}catch(x){if(x.codigo!=='json')mal(e,'JSON que no cumple: error equivocado')}
    if(IA.validarEsquema({a:[1,'x']},{type:'object',required:['a'],properties:{a:{type:'array',items:{type:'number'}}}})===''||IA.validarEsquema({a:'v'},{type:'object',properties:{a:{enum:['v']}}})!=='')mal(e,'validarEsquema');
    // errores: 401, 429 (también 200 con error de OpenRouter), 503
    for(const [st,cu,codigo] of [[401,{error:{message:'Invalid API Key'}},'401'],[429,{error:{message:'rate'}},'429'],[200,{error:{code:429,message:'Rate limit'}},'429'],[503,{},'saturado']]){
      IA.guardarAjustes({proveedor:'openrouter',respaldo:{activo:false}});resp=()=>[st,cu];
      try{await IA.pedir({mensajes:[{role:'user',content:'x'}]});mal(e,`compatible: no falla con ${st}`)}catch(x){if(x.codigo!==codigo)mal(e,`compatible: ${st} mal reportado (${x.codigo})`)}}
    // 🔁 respaldo: Gemini principal saturado → Groq, con aviso; con foto se salta Groq; 401 no pasa al siguiente
    IA.guardarAjustes({proveedor:'gemini',clave:'AIzaPRUEBA',respaldo:{activo:true,orden:['gemini','groq','openrouter','mistral','claude']}});
    const usados=[];resp=u=>{usados.push(u.url.includes('groq')?'groq':u.url.includes('openrouter')?'openrouter':u.url.includes('mistral')?'mistral':'gemini');
      return u.url.includes('generativelanguage')?[503,{error:{status:'UNAVAILABLE'}}]:ok('hola')};
    const rr=await IA.pedir({mensajes:[{role:'user',content:'x'}]});
    if(rr!=='hola'||usados.join()!=='gemini,groq'||IA.ultimoRespaldo?.texto!=='Usando Groq (Gemini saturado)')mal(e,`respaldo: ${usados} · ${IA.ultimoRespaldo?.texto}`);
    usados.length=0;await IA.pedir({mensajes:[{role:'user',content:'x'}],imagenes:[img],nivel:'vision'});
    if(usados.join()!=='gemini,openrouter')mal(e,`respaldo con foto: debería saltarse Groq (${usados})`);
    usados.length=0;resp=u=>{usados.push(u.url);return u.url.includes('generativelanguage')?[429,{error:{status:'RESOURCE_EXHAUSTED'}}]:[401,{error:{message:'bad'}}]};
    try{await IA.pedir({mensajes:[{role:'user',content:'x'}]});mal(e,'respaldo: todos fallan y no avisa')}catch(x){if(x.codigo!=='429'||usados.length!==2)mal(e,`respaldo: con clave inválida en el respaldo debe parar y avisar el error del principal (${x.codigo}, ${usados.length})`)}
    {const f0=globalThis.fetch;let k=0;globalThis.fetch=async(url,op)=>{k++;if(String(url).includes('generativelanguage'))throw new TypeError('Failed to fetch');return f0(url,op)};resp=()=>ok('ok');
     const r3=await IA.pedir({mensajes:[{role:'user',content:'x'}]});if(r3!=='ok'||!/Gemini no responde/.test(IA.ultimoRespaldo.texto))mal(e,'respaldo: sin conexión con el principal no pasa al siguiente');globalThis.fetch=f0}
    IA.guardarAjustes({respaldo:{activo:false}});usados.length=0;resp=u=>{usados.push(u.url);return [503,{}]};
    try{await IA.pedir({mensajes:[{role:'user',content:'x'}]})}catch(x){}if(usados.length!==1)mal(e,'respaldo desactivado: igual usa otros proveedores');
    IA.guardarAjustes({respaldo:{activo:true,usar:{groq:false}}});if(IA.cadenaProveedores().includes('groq')||IA.cadenaProveedores().includes('claude'))mal(e,'respaldo: usa un proveedor desmarcado o Claude (de pago) sin marcarlo');
    // Probar una clave usa solo ese proveedor (sin respaldo)
    usados.length=0;resp=u=>{usados.push(u.url);return ok('hola')};await IA.probarClave('mistral');if(usados.length!==1||!usados[0].includes('mistral'))mal(e,'Probar: no usa solo el proveedor elegido');
    IA.guardarAjustes({respaldo:{activo:true,usar:{groq:true}}});
    for(const k of ['groq','openrouter','mistral'])IA.borrarClave(k);
  }
  // sin clave: mensaje que dice dónde ponerla
  IA.guardarAjustes({proveedor:'gemini',clave:''});try{await IA.pedir({mensajes:[{role:'user',content:'x'}]});mal(e,'sin clave no avisa')}catch(x){if(x.codigo!=='sin-clave')mal(e,'sin clave: error equivocado')}
  if(IA.costoUSD('texto',1e6,1e6)!==0)mal(e,'Gemini gratis no debería mostrar costo');
  globalThis.localStorage=antes.ls;globalThis.fetch=antes.f;
  console.log('ia: Gemini, Claude, Groq, OpenRouter (:free) y Mistral con texto, imágenes y JSON, turnos, tokens, 429, clave inválida, respuesta cortada, clave vieja, claves AQ., JSON con esquema o en el prompt, respaldo automático y mensajes de «Probar» (respuestas y claves simuladas)');
}
// 📚 Lectura: cada libro con licencia y atribución, sus capítulos en public/libros, y cada pregunta de comprensión con su
// evidencia (frase que aparece tal cual en ese capítulo)
{
  const {LIBROS}=await import(pathToFileURL(join(raiz,'lectura','catalogo.js')).href);
  const {PREGUNTAS}=await import(pathToFileURL(join(raiz,'lectura','preguntas.js')).href);
  const pub=join(raiz,'..','..','public','libros');let nq=0;
  for(const l of LIBROS){const e=`lectura/${l.id}`;
    for(const k of ['titulo','autor','licencia','atribucion','fuente'])if(!l[k])mal(e,`falta ${k} (licencia y atribución son obligatorias)`);
    if(!/dominio público|CC BY/i.test(l.licencia))mal(e,`licencia «${l.licencia}»: solo dominio público o CC BY`);
    for(const c of l.capitulos){const f=join(pub,l.id,`${c.n}.json`);if(!existsSync(f)){mal(e,`falta el capítulo ${c.n} en public/libros`);continue}
      const capJ=JSON.parse(readFileSync(f,'utf8')),t=capJ.bloques.map(b=>String(b.x).replace(/<br>/g,' / ')).join(' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
      if(/PROJECT GUTENBERG|Gutenberg License|gutenberg\.org\/license/i.test(t))mal(e,`el capítulo ${c.n} conserva el encabezado o la licencia de Project Gutenberg`);
      const qs=PREGUNTAS[l.id]?.[c.n-1]||capJ.preguntas||[];
      if(!l.tecnico&&qs.length<3)mal(e,`capítulo ${c.n}: necesita al menos 3 preguntas de comprensión`);
      for(const [q,resp,ev] of qs){nq++;if(!t.includes(ev))mal(e,`capítulo ${c.n}: la evidencia «${ev}» no está en el texto («${q}»)`);if(!resp?.length)mal(e,`capítulo ${c.n}: pregunta sin respuestas`)}}
    for(const k of ['idioma','niveles','generos'])if(!l[k]?.length)mal(e,`falta la etiqueta ${k} (para los filtros de la biblioteca)`);
    if(PREGUNTAS[l.id]&&PREGUNTAS[l.id].length!==l.capitulos.length)mal(e,'las preguntas escritas a mano no cubren todos los capítulos');
  }
  console.log(`lectura: ${LIBROS.length} libros con licencia y atribución, capítulos en public/libros y ${nq} preguntas con su evidencia en el texto`);
}
// Migración: un progreso v5 (con la materia 'algebra') llega a la versión actual sin perder nada
{
  const mem={};
  globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
  const P=await import(pathToFileURL(join(raiz,'..','nucleo','progreso.js')).href);
  const f=n=>P.sumarDias(P.hoy(),-n),l=(d,m=0.9)=>({dominada:d,mejor:m,intentos:1,via:'practica'});
  const v5={v:5,meta:{tipo:'ejercicios',cantidad:10},mejorRacha:4,dominados:2,
    dias:{[f(0)]:{ej:12,seg:0,xp:120,ok:true},[f(1)]:{ej:10,seg:0,xp:100,ok:true},[f(2)]:{ej:11,seg:0,xp:100,ok:true}},
    materias:{algebra:{xp:230,lecciones:{expresiones:l(true),'ecuaciones-lineales':l(false,0.4)},extra:{}},ingles:{xp:50,lecciones:{'verbo-to-be':l(true)},extra:{}}},
    repaso:{'algebra/l/expresiones/3':{paso:1,proxima:f(-1),fallos:0},'ingles/l/can/2':{paso:0,proxima:f(0),fallos:1}},
    notas:{'algebra/expresiones':{texto:'Resumen',fecha:f(3)}},ultimo:{ruta:'algebra/l/ecuaciones-lineales',materia:'algebra'},frases:{},historial:[{materia:'algebra',tipo:'algebra/l/expresiones',fecha:f(0)}]};
  mem['ciberlab-progreso']=JSON.stringify(v5);
  const p=P.progreso(),m=p.materias.matematicas,e='migración v5';
  if(p.v!==11)mal(e,`queda en la versión ${p.v} (se esperaba 11)`);
  if(p.materias.algebra||m?.xp!==230||!m.lecciones.expresiones?.dominada||m.lecciones['ecuaciones-lineales']?.mejor!==0.4)mal(e,'se pierden la XP o las lecciones de Álgebra (ahora Matemáticas)');
  if(!p.materias.ingles?.lecciones['verbo-to-be']?.dominada)mal(e,'se pierden lecciones de otras materias');
  if(!p.repaso['matematicas/l/expresiones/3']||!p.repaso['ingles/l/can/2'])mal(e,'se pierden o no se renombran repasos: '+Object.keys(p.repaso).join(', '));
  // v7: los repasos pasan a SM-2 conservando la fecha, y lo dominado entra al repaso espaciado de habilidades
  const r3=p.repaso['matematicas/l/expresiones/3'];
  if(r3&&(r3.rep!==1||r3.int!==1||r3.ef!==2.5||r3.proxima!==f(-1)))mal(e,'el repaso no pasa bien a SM-2: '+JSON.stringify(r3));
  if(!p.repaso['matematicas/h/expresiones']||!p.repaso['ingles/h/verbo-to-be']||p.repaso['matematicas/h/ecuaciones-lineales'])mal(e,'las habilidades dominadas no entran (solo ellas) al repaso de habilidades');
  if(typeof m?.lecciones.expresiones?.rating!=='number'||!Array.isArray(m?.lecciones.expresiones?.ult))mal(e,'falta el registro de dominio (rating, últimas respuestas)');
  if(p.notas['matematicas/expresiones']?.texto!=='Resumen')mal(e,'se pierde la nota');
  // v8: tarjetas de las notas del cuaderno (vacías al migrar)
  if(!p.tarjetas||typeof p.tarjetas!=='object'||Object.keys(p.tarjetas).length)mal(e,'v8: falta el objeto de tarjetas');
  // v9: niveles de profundidad (básicos retirados, refuerzos pendientes y retos con ⭐), vacíos al migrar
  for(const k of ['basicos','refuerzos','estrellas'])if(!p[k]||typeof p[k]!=='object'||Array.isArray(p[k])||Object.keys(p[k]).length)mal(e,`v9: falta el objeto ${k}`);
  // un básico se retira tras 2 aciertos sin pista en sesiones distintas; un fallo lo reinicia
  globalThis.window??={dispatchEvent(){}};
  P.registrarBasico('l:matematicas/l/expresiones/0',{correcto:true},{sesion:'s1',materia:'matematicas',habilidad:'expresiones'});
  P.registrarBasico('l:matematicas/l/expresiones/0',{correcto:true},{sesion:'s1',materia:'matematicas',habilidad:'expresiones'});
  if(P.basicoRetirado('l:matematicas/l/expresiones/0'))mal(e,'v9: un básico se retira con 2 aciertos en la misma sesión');
  P.registrarBasico('l:matematicas/l/expresiones/0',{correcto:true},{sesion:'s2',materia:'matematicas',habilidad:'expresiones'});
  if(!P.basicoRetirado('l:matematicas/l/expresiones/0'))mal(e,'v9: un básico no se retira con 2 aciertos en sesiones distintas');
  P.reactivarBasicos('matematicas',['expresiones']);
  if(P.basicoRetirado('l:matematicas/l/expresiones/0'))mal(e,'v9: "volver a ver lo retirado" no reactiva el básico');
  if(P.racha(p)!==3||p.mejorRacha!==4||p.dominados!==2)mal(e,`se pierde la racha (${P.racha(p)} días)`);
  if(p.ultimo?.materia!=='matematicas'||p.historial[0]?.materia!=='matematicas')mal(e,'"continuar" o el historial siguen apuntando a algebra');
  if(JSON.parse(mem['ciberlab-progreso']).v!==p.v)mal(e,'la migración no se guarda');
  // v10: Ciberseguridad pasa a 💼 Cursos: un progreso v9 conserva todo y "continuar" apunta a la ruta nueva
  const v9={...JSON.parse(mem['ciberlab-progreso']),v:9,ultimo:{ruta:'ciberseguridad/fw',materia:'ciberseguridad'},historial:[{materia:'ciberseguridad',tipo:'ciberseguridad/quiz',fecha:f(0)}]};
  v9.materias.ciberseguridad={xp:340,lecciones:{'subredes-cidr':l(true)},extra:{visitadas:['fw']},visitadas:['fw']};
  v9.repaso['ciberseguridad/examen/3']={rep:1,int:1,ef:2.5,proxima:f(0),fallos:1};v9.notas['ciberseguridad/subredes-cidr']={texto:'Red y broadcast',fecha:f(1)};
  mem['ciberlab-progreso']=JSON.stringify(v9);
  const q=P.progreso(),e10='migración v10 (Cursos)';
  if(q.v!==11)mal(e10,`queda en la versión ${q.v}`);
  if(q.materias.ciberseguridad?.xp!==340||!q.materias.ciberseguridad.lecciones['subredes-cidr']?.dominada)mal(e10,'se pierden la XP o las habilidades de Ciberseguridad');
  if(!q.repaso['ciberseguridad/examen/3']||q.notas['ciberseguridad/subredes-cidr']?.texto!=='Red y broadcast')mal(e10,'se pierden repasos o notas de Ciberseguridad');
  if(q.ultimo?.ruta!=='cursos/ciberseguridad/fw'||q.historial[0]?.tipo!=='cursos/ciberseguridad/quiz')mal(e10,'"continuar" sigue en la ruta vieja: '+q.ultimo?.ruta);
  if(q.materias.matematicas?.xp!==230||P.racha(q)!==3)mal(e10,'se pierde lo de otras materias o la racha');
  // v11: lo acumulado queda como «base» de cada contador (para combinar dispositivos sin contar dos veces)
  if(q.materias.matematicas?.base?.xp!==230||q.dias[f(0)]?.base?.ej!==12)mal('migración v11','la XP y los contadores del día no quedan como base');
  console.log(`progreso: un v5 migra a v${p.v} conservando lecciones, XP, racha, repasos y notas; un v9 con Ciberseguridad pasa a Cursos sin perder nada`);
  // Combinar dos dispositivos (sync/fusionar.js): XP exacta sin duplicar, idempotente, racha de la unión, repaso más reciente, lápidas
  const S=await import(pathToFileURL(join(raiz,'..','nucleo','sync','fusionar.js')).href),es='combinar dispositivos',sumar=P.sumarDias;
  const vacioP=()=>({v:11,meta:{tipo:'ejercicios',cantidad:10},dias:{},mejorRacha:0,materias:{},repaso:{},dominados:0,notas:{},tarjetas:{},basicos:{},refuerzos:{},estrellas:{},ultimo:null,frases:{},historial:[]});
  const ganar=(x,mat,xp,ej,dd=0)=>{const m=x.materias[mat]=x.materias[mat]||{xp:0,lecciones:{},extra:{},visitadas:[]};m.xp+=xp;const d=x.dias[f(dd)]=x.dias[f(dd)]||{ej:0,seg:0,xp:0,ok:false};d.ej+=ej;d.xp+=xp;if(d.ej>=10)d.ok=true};
  const A=vacioP();ganar(A,'matematicas',100,10);ganar(A,'matematicas',40,10,1);ganar(A,'matematicas',30,10,2);
  // B importa el respaldo de A (Reemplazar) y sigue practicando; A también
  let B=S.marcarAportes(A,'A');ganar(B,'matematicas',50,5);ganar(B,'ingles',20,2);
  ganar(A,'matematicas',30,3);
  const xpDe=(x,mt)=>x.materias[mt]?.xp,ejHoy=x=>x.dias[f(0)]?.ej;
  const AB=S.fusionarProgreso(A,S.marcarAportes(B,'B'),{yo:'A',el:'B'});
  if(xpDe(AB,'matematicas')!==250||xpDe(AB,'ingles')!==20||ejHoy(AB)!==20)mal(es,`la XP o los ejercicios no se suman exacto (${xpDe(AB,'matematicas')} XP, ${ejHoy(AB)} ej; se esperaba 250 y 20)`);
  const AB2=S.fusionarProgreso(AB,S.marcarAportes(B,'B'),{yo:'A',el:'B'}),AB3=S.fusionarProgreso(AB2,S.marcarAportes(AB2,'A'),{yo:'A',el:'A'});
  if(xpDe(AB2,'matematicas')!==250||ejHoy(AB2)!==20||xpDe(AB3,'matematicas')!==250)mal(es,'combinar otra vez duplica la XP');
  const BA=S.fusionarProgreso(B,S.marcarAportes(A,'A'),{yo:'B',el:'A'});
  if(xpDe(BA,'matematicas')!==250||ejHoy(BA)!==20)mal(es,'combinar en el otro sentido no da lo mismo');
  // B sigue y vuelve a combinar: solo se suma lo nuevo
  ganar(B,'matematicas',7,1);const AB4=S.fusionarProgreso(AB,S.marcarAportes(B,'B'),{yo:'A',el:'B'});
  if(xpDe(AB4,'matematicas')!==257)mal(es,`lo nuevo de un dispositivo no se suma una sola vez (${xpDe(AB4,'matematicas')})`);
  // base de antes de v11: máximo (no se infla)
  const L1=vacioP(),L2=vacioP();L1.materias.matematicas={xp:100,base:{xp:100},lecciones:{},extra:{}};L2.materias.matematicas={xp:80,base:{xp:80},lecciones:{},extra:{}};
  if(xpDe(S.fusionarProgreso(L1,L2,{yo:'A',el:'B'}),'matematicas')!==100)mal(es,'la XP de antes de v11 no se combina con el máximo');
  // racha: unión de los días cumplidos en cualquiera
  const R1=vacioP(),R2=vacioP();R1.dias[f(1)]={ej:10,seg:0,xp:0,ok:true};R1.dias[f(3)]={ej:10,seg:0,xp:0,ok:true};R2.dias[f(2)]={ej:10,seg:0,xp:0,ok:true};R2.dias[f(0)]={ej:4,seg:0,xp:0,ok:false};R1.dias[f(0)]={ej:6,seg:0,xp:0,ok:false};
  const RR=S.fusionarProgreso(R1,S.marcarAportes(R2,'B'),{yo:'A',el:'B'});
  if(P.racha(RR)!==4||RR.mejorRacha<4)mal(es,`la racha no sale de la unión de los días (${P.racha(RR)}; se esperaba 4: 6+4 ejercicios hoy cumplen la meta)`);
  // repaso: gana el más reciente; habilidades: dominada en cualquiera, días unidos
  const H1=vacioP(),H2=vacioP();
  H1.repaso.x={rep:3,int:6,ef:2.5,proxima:sumar(f(0),2),fallos:1};H2.repaso.x={rep:1,int:1,ef:2.3,proxima:sumar(f(0),1),fallos:2};
  H1.materias.matematicas={xp:0,lecciones:{a:{dominada:false,mejor:0.5,dias:[f(5)],ult:[0,0],rating:2,sesiones:1}},extra:{jefes:{t:{mejor:0.7,fecha:f(5)}}}};
  H2.materias.matematicas={xp:0,lecciones:{a:{dominada:true,mejor:0.9,dias:[f(1)],ult:[1,1],rating:4,sesiones:3}},extra:{jefes:{t:{mejor:0.9,fecha:f(1)}}}};
  const HH=S.fusionarProgreso(H1,H2,{yo:'A',el:'B'}),ha=HH.materias.matematicas.lecciones.a;
  if(HH.repaso.x.rep!==1||HH.repaso.x.fallos!==2)mal(es,'en el repaso no gana la respuesta más reciente');
  if(!ha.dominada||ha.rating!==4||ha.dias.length!==2||ha.mejor!==0.9||HH.materias.matematicas.extra.jefes.t.mejor!==0.9)mal(es,'una habilidad pierde su dominio, sus días o lo de extra');
  // notas: la edición más nueva gana; una lápida solo borra si es más nueva que la última edición
  const nA=[{id:'n1',editada:100,titulo:'vieja'},{id:'n2',editada:100}],nB=[{id:'n1',editada:200,titulo:'nueva'},{id:'n3',editada:300}];
  const NN=S.fusionarNotas(nA,nB,{n2:150,n3:250});
  if(NN.find(n=>n.id==='n1')?.titulo!=='nueva'||NN.some(n=>n.id==='n2')||!NN.some(n=>n.id==='n3'))mal(es,'las notas no se combinan por fecha de edición y lápidas');
  // las tarjetas de una nota borrada aquí no regresan desde el otro dispositivo
  const T1=vacioP(),T2=vacioP();T2.tarjetas.k={q:'q',a:'a',nota:'n2',materia:null,fecha:f(0)};T2.repaso['notas/t/k']={rep:0,int:1,ef:2.5,proxima:f(0),fallos:0};
  const TT=S.fusionarProgreso(T1,T2,{yo:'A',el:'B',borradas:{n2:1}});
  if(TT.tarjetas.k||TT.repaso['notas/t/k'])mal(es,'regresan las tarjetas de una nota borrada');
  console.log('combinar dispositivos: XP y ejercicios exactos (sin duplicar al repetir), racha de la unión, repaso más reciente, habilidades y notas con lápidas');
  // Sincronización con Supabase: motor real con dos teléfonos y un servidor simulado; RLS de sync.sql en un Postgres de verdad
  const {probarSync}=await import(pathToFileURL(join(raiz,'..','..','scripts','sync-pruebas.mjs')).href);
  for(const x of await probarSync(join(raiz,'..')))mal('sincronizar',x);
  const {probarRLS}=await import(pathToFileURL(join(raiz,'..','..','scripts','rls.mjs')).href);
  for(const x of await probarRLS(join(raiz,'..','..','supabase','sync.sql')))mal('supabase/sync.sql (RLS)',x);
  console.log('sincronizar: dos teléfonos convergen (XP exacta, notas, fotos, materias, lápidas, carreras, sin conexión); RLS probado en Postgres: nadie ve ni toca lo de otra persona');
}
sinGenerador.forEach(x=>mal('habilidad sin generador ni banco',x));
// Generadores: 200 ejercicios por nivel sin errores, cuya respuesta pasa su propio verificar, con fórmulas válidas y sin repetirse demasiado
{
  const {crear}=await import(pathToFileURL(join(raiz,'..','nucleo','generadores','index.js')).href);
  const {PROFUNDIDADES,PROFUNDIDAD}=await import(pathToFileURL(join(raiz,'..','nucleo','generadores','profundidad.js')).href);
  for(const id of Object.keys(GENERADORES))if(!PROFUNDIDAD[id]&&!GENERADORES[id].profundidad)mal(`generador ${id}`,'falta su profundidad en generadores/profundidad.js');
  const katex=(await import(pathToFileURL(join(raiz,'..','..','node_modules','katex','dist','katex.mjs')).href)).default;
  const formulas=t=>[...String(t).matchAll(/\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g)].map(m=>m[1]||m[2]);
  let total=0;const sinPlantillas=new Set();
  for(const id of Object.keys(GENERADORES)){
    for(let n=1;n<=5;n++){
      const claves=new Set(),plantillas=new Set(),dg=`generador ${id} nivel ${n}`;let primero='';
      for(let i=0;i<200;i++){
        let p;try{p=crear(id,n,{semilla:i*7919+n})}catch(e){mal(dg,`falla al generar: ${e.message}`);break}
        total++;claves.add(p.clave);const t=p.tipo||'escribir';
        const ok=t==='opcion'?p.opciones?.[p.correcta]!==undefined:t==='emparejar'?p.pares?.length>=3:t==='ordenar'?p.verificar(p.respuesta):p.verificar(p.forma?p.celdas:p.respuesta);
        if(!ok&&!primero)primero=`su respuesta no pasa su verificar: ${String(p.enunciado).slice(0,80)} → ${p.respuesta}`;
        if(!p.regla&&!primero)primero='falta la regla';
        if(!PROFUNDIDADES.includes(p.profundidad)&&!primero)primero=`sin nivel de profundidad válido (${p.profundidad}): agrégalo en generadores/profundidad.js`;
        // segundo cálculo independiente (sustituir la solución, probar puntos…)
        if(p.comprobar){let ok=false;try{ok=p.comprobar()}catch(e){}if(!ok&&!primero)primero=`la comprobación independiente falla: ${String(p.enunciado).slice(0,80)} → ${p.respuesta}`}
        if(p.plantilla)plantillas.add(p.plantilla);
        // Procedimiento: pasos {que, como, porque}; el último con res, que da la respuesta
        const ps=p.pasos||[],ult=ps.at(-1),plano=x=>String(x??'').replace(/<[^>]+>/g,'').trim().toLowerCase();
        if(!(ps.length>=2&&ps.every(x=>x&&typeof x==='object'&&x.que&&x.como&&x.porque))&&!primero)primero='los pasos deben ser ≥ 2 objetos {que, como, porque}';
        else if(ult?.res===undefined||!(t==='escribir'&&!p.forma?p.verificar(ult.res):t==='escribir'?String(ult.res).length>0:plano(ult.res)===plano(p.respuesta)))if(!primero)primero=`el último paso no da la respuesta (res=${ult?.res}, respuesta=${p.respuesta})`;
        if(!GENERADORES[id].alternativa&&!primero)primero='falta la explicación alternativa (No entendí)';
        if(!primero){const m=[p.enunciado,...(p.opciones||[])].map(x=>malLimite(x,true)).find(Boolean)||[...ps.flatMap(x=>[x.que,x.como,x.porque,x.ojo]),p.regla,p.pista,p.explicacion,p.pasoMal?.texto].map(x=>malLimite(x)).find(Boolean);if(m)primero=m;if(/\\lim(?![a-zA-Z])|l[ií]m\s*\(/.test(JSON.stringify([p.enunciado,ps])))limitesRevisados++}
        for(const x of [p.enunciado,p.respuesta,...ps.flatMap(x=>[x.que,x.como,x.porque,x.ojo]),p.regla,p.pista,p.explicacion,...(p.errores||[]).map(e=>e.por),p.pasoMal?.texto,...(p.opciones||[])].filter(Boolean))
          for(const fx of formulas(x))try{katex.renderToString(fx,{throwOnError:true,strict:false,trust:c=>c.command==='\\htmlClass',macros:{'\\cambio':'\\htmlClass{cambio}{#1}'}})}catch(e){if(!primero)primero=`fórmula inválida: ${fx.slice(0,60)}`}
      }
      if(primero)mal(dg,primero);
      if(claves.size<8)mal(dg,`solo ${claves.size} ejercicios distintos en 200 (mínimo 8, una sesión entera)`);
      // Matemáticas: al menos 3 plantillas por nivel (aviso mientras se completan las habilidades viejas)
      if(/^(alg|al|cd|ci|tri|pre|apl)\//.test(id)&&plantillas.size<3)sinPlantillas.add(id);
    }
  }
  for(const [id,f] of Object.entries(BANCOS)){const l=f();if(!l.length||l.some(x=>!x.ref||!x.regla))mal(`banco ${id}`,'vacío o con ejercicios sin ref o sin regla')}
  if(sinPlantillas.size)avisos.push(`generadores de Matemáticas con menos de 3 plantillas por nivel: ${[...sinPlantillas].join(', ')}`);
  console.log(`generadores: ${Object.keys(GENERADORES).length} · ${total} ejercicios generados y verificados · ${Object.keys(BANCOS).length} bancos`);
  console.log(`límites: ${limitesRevisados} ejercicios con límites, todos con el subíndice abajo y sin «→→»`);
}
// Definición de terminado (nucleo/terminado.js): estado de cada habilidad, tema y materia → src/contenido/estado.json (lo lee
// la app) y src/contenido/PLAN.md (el árbol con referencias, estado y cobertura; se genera aquí). Falla si una habilidad
// marcada completa:true en temas.js no cumple los 10 puntos, y valida los retos.
{
  const imp=r=>import(pathToFileURL(join(raiz,'..',...r.split('/'))).href);
  const {RETOS}=await imp('nucleo/retos.js'),{crearRng}=await imp('nucleo/rng.js'),T=await imp('nucleo/terminado.js');
  const {PROFUNDIDADES}=await imp('nucleo/generadores/profundidad.js');
  const idsRetos=new Set();let nRetos=0;
  for(const r of RETOS){
    const dr=`reto ${r.id}`;
    if(idsRetos.has(r.id))mal(dr,'id repetido');idsRetos.add(r.id);
    if(!['aplicacion','escenario'].includes(r.profundidad))mal(dr,'profundidad debe ser aplicacion o escenario');
    if(!(r.dificultad>=1&&r.dificultad<=5))mal(dr,'dificultad de 1 a 5');
    if(!r.titulo||!r.desc)mal(dr,'falta titulo o desc');
    if(r.crear)for(let i=0;i<20;i++){let l;try{l=r.crear(crearRng(i*977+1))}catch(e){mal(dr,`falla al crear: ${e.message}`);break}
      if(!l?.length){mal(dr,'no genera preguntas');break}
      const malas=l.filter(q=>!q||!q.regla||(q.verificar&&(q.tipo||'escribir')==='escribir'&&!q.forma&&!q.verificar(q.respuesta))||(q.comprobar&&!q.comprobar()));
      if(malas.length){mal(dr,'genera preguntas sin regla o cuya respuesta no pasa su verificar');break}
      nRetos+=l.length}
  }
  const retosGen=T.retosPorGenerador(RETOS);
  const NOMBRES={ciberseguridad:'💼 Curso · 🛡️ Ciberseguridad',excel:'💼 Curso · 📊 Excel',python:'💼 Curso · 🐍 Python (PCEP y básico de PCAP)',ingles:'🇺🇸 Inglés (MCER A1→B2, método de Nation)',matematicas:'➗ Matemáticas',['ciencia-datos']:'📊 Ciencia de datos'};
  const ORDEN=['matematicas','ingles','ciberseguridad','excel','python','ciencia-datos'];
  const estado={generado:new Date().toISOString().slice(0,10),materias:{}};
  const bt='`';
  let plan=['# Plan de contenido','','Árbol completo del contenido (temarios de referencia en la Parte 2 del estándar). **Se genera con `npm run revisar`** a partir de cada',
    '`src/materias/<materia>/temas.js` y de la «Definición de terminado» (`src/nucleo/terminado.js`); no lo edites a mano.','',
    'Organización de Aprender: 🎓 Mis materias · 📘 Estudio (Inglés, Matemáticas, Ciencia de datos, Lectura) · 💼 Cursos (Ciberseguridad, Excel y los que ganen en 🗳️ Propuestas).','',
    '- `- [x] ✅ Título `id` — referencia` → habilidad completa (cumple los 10 puntos) · `🟡` → existe pero le falta algo (se indica qué).',
    '- `- [ ] Título — referencia` → pendiente (en la app: ⚪ Próximamente). `- 🔧 Título → ruta` → herramienta.',
    '- Habilidad ✅: objetivo y referencia, explicación (idea, analogía, regla), 2 ejemplos resueltos (básico y tipo examen), ejemplo con huecos,',
    '  generador de 5 niveles con ≥ 3 plantillas por nivel, ≥ 3 errores típicos, ≥ 2 aplicaciones, explicación alternativa, ≥ 3 tarjetas y profundidades.',
    '- Tema ✅: todo ✅, sin pendientes, escenario integrador, simulacro de 10–15 preguntas, resumen (hoja del tema) y 1–3 referencias.',
    '- Materia ✅: todos sus temas ✅, examen final acumulativo y certificado interno (sin valor oficial).',''];
  const resumen=[];
  for(const materia of ORDEN){
    const fTemas=join(raiz,materia,'temas.js');if(!existsSync(fTemas))continue;
    const defs=(await import(pathToFileURL(fTemas).href)).default,dirTemas=join(raiz,materia,'temas');
    const em={estado:'parcial',cobertura:{completas:0,total:0,pct:0},temas:{},habilidades:{}};
    const lineasM=[];
    for(const t of defs){
      const dir=join(dirTemas,t.id),archivos=existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith('.js')):[];
      const habs=[];const lineasT=[];
      for(const n of t.nodos){
        if(n.ir){lineasT.push(`- 🔧 ${n.titulo} → ${bt}${n.ir}${bt}`);continue}
        if(n.proximo){lineasT.push(`- [ ] ${n.titulo}${n.ref?` — ${n.ref}`:''}`);continue}
        const f=archivos.find(f=>f.replace(/^\d+-/,'').replace(/\.js$/,'')===n.id),l=f?(await import(pathToFileURL(join(dir,f)).href)).default:{};
        for(const ej of (l.rondas||[]).flat())if(ej.profundidad&&!PROFUNDIDADES.includes(ej.profundidad))mal(`${materia}/${n.id}`,`profundidad inválida: ${ej.profundidad}`);
        const h={...l,...n,titulo:n.titulo||l.titulo||n.id};
        if(!n.ref)mal(`${materia}/${n.id}`,'falta ref (referencia al temario) en temas.js');
        const r=T.revisarHabilidad(h,retosGen);habs.push(r);
        if(n.completa&&!r.completa)mal(`${materia}/${n.id}`,`está marcada como completa pero le falta: ${r.faltan.join(', ')}`);
        em.habilidades[n.id]={estado:r.completa?'completa':'parcial',faltan:r.faltan};
        lineasT.push(`- [x] ${r.completa?'✅':'🟡'} ${h.titulo} ${bt}${n.id}${bt}${n.ref?` — ${n.ref}`:''}${r.completa?'':` · falta: ${r.faltan.join(', ')}`}`);
      }
      const retosT=RETOS.filter(r=>r.materia===materia&&r.tema===t.id),sim=retosT.find(r=>r.simulacro);
      let nSim=0;if(sim?.crear)try{nSim=sim.crear(crearRng(5)).filter(Boolean).length}catch(e){}
      const rt=T.revisarTema(t,habs,retosT,nSim);
      em.temas[t.id]={estado:rt.estado,completas:rt.completas,total:rt.total,faltan:rt.faltan};
      if(rt.estado!=='herramientas'){em.cobertura.completas+=rt.completas;em.cobertura.total+=rt.total}
      const ic={completo:'✅',parcial:'🟡',proximo:'⚪',herramientas:'🔧'}[rt.estado];
      lineasM.push('',`### ${ic} ${t.titulo} ${bt}${t.id}${bt}`,'',`${rt.completas}/${rt.total} habilidades ✅${rt.faltan.length?` · falta: ${rt.faltan.join(' · ')}`:''}`,'',...lineasT);
      if(t.referencias?.length)lineasM.push('',`📚 Para profundizar: ${t.referencias.join(' · ')}`);
    }
    const c=em.cobertura;c.pct=c.total?Math.round(c.completas/c.total*100):0;
    const temasEval=Object.values(em.temas).filter(x=>x.estado!=='herramientas');
    em.estado=temasEval.length&&temasEval.every(x=>x.estado==='completo')?'completo':c.completas?'parcial':'parcial';
    estado.materias[materia]=em;
    plan.push(`## ${em.estado==='completo'?'✅':'🟡'} ${NOMBRES[materia]||materia} ${bt}${materia}${bt}`,'',`**Cobertura del temario: ${c.pct} %** (${c.completas} de ${c.total} habilidades ✅)`,...lineasM,'');
    resumen.push(`${materia} ${c.pct}% (${c.completas}/${c.total})`);
  }
  {const {LIBROS}=await import(pathToFileURL(join(raiz,'lectura','catalogo.js')).href);
   plan.push('## 📚 Lectura `lectura`','',`${LIBROS.length} libros libres (scripts/libros.mjs → public/libros/): ${LIBROS.map(l=>`${l.titulo} (${l.licencia}, ${l.capitulos.length} capítulos)`).join(' · ')}.`,'');}
  for(const r of RETOS){const defs=existsSync(join(raiz,r.materia,'temas.js'))?(await import(pathToFileURL(join(raiz,r.materia,'temas.js')).href)).default:[];
    if(!defs.some(t=>t.id===r.tema))mal(`reto ${r.id}`,`el tema ${r.materia}/${r.tema} no existe`)}
  writeFileSync(join(raiz,'..','contenido','estado.json'),JSON.stringify(estado,null,1)+'\n');
  writeFileSync(join(raiz,'..','contenido','PLAN.md'),plan.join('\n'));
  console.log(`terminado: cobertura ${resumen.join(' · ')} · ${RETOS.length} retos (${nRetos} preguntas verificadas) → estado.json y PLAN.md`);
}
// Mis materias: esquema, lector de temarios, emparejamiento, plan (nunca un tema después de su examen) y bancos generados (fixtures, sin API)
{
  const imp=r=>import(pathToFileURL(join(raiz,'..',...r.split('/'))).href);
  const E=await imp('nucleo/mias/esquema.js'),T=await imp('nucleo/mias/temario.js'),EM=await imp('nucleo/mias/emparejar.js'),PL=await imp('nucleo/mias/plan.js');
  const F=await import(pathToFileURL(join(raiz,'..','..','scripts','fixtures','bancos.mjs')).href),e='mis materias';
  for(const [k,b] of Object.entries(F.VALIDOS)){const v=E.validarBanco(b);if(!v.ok||v.banco.ejercicios.length!==b.ejercicios.length)mal(e,`el banco de ejemplo «${k}» no pasa: ${v.errores.slice(0,2).join('; ')}`)}
  const inv=E.validarBanco(F.invalido);if(inv.ok||!inv.errores.some(x=>/sería correcto/.test(x))||!inv.errores.some(x=>/opción correcta/.test(x)))mal(e,'el validador no rechaza el banco inválido');
  // lector de temarios
  const l=T.leerTemario('Unidad 1: Límites\n1.1 Definición\n1.2 Laterales\nUnidad 2. Derivadas\n2.1 Regla de la cadena\n  a) Derivación implícita');
  if(l.length!==2||l[0].temas.length!==2||l[1].temas[0].subtemas[0]!=='Derivación implícita')mal(e,'el lector de temarios no reconoce «Unidad N» con «N.M» y letras');
  if(T.leerTemario('- A\n- B\n- C')[0]?.temas.length!==3||T.leerTemario('1. X\n1.1 Y\n2. Z')[1]?.titulo!=='Z')mal(e,'el lector de temarios no reconoce viñetas o numeración de dos niveles');
  // emparejamiento con el catálogo (de los temas.js de cada materia, con el título de cada lección como lo ve la app)
  const cat=[];for(const m of ['ciberseguridad','excel','python','ingles','matematicas','ciencia-datos']){const t=(await import(pathToFileURL(join(raiz,m,'temas.js')).href)).default;
    for(const x of t)for(const n of x.nodos.filter(n=>n.id)){let tit=n.titulo;
      if(!tit){const d=join(raiz,m,'temas',x.id),a=existsSync(d)&&readdirSync(d).find(z=>z.replace(/^d+-/,'').replace(/.js$/,'')===n.id);if(a)tit=(readFileSync(join(d,a),'utf8').match(/titulo:s*['"`]([^'"`]*)/)||[])[1]}
      cat.push({materia:m,id:n.id,titulo:tit||n.id.replace(/-/g,' '),tema:x.titulo,temaId:x.id,materiaNombre:m})}}
  // ninguna lección sin sinónimos, y ningún sinónimo de una lección que no existe
  for(const h of cat)if(!EM.SINONIMOS[`${h.materia}/${h.id}`]?.length)mal(e,`la lección ${h.materia}/${h.id} no tiene sinónimos en mias/sinonimos.js (los temarios no la encontrarán)`);
  for(const k of Object.keys(EM.SINONIMOS))if(!cat.some(h=>`${h.materia}/${h.id}`===k))mal(e,`sinónimos de una habilidad que no existe: ${k}`);
  for(const [k,l] of Object.entries(EM.SINONIMOS))for(const x of l)if(!EM.palabras(x).length)mal(e,`el sinónimo «${x}» de ${k} se queda sin palabras (solo palabras vacías o números)`);
  // singular y plural, numeración de temarios
  for(const [a,b] of [['matrices','matriz'],['límites','límite'],['binomios','binomio'],['ecuaciones','ecuación'],['vectores','vector'],['leyes','ley']])if(EM.palabras(a).join()!==EM.palabras(b).join())mal(e,`«${a}» y «${b}» deberían ser la misma palabra`);
  for(const q of ['1.3 Binomios.','Tema 4: binomios','U2 – Binomios (parte 1)'])if(EM.palabras(q).join()!=='binomio')mal(e,`«${q}» debería quedar como «binomio» (dio ${EM.palabras(q)})`);
  // tabla de temas reales: ≥ 95 % encuentran su práctica (sola o entre las opciones de «¿Es alguno de estos?»)
  const TT=await import(pathToFileURL(join(raiz,'..','..','scripts','fixtures','temas-temario.mjs')).href);
  let encontrados=0,solos=0;const fallan=[];
  for(const [q,ctx,esp] of TT.TEMAS){const es=[].concat(esp),r=EM.emparejar(q,cat,{contexto:ctx});
    const ok=r&&(r.seguro?es.includes(r.id):r.opciones.some(o=>es.includes(o.id)));if(ok)encontrados++;else fallan.push(`«${q}» → ${r?r.opciones.map(o=>o.id).join(', '):'nada'} (esperado ${es})`);if(ok&&r.seguro)solos++}
  if(TT.TEMAS.length<80)mal(e,`la tabla de temas reales debe tener al menos 80 (tiene ${TT.TEMAS.length})`);
  if(encontrados/TT.TEMAS.length<.95)mal(e,`solo ${encontrados}/${TT.TEMAS.length} temas reales encuentran su práctica (mínimo 95 %): ${fallan.slice(0,5).join('; ')}`);
  for(const [q,ctx] of TT.SIN_PRACTICA)if(EM.emparejar(q,cat,{contexto:ctx}))mal(e,`«${q}» no debería emparejar con nada (dio ${EM.emparejar(q,cat,{contexto:ctx}).id})`);
  {const r=EM.emparejar('binomios',cat,{contexto:'Derivadas'}),ids=r?.opciones.map(o=>o.id)||[];
    if(!r||r.seguro||!ids.includes('regla-cadena')||!ids.includes('productos-notables'))mal(e,`«binomios» en Derivadas debería dudar entre la regla de la cadena y productos notables (dio ${ids})`);}
  for(const [q,esperado] of [['Producto escalar','producto-punto'],['Subnetting','subredes-cidr'],['Derivación implícita','derivacion-implicita'],['Media, mediana y moda','tendencia-central'],['Past simple','pasado-simple'],['Teorema del binomio','binomio-newton']])
    if(EM.emparejar(q,cat)?.id!==esperado)mal(e,`«${q}» debería emparejar con ${esperado} (dio ${EM.emparejar(q,cat)?.id})`);
  {const b=EM.buscar('binom',cat).map(h=>h.id);if(!b.includes('productos-notables')||!b.includes('binomio-newton'))mal(e,`buscar «binom» debería mostrar Productos notables y Binomio de Newton (dio ${b.slice(0,5)})`)}
  const emparejo=`emparejamiento ${Math.round(encontrados/TT.TEMAS.length*100)} % de ${TT.TEMAS.length} temas reales (${solos} solos), ${cat.length} lecciones con sinónimos`;
  // una materia de ejemplo pasa el esquema; el plan con fechas al azar nunca pone un tema el día de su examen o después
  let s=1;const azar=()=>(s=(s*16807)%2147483647)/2147483647,ent=(a,b)=>a+Math.floor(azar()*(b-a+1));
  const hoy='2026-03-02';let planes=0;
  for(let k=0;k<300;k++){
    const nu=ent(1,4),unidades=Array.from({length:nu},(_,i)=>({id:`u-${i}aa`,titulo:`U${i}`,temas:Array.from({length:ent(1,6)},(_,j)=>({id:`t-${i}${j}aa`,titulo:`T${i}.${j}`,subtemas:[],sabe:azar()<.1,dificil:azar()<.2,habilidad:null,emparejado:'ninguno'}))}));
    const nx=ent(1,3),fechas=Array.from({length:nx},()=>PL.sumar(hoy,ent(0,45))).sort();
    const m={formato:1,id:'mp-prueba'+k,nombre:'Prueba',color:'#4652d0',icono:'📘',unidades,disponibilidad:{dias:[...new Set(Array.from({length:ent(1,7)},()=>ent(0,6)))],minutos:[10,20,30,60][ent(0,3)]},
      examenes:fechas.map((f,i)=>({id:`x-${i}aa`,nombre:`E${i}`,fecha:f,unidades:unidades.filter(()=>azar()<.7).map(u=>u.id).concat(unidades[i%nu].id).filter((x,j,a)=>a.indexOf(x)===j)})),
      avisos:false,fotos:[],referencias:[],simulacros:[],reportados:{},creada:0,editada:0};
    if(k===0){const ev=E.validarMateria(m);if(ev.length)mal(e,'una materia de ejemplo no pasa el esquema: '+ev[0])}
    const plan=PL.planificar(m,{hoy,dominio:t=>azar()<.2?.9:0}),errs=PL.comprobarPlan(m,plan);planes++;
    if(errs.length){mal(e,`plan ${k}: ${errs[0]}`);break}
  }
  const mInv={formato:1,id:'x',nombre:'',color:'rojo',icono:'',unidades:[],examenes:[{id:'x-1aa',nombre:'E',fecha:'mañana',unidades:['u-no']}],disponibilidad:{dias:[9],minutos:1},fotos:[],referencias:[],simulacros:[],reportados:{}};
  if(E.validarMateria(mInv).length<5)mal(e,'el esquema no rechaza una materia inválida');
  {const t={id:'t-abc',titulo:'T',subtemas:[],sabe:false,dificil:false,habilidad:null,emparejado:'manual',practicas:[1,2,3,4].map(i=>({materia:'matematicas',id:'x'+i}))};
    if(!E.validarMateria({formato:1,id:'mp-abcd',nombre:'X',color:'#4652d0',icono:'📘',unidades:[{id:'u-abc',titulo:'U',temas:[t]}],examenes:[],disponibilidad:{dias:[1],minutos:30},fotos:[],referencias:[],simulacros:[],reportados:{}}).some(x=>/prácticas/.test(x)))mal(e,'el esquema acepta más de 3 prácticas por tema');}
  console.log(`mis materias: 3 bancos de ejemplo válidos, el inválido rechazado, lector, ${emparejo}, ${planes} planes al azar sin temas fuera de plazo`);
}
// Racha: hoy sin cumplir sigue viva desde ayer; hoy con la meta cumplida suma aunque falte la marca 'ok'
{
  const P=await import(pathToFileURL(join(raiz,'..','nucleo','progreso.js')).href),e='racha';
  const h=P.hoy(),ay=P.sumarDias(h,-1),an=P.sumarDias(h,-2),base={v:8,meta:{tipo:'ejercicios',cantidad:10},mejorRacha:0,materias:{},repaso:{},notas:{},tarjetas:{},frases:{},historial:[]};
  const r=dias=>P.racha({...base,dias});
  if(r({[an]:{ok:true},[ay]:{ok:true},[h]:{ej:3,ok:false}})!==2)mal(e,'hoy sin cumplir debería mantener la racha de ayer');
  if(r({[ay]:{ok:true},[h]:{ej:12,seg:0,ok:false}})!==2)mal(e,'hoy con la meta cumplida (sin la marca) debería sumar');
  if(r({[ay]:{ok:true},[h]:{ej:12,ok:true}})!==2||r({[an]:{ok:true},[h]:{ej:1}})!==0)mal(e,'cuenta mal los días seguidos');
  console.log('racha: se calcula bien con y sin la meta de hoy');
}
// Cuaderno: el formato de las notas escapa el HTML del usuario, solo enlaza a la app o a https y lee bien las tarjetas
{
  const F=await import(pathToFileURL(join(raiz,'..','nucleo','cuaderno','formato.js')).href),e='formato de notas';
  const h=F.render('<img src=x onerror=alert(1)> **a** [x](javascript:alert(1)) [ok](#repaso)\n🃏 ¿P? | R\n- [ ] c');
  if(/<img src=x|<[^>]*\sonerror=|href="javascript/i.test(h))mal(e,'deja pasar HTML o enlaces peligrosos');
  if(!h.includes('<b>a</b>')||!h.includes('data-go="repaso"')||!h.includes('data-casilla="2"'))mal(e,'no da formato (negrita, enlace o casilla)');
  if(JSON.stringify(F.tarjetasDe('🃏 ¿P? | R\n🃏 sin respuesta'))!=='[{"q":"¿P?","a":"R"}]')mal(e,'lee mal las tarjetas');
  if(F.deHtml('<b>x</b> \\(\\cambio{\\dfrac{1}{2}}\\)')!=='**x** $\\dfrac{1}{2}$')mal(e,'convierte mal un paso a texto de nota');
  console.log('cuaderno: el formato de las notas es seguro y lee las tarjetas');
  // Editor por bloques: las notas de siempre se parten y se vuelven a unir sin perder nada y se ven igual
  const viejas=['## Resumen\nLínea $x^2$\n**negrita**\n![foto](img:a1)\n- [ ] c\n- [x] d\n🃏 ¿P? | R\nfoto en renglón ![foto](img:a1) igual',
    'Uno\n\n\nDos\n```\ncódigo\n\n con línea vacía\n```\n$$\n\\frac{a}{b}\n$$\n![Mi pie](img:b2)\n$$x$$','',' \n','Solo texto'];
  // (el número de renglón de las casillas cambia al separar bloques; en el editor cada bloque lleva su cuenta)
  const sinVacias=h=>String(h).replace(/data-casilla="\d+"/g,'').split('\n').filter(Boolean).join('\n'),tx={tex:(f,b)=>`[${b?'B':'L'}:${f}]`};
  for(const v of viejas){const bs=F.bloques(v),u=F.unirBloques(bs);
    if(sinVacias(F.render(u,tx))!==sinVacias(F.render(v,tx)))mal(e,`una nota vieja se ve distinto al pasar por bloques: ${JSON.stringify(v.slice(0,30))}`);
    if(JSON.stringify(F.bloques(u))!==JSON.stringify(bs))mal(e,'partir y unir bloques no da lo mismo');
    for(const id of F.imagenesDe(v))if(!F.imagenesDe(u).includes(id))mal(e,'al unir bloques se pierde una imagen');
    if(F.tarjetasDe(u).length!==F.tarjetasDe(v).length)mal(e,'al unir bloques se pierde una tarjeta');}
  const bs=F.bloques(viejas[1]);
  if(bs.map(b=>b.tipo).join()!=='texto,texto,formula,imagen,formula')mal(e,`tipos de bloque: ${bs.map(b=>b.tipo)}`);
  if(!F.render('$$\\frac{a}{b}$$',tx).includes('[B:\\frac{a}{b}]')||!F.render('![Mi pie](img:b2)').includes('<figcaption>Mi pie</figcaption>')||F.render('![foto](img:b2)').includes('figcaption'))mal(e,'fórmula en bloque o pie de foto');
  if(F.formulaCorta('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')!=='x = (-b ± √(b²-4ac))/2a'||F.vistaPrevia('**a** $x^2$ ![f](img:z)\n🃏 q | r')!=='a x² q | r')mal(e,'vista previa de la lista (fórmulas como texto corto)');
  console.log('cuaderno: los bloques del editor conservan las notas viejas (imágenes, tarjetas, código, fórmulas)');
}
// Dibujos del cuaderno (PROMPT-DIBUJO): migración del formato viejo, historial, formas, borradores, lazo y transformar
{
  const M=await import(pathToFileURL(join(raiz,'..','nucleo','dibujo','modelo.js')).href),e='dibujos';
  const linea=(x0,y0,x1,y1,n=20)=>Array.from({length:n+1},(_,i)=>[x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,.5]);
  // v1 (PROMPT-NOTAS): trazos en px CSS; la goma pintaba con el color del papel → ahora recorta el trazo
  const viejo={id:'d1',tipo:'image/png',ancho:945,alto:630,trazos:[{herr:'lapiz',color:null,ancho:3.5,pen:false,puntos:linea(20,100,320,100)},
    {herr:'lapiz',color:'#dc2626',ancho:2,pen:true,puntos:linea(20,200,300,220).map((p,i)=>[p[0],p[1],.2+i/40])},
    {herr:'borrar',color:null,ancho:3,pen:false,puntos:[[170,60,.5],[170,140,.5]]}]};
  const d=M.migrarDibujo(viejo),tr=d.objetos.filter(o=>o.t==='trazo');
  if(d.v!==2||tr.length!==3)mal(e,`migrar v1: ${tr.length} trazos (se esperaban 3: la línea partida por la goma y el trazo rojo)`);
  if(d.ancho!==360||d.alto!==240)mal(e,`migrar v1: el tamaño de la hoja (${d.ancho}×${d.alto}) no es el de entonces (360×240)`);
  const rojo=tr.find(o=>o.color==='#dc2626');if(!rojo?.vari||rojo.pts.length!==21||rojo.pts[5][2]!==viejo.trazos[1].puntos[5][2])mal(e,'migrar v1: el trazo con presión del S Pen cambia');
  if(tr.filter(o=>o.color===M.TINTA).some(o=>o.pts.some(p=>Math.abs(p[0]-170)<9)))mal(e,'migrar v1: la goma vieja no recorta lo que tapaba');
  if(M.migrarDibujo({id:'x',blob:{}}).objetos.length!==0||M.migrarDibujo(null).v!==2)mal(e,'migrar un dibujo sin trazos (solo PNG)');
  const otra=M.migrarDibujo({dibujo:JSON.parse(JSON.stringify(M.paraGuardar(d)))});
  if(JSON.stringify(otra.objetos)!==JSON.stringify(d.objetos))mal(e,'guardar y volver a leer un dibujo v2 cambia sus objetos');
  if(M.normalizarDibujo({objetos:[{t:'trazo',id:'a',ancho:2,pts:[[1,'x']]},{t:'imagen',id:'b'},{t:'texto',id:'c',x:1,y:2,tam:20,texto:'hola'}]}).objetos.length!==1)mal(e,'normalizar no descarta objetos inválidos');
  // historial: diferencia ↔ aplicar ida y vuelta
  const A=d.objetos,B=[...A.slice(1),{t:'texto',id:'t9',x:0,y:0,tam:20,texto:'x'}];B.splice(1,0,M.transformar(A[0],M.mMover(5,5)));
  const op=M.diferencia(A,B);
  if(JSON.stringify(M.aplicarOp(A,op))!==JSON.stringify(B)||JSON.stringify(M.aplicarOp(B,op,true))!==JSON.stringify(A))mal(e,'historial: deshacer y rehacer no devuelven lo mismo');
  // formas inteligentes
  const temblor=linea(0,0,200,30,40).map((p,i)=>[p[0],p[1]+Math.sin(i*1.7)*2,.5]),circ=Array.from({length:60},(_,i)=>{const a=i/59*Math.PI*2;return [100+50*Math.cos(a)+Math.sin(i)*2,100+50*Math.sin(a),.5]});
  const cuad=[[0,0],[120,0],[120,120],[0,120],[0,1]].flatMap((q,i,l)=>i?linea(l[i-1][0],l[i-1][1],q[0],q[1],15).slice(1):[]);
  const fl=[...linea(0,50,180,50,30),...linea(180,50,165,38,4).slice(1)];
  const f1=M.reconocerForma(temblor),f2=M.reconocerForma(circ),f3=M.reconocerForma(cuad),f4=M.reconocerForma(fl);
  if(f1?.forma!=='linea'||f1.pts.length!==2||f2?.forma!=='circulo'||f3?.forma!=='rectangulo'||f4?.forma!=='flecha')mal(e,`formas inteligentes: ${[f1,f2,f3,f4].map(f=>f?.forma)}`);
  if(M.reconocerForma(Array.from({length:40},(_,i)=>[i*5,Math.sin(i/3)*40,.5])))mal(e,'formas inteligentes: una curva libre se convierte en forma');
  for(const [id] of M.FORMAS){const o=M.formaDirecta(id,[10,10],[300,220]);if(!o.length||o.some(x=>!x.g)||new Set(o.map(x=>x.g)).size!==1)mal(e,`forma «${id}» sin piezas o sin grupo`)}
  for(const [id] of M.PLANTILLAS)if(M.normalizarDibujo({objetos:M.plantilla(id).objetos}).objetos.length!==M.plantilla(id).objetos.length)mal(e,`plantilla «${id}» con objetos inválidos`);
  // goma de precisión: parte un trazo; lazo y transformar
  const t0={t:'trazo',id:'q',herr:'pluma',tipo:'boli',color:'#000',ancho:2,pts:linea(0,0,200,0,4)};
  const piezas=M.recortarTrazo(t0,[[100,-20],[100,20]],6);if(piezas?.length!==2||M.recortarTrazo(t0,[[100,40],[120,40]],6)!==null)mal(e,'goma de precisión: no parte el trazo en dos o toca lo que no debe');
  if(!M.enLazo([t0],[[-10,-10],[210,-10],[210,10],[-10,10]]).has('q')||M.enLazo([t0],[[-10,-10],[50,-10],[50,10],[-10,10]]).has('q'))mal(e,'lazo: selecciona mal');
  const g2=M.transformar(t0,M.mEscalar(2,0,0));if(g2.pts[4][0]!==400||g2.ancho!==4)mal(e,'escalar un trazo');
  const r2=M.transformar({t:'texto',id:'r',x:0,y:0,w:100,h:20,tam:20,texto:'a'},M.mRotar(Math.PI/2,50,10));if(Math.abs(r2.rot-Math.PI/2)>1e-3)mal(e,'rotar un texto');
  const s=M.simplificar(linea(0,0,500,0,500));if(s.length!==2)mal(e,`simplificar una recta deja ${s.length} puntos`);
  if(M.paginasPDF({...M.nuevoDibujo({ancho:400}),objetos:[{t:'trazo',id:'z',ancho:2,pts:[[0,0,.5],[10,1500,.5]]}]}).length<2)mal(e,'el PDF no reparte un dibujo largo en páginas');
  // 📈 plano editable: el plano viejo de 📐 se migra, lo anclado conserva sus coordenadas y 1/x no se une en la asíntota
  {const PL=await import(pathToFileURL(join(raiz,'..','nucleo','dibujo','plano.js')).href);
    const v=M.formaDirecta('planoViejo',[10,20],[310,260]).map(o=>({...o,forma:'plano'})),n=M.normalizarDibujo({objetos:[...v,{t:'trazo',id:'q',ancho:2,pts:[[1,1,.5]]}]});
    if(n.objetos.length!==2||n.objetos[1].t!=='plano'&&n.objetos[0].t!=='plano')mal(e,'plano viejo: no se convierte al objeto editable');
    const a=PL.nuevoPlano(0,0,400,400),b={...a,x:50,w:200,xMin:0,xMax:20},m=PL.matrizPlano(a,b),w=PL.aLienzo(a,[3,2]),w2=[m[0]*w[0]+m[4],m[3]*w[1]+m[5]],u=PL.aPlanoDe(b,w2);
    if(Math.abs(u[0]-3)>1e-9||Math.abs(u[1]-2)>1e-9)mal(e,'plano: lo anclado no conserva sus coordenadas al cambiar el rango');
    if(PL.tramosFuncion(a,'1/x').length!==2||PL.tramosFuncion(a,'x^2-4').length!==1||PL.funcionDe('2*)')!==null)mal(e,'plano: funciones mal graficadas o expresión inválida aceptada')}
  console.log('dibujos: migración del formato viejo, historial, formas inteligentes y de matemáticas, plantillas, goma, lazo y PDF');
  // ▦ matrices con fracciones exactas: operaciones de renglón, Gauss-Jordan, determinante, inversa, LaTeX y leer un sistema
  {const MX=await import(pathToFileURL(join(raiz,'..','nucleo','matrices.js')).href),MZ=await import(pathToFileURL(join(raiz,'..','nucleo','dibujo','matriz.js')).href);
    const AL=await import(pathToFileURL(join(raiz,'..','nucleo','generadores','algebra-lineal.js')).href),e2='matrices';
    const EJ=[['1','3','3','2'],['2','3','9','4'],['2','4','2','4']],M=MX.deTextos(EJ);
    const r2=MX.aplicarOp(M,{tipo:'sumar',i:1,j:0,k:MX.F(-2)});if(MX.aTextos(r2)[1].join(' ')!=='0 −3 3 0')mal(e2,'R₂ → R₂ − 2R₁ no da [0 −3 3 | 0]');
    if(MX.notacion({tipo:'sumar',i:1,j:0,k:MX.F(-2)})!=='R₂ → R₂ − 2R₁'||MX.notacion({tipo:'multiplicar',i:1,k:MX.F(1,2)})!=='R₂ → (1/2)R₂'||MX.notacion({tipo:'intercambiar',i:0,j:1})!=='R₁ ↔ R₂')mal(e2,'notación de las operaciones de renglón');
    if(MX.aTextos(MX.aplicarOp(M,{tipo:'multiplicar',i:0,k:MX.F(1,2)}))[0].join(' ')!=='1/2 3/2 3/2 1')mal(e2,'las fracciones no quedan exactas');
    const s=MX.solucion(M);if(s.tipo!=='unica'||!M.every(f=>MX.iguales(f.slice(0,3).reduce((a,c,j)=>MX.suma(a,MX.mult(c,s.valores[j])),MX.CERO),f[3])))mal(e2,'la solución del sistema de ejemplo no cumple las ecuaciones');
    if(!MX.esReducida(MX.gaussJordan(M,3).M,3))mal(e2,'Gauss-Jordan no llega a la escalonada reducida');
    if(MX.solucion(MX.deTextos([['1','1','2'],['2','2','5']])).tipo!=='ninguna'||MX.solucion(MX.deTextos([['1','1','2'],['2','2','4']])).tipo!=='infinitas')mal(e2,'sistemas sin solución o con infinitas soluciones');
    // contra el motor de Álgebra lineal (det3 de los generadores) en 200 matrices al azar
    let sem=7;const az=()=>{sem=(sem*16807)%2147483647;return sem%11-5};
    for(let n=0;n<200;n++){const A=Array.from({length:3},()=>Array.from({length:3},az)),d=MX.det(MX.deTextos(A.map(f=>f.map(String))));
      if(MX.valor(d)!==AL.det3(A)){mal(e2,`det distinto de det3 en ${JSON.stringify(A)}`);break}
      if(!MX.esCero(d)){const I=MX.producto(MX.deTextos(A.map(f=>f.map(String))),MX.inversa(MX.deTextos(A.map(f=>f.map(String)))).inversa);if(!I.every((f,i)=>f.every((x,j)=>MX.iguales(x,i===j?MX.UNO:MX.CERO)))){mal(e2,`A·A⁻¹ ≠ I en ${JSON.stringify(A)}`);break}}}
    const lt=MX.aLatex(EJ,{paren:'[]',aumentada:3});try{katexLim.renderToString(lt,{throwOnError:true})}catch(x){mal(e2,'el LaTeX de la matriz no compila: '+lt)}
    for(const p of ['[]','()','||','{}','']){const t=MX.aLatex([['1','−1/2'],['0','3']],{paren:p});try{katexLim.renderToString(t,{throwOnError:true})}catch(x){mal(e2,'LaTeX '+p)}const v=MX.deLatex(t);if(!v||v.paren!==p||v.celdas[0][1]!=='−1/2')mal(e2,`de LaTeX a celdas (${p})`)}
    const sis=MX.leerSistema('x + 3y + 3z = 2\n2x + 3y + 9z = 4\n2x + 4y + 2z = 4');if(!sis||JSON.stringify(MX.aTextos(sis.M))!==JSON.stringify(EJ))mal(e2,'pegar un sistema no arma la matriz aumentada');
    if(JSON.stringify(MX.aTextos(MX.leerSistema('2x - z = 1\ny + z = 0').M))!==JSON.stringify([['2','0','−1','1'],['0','1','1','0']]))mal(e2,'pegar un sistema: falta poner 0 en las variables que no aparecen');
    const o=MZ.nuevaMatriz(0,0,3,4,{celdas:EJ,aumentada:3});if(!(o.w>0&&o.h>0)||!MZ.matrizValida(o)||JSON.stringify(MZ.celdaEn(o,...MZ.cajaCelda(o,2,3).slice(0,2).map(v=>v+2)))!=='[2,3]')mal(e2,'medidas o celdas de la matriz del dibujo');
    const Mod=await import(pathToFileURL(join(raiz,'..','nucleo','dibujo','modelo.js')).href),dib=Mod.normalizarDibujo({objetos:[o,{...o,id:'x',celdas:[[1]]}]});
    if(dib.objetos.length!==1||dib.objetos[0].t!=='matriz')mal(e2,'normalizar: la matriz válida se conserva y la rota se descarta');
    console.log('matrices: operaciones de renglón exactas, Gauss-Jordan, det (= det3) e inversa en 200 matrices, LaTeX ↔ celdas y pegar un sistema');}
}
// Errores de dedo: se aceptan en palabras en español (nomonal → nominal) pero nunca cambian el sentido
{
  const si=[['nomonal','nominal'],['Telent','Telnet'],['clasificacoin','clasificacion'],['simetrco','simetrico'],['deteccion y analissi','deteccion y analisis']];
  const no=[['ordinal','nominal'],['asimetrico','simetrico'],['mayor','menor'],['IPS','IDS'],['13','12'],['=SUMA(A1)','=SUMA(A2)'],['ascendente','descendente'],['mediana','media']];
  for(const [e,r] of si)if(casiIgual(e,[r])!==r)mal('errores de dedo','«'+e+'» debería aceptarse como «'+r+'»');
  for(const [e,r] of no)if(casiIgual(e,[r])!==null)mal('errores de dedo','«'+e+'» no debe aceptarse como «'+r+'»');
  if(casiIgual('nominal',['ordinal'],['nominal'])!==null)mal('errores de dedo','un error típico nunca se acepta');
  console.log('errores de dedo: se aceptan en palabras en español y nunca cuando cambian el sentido o son un error típico');
}
avisos.forEach(a=>console.log('aviso  '+a));
errores.forEach(e=>console.log('ERROR  '+e));
console.log(errores.length?`\n${errores.length} errores`:'\nTodo cumple el método de aprendizaje.');
process.exit(errores.length?1:0);

