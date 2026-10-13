// Revisa que las lecciones cumplan el método de aprendizaje (ver CLAUDE.md). Uso: npm run revisar
// Sale con código 1 si alguna regla no se cumple.
import {readdirSync,existsSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
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
const IDS_RESERVADOS=['l','ubicacion','repaso','progreso','notas','inicio'];
for(const materia of readdirSync(raiz).sort()){
  const fm=join(raiz,materia,'materia.js');
  if(!existsSync(fm))continue;
  const area=readFileSync(fm,'utf8').match(/[{,\s]area\s*:\s*'([^']+)'/)?.[1];
  if(!area)mal(materia,"materia.js necesita area:'<id del área>'");else if(!areas[area])mal(materia,`el área ${area} no existe en src/areas/`);else areas[area].push(materia);
  if(areas[materia]&&area!==materia)mal(materia,'una materia no puede tener el id de otra área');
  // Archivos de lecciones en orden: lecciones/*.js o, si hay temas, temas/<tema>/*.js en el orden de temas.js
  const archivos=[],dirTemas=join(raiz,materia,'temas'),fTemas=join(raiz,materia,'temas.js');
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
        for(const k of ['titulo','icono','descripcion'])if(!t[k])mal(dt,`falta ${k}`);
        if(t.proximas!==undefined&&(!Array.isArray(t.proximas)||t.proximas.some(x=>typeof x!=='string'||!x.trim())))mal(dt,'proximas debe ser una lista de títulos');
        const dir=join(dirTemas,t.id),fs=existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith('.js')).sort():[];
        if(!fs.length&&!t.proximas?.length)mal(dt,'no tiene lecciones ni lecciones próximas');
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
    if(!Array.isArray(l.rondas)||l.rondas.length<2){mal(donde,'necesita al menos 2 rondas de ejercicios distintas (para repetir si no se domina)');continue}
    const vistas=new Set();
    l.rondas.forEach((ronda,r)=>{
      const d=`${donde} ronda ${r+1}`;
      if(ronda.length<5)mal(d,`tiene ${ronda.length} ejercicios (mínimo 5)`);
      const prod=ronda.filter(esProduccion).length;
      if(prod/ronda.length<MIN_PRODUCCION)mal(d,`producción ${prod}/${ronda.length} (mínimo ${MIN_PRODUCCION*100}%)`);
      ronda.forEach((ej,i)=>{
        const e=`${d} ej. ${i+1}`,texto=ej.pregunta||ej.frente;
        if(vistas.has(texto))mal(e,'pregunta repetida en la lección: las rondas deben tener ejercicios distintos');
        vistas.add(texto);
        if(ej.tipo==='opcion'){
          if(i!==0)mal(e,'la opción múltiple solo se usa para introducir: debe ser el primer ejercicio de la ronda');
          if(!(ej.correcta>=0&&ej.correcta<ej.opciones?.length))mal(e,'correcta fuera de rango');
          ej.opciones?.forEach((_,k)=>{if(k!==ej.correcta&&!ej.porque?.[k])mal(e,`falta el porqué de la opción incorrecta ${k}`)});
        }else if(ej.tipo==='completar'){
          if(!ej.respuestas?.length||ej.respuestas.some(x=>typeof x!=='string'||!x.trim()))mal(e,'respuestas vacías');
          if(!ej.errores||!Object.keys(ej.errores).length)avisos.push(`${e}: sin errores típicos (se mostrará una explicación genérica)`);
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
  const lecIng=new Set(readdirSync(join(ing,'lecciones')).map(f=>f.replace(/^\d+-/,'').replace(/\.js$/,'')));
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
}
avisos.forEach(a=>console.log('aviso  '+a));
errores.forEach(e=>console.log('ERROR  '+e));
console.log(errores.length?`\n${errores.length} errores`:'\nTodo cumple el método de aprendizaje.');
process.exit(errores.length?1:0);
