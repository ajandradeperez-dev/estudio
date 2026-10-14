// Revisa que las lecciones cumplan el método de aprendizaje (ver CLAUDE.md). Uso: npm run revisar
// Sale con código 1 si alguna regla no se cumple.
import {readdirSync,existsSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {coincide} from '../src/nucleo/comparar.js';
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
const IDS_RESERVADOS=['l','ubicacion','repaso','progreso','notas','inicio','logros','perfil','cofre','jefe'];
globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
const {GENERADORES,BANCOS}=await import(pathToFileURL(join(raiz,'..','nucleo','generadores','index.js')).href);
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
  if(p.v!==7)mal(e,`queda en la versión ${p.v} (se esperaba 7)`);
  if(p.materias.algebra||m?.xp!==230||!m.lecciones.expresiones?.dominada||m.lecciones['ecuaciones-lineales']?.mejor!==0.4)mal(e,'se pierden la XP o las lecciones de Álgebra (ahora Matemáticas)');
  if(!p.materias.ingles?.lecciones['verbo-to-be']?.dominada)mal(e,'se pierden lecciones de otras materias');
  if(!p.repaso['matematicas/l/expresiones/3']||!p.repaso['ingles/l/can/2'])mal(e,'se pierden o no se renombran repasos: '+Object.keys(p.repaso).join(', '));
  // v7: los repasos pasan a SM-2 conservando la fecha, y lo dominado entra al repaso espaciado de habilidades
  const r3=p.repaso['matematicas/l/expresiones/3'];
  if(r3&&(r3.rep!==1||r3.int!==1||r3.ef!==2.5||r3.proxima!==f(-1)))mal(e,'el repaso no pasa bien a SM-2: '+JSON.stringify(r3));
  if(!p.repaso['matematicas/h/expresiones']||!p.repaso['ingles/h/verbo-to-be']||p.repaso['matematicas/h/ecuaciones-lineales'])mal(e,'las habilidades dominadas no entran (solo ellas) al repaso de habilidades');
  if(typeof m?.lecciones.expresiones?.rating!=='number'||!Array.isArray(m?.lecciones.expresiones?.ult))mal(e,'falta el registro de dominio (rating, últimas respuestas)');
  if(p.notas['matematicas/expresiones']?.texto!=='Resumen')mal(e,'se pierde la nota');
  if(P.racha(p)!==3||p.mejorRacha!==4||p.dominados!==2)mal(e,`se pierde la racha (${P.racha(p)} días)`);
  if(p.ultimo?.materia!=='matematicas'||p.historial[0]?.materia!=='matematicas')mal(e,'"continuar" o el historial siguen apuntando a algebra');
  if(JSON.parse(mem['ciberlab-progreso']).v!==p.v)mal(e,'la migración no se guarda');
  console.log(`progreso: un v5 migra a v${p.v} conservando lecciones, XP, racha, repasos y notas`);
}
if(sinGenerador.length)console.log(`${sinGenerador.length} habilidades sin generador todavía (se ven como Próximamente)`);
avisos.forEach(a=>console.log('aviso  '+a));
errores.forEach(e=>console.log('ERROR  '+e));
console.log(errores.length?`\n${errores.length} errores`:'\nTodo cumple el método de aprendizaje.');
process.exit(errores.length?1:0);
