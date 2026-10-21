/* Pruebas de la sincronización (las llama npm run revisar), sin red:
   - un Supabase simulado con la misma interfaz que sync/api.js (tablas en memoria, cada quien ve solo lo suyo,
     `actualizado` que pone el servidor, filtros eq/gt/like/or, Storage);
   - dos «teléfonos» en memoria con el motor real (sync/motor.js) y la fusión real (sync/fusionar.js).
   Comprueba que convergen sin perder ni duplicar nada, borrados con lápida, fotos, materias propias, carreras entre
   dispositivos, sin conexión y el resumen del primer inicio de sesión. Devuelve la lista de fallos. */
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';

export function supabaseSimulado(){
  const tablas={perfiles:[],progreso:[],notas:[]},fotos=new Map();let reloj=Date.UTC(2026,9,1),red=true;
  const marca=()=>new Date(reloj+=1000).toISOString();
  const llaves={perfiles:['user_id'],progreso:['user_id','clave'],notas:['user_id','id']};
  const comoRegex=p=>new RegExp('^'+p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$');
  const cumple=(f,col,cond)=>{const i=cond.indexOf('.'),op=cond.slice(0,i),v=cond.slice(i+1),x=f[col];
    return op==='eq'?String(x)===v:op==='gt'?String(x)>v:op==='like'?comoRegex(v).test(String(x)):false};
  const filtrar=(lista,uid,filtros)=>lista.filter(f=>f.user_id===uid&&Object.entries(filtros).every(([k,c])=>{
    if(['select','order'].includes(k))return true;
    if(k==='or')return c.slice(1,-1).split(',').some(p=>{const [col,...r]=p.split('.');return cumple(f,col,r.join('.'))});
    return cumple(f,k,c)}));
  const proyectar=(f,select)=>{if(!select||select==='*')return {...f};const o={};
    for(const s of select.split(',')){const [al,expr]=s.includes(':')?s.split(':'):[s,s];const [col,campo]=expr.split('->');o[al]=campo?f[col]?.[campo]:f[col]}return o};
  const uidDe=t=>t?.replace(/^tok-/,'')||null;
  const sinRed=()=>red?null:{ok:false,error:'red'};
  const copia=x=>JSON.parse(JSON.stringify(x));
  return {
    tablas,fotos,cortarRed(v){red=!v},
    api:{
      listo:true,
      leer:async(t,filtros,tok)=>sinRed()||{ok:true,datos:filtrar(tablas[t],uidDe(tok),filtros).sort((a,b)=>filtros.order?(a.actualizado<b.actualizado?-1:1):0).map(f=>copia(proyectar(f,filtros.select)))},
      guardar:async(t,filas,tok)=>{if(!red)return {ok:false,error:'red'};const uid=uidDe(tok);
        for(const f of filas){if(f.user_id!==uid)return {ok:false,error:'servidor',status:403};
          const k=llaves[t],i=tablas[t].findIndex(x=>k.every(c=>x[c]===f[c]));const nueva={...(i>=0?tablas[t][i]:{}),...copia(f),actualizado:marca()};
          if(i>=0)tablas[t][i]=nueva;else tablas[t].push(nueva)}
        return {ok:true,datos:copia(filas)}},
      insertar:async(t,filas,tok)=>{if(!red)return {ok:false,error:'red'};const uid=uidDe(tok);
        for(const f of filas){const k=llaves[t];if(f.user_id!==uid)return {ok:false,error:'servidor'};if(tablas[t].some(x=>k.every(c=>x[c]===f[c])))return {ok:false,error:'conflicto'};tablas[t].push({...copia(f),actualizado:marca()})}
        return {ok:true,datos:copia(filas)}},
      actualizar:async(t,filtros,cambios,tok)=>{if(!red)return {ok:false,error:'red'};const fs=filtrar(tablas[t],uidDe(tok),filtros);
        for(const f of fs)Object.assign(f,copia(cambios),{actualizado:marca()});return {ok:true,datos:copia(fs)}},
      borrar:async(t,filtros,tok)=>{if(!red)return {ok:false,error:'red'};const fs=new Set(filtrar(tablas[t],uidDe(tok),filtros));tablas[t]=tablas[t].filter(f=>!fs.has(f));return {ok:true,datos:null}},
      rpc:async(fn,args,tok)=>{if(!red)return {ok:false,error:'red'};const uid=uidDe(tok);
        if(fn==='uso_fotos'){let mio=0,total=0;for(const [k,b] of fotos){total+=b.size;if(k.startsWith(uid+'/'))mio+=b.size}return {ok:true,datos:{mio,total}}}
        if(fn==='borrar_mi_cuenta'){for(const k of Object.keys(tablas))tablas[k]=tablas[k].filter(f=>f.user_id!==uid);return {ok:true,datos:null}}
        return {ok:false,error:'servidor'}},
      subirFoto:async(c,blob,tok)=>{if(!red)return {ok:false,error:'red'};if(!c.startsWith(uidDe(tok)+'/'))return {ok:false,error:'servidor'};fotos.set(c,blob);return {ok:true}},
      bajarFoto:async(c,tok)=>{if(!red)return {ok:false,error:'red'};if(!c.startsWith(uidDe(tok)+'/')||!fotos.has(c))return {ok:false,error:'servidor'};return {ok:true,datos:fotos.get(c)}},
      listarFotos:async(carpeta,tok)=>({ok:true,datos:[...fotos.keys()].filter(k=>k.startsWith(carpeta+'/')).map(k=>({name:k.slice(carpeta.length+1)}))}),
      borrarFotos:async(cs,tok)=>{for(const c of cs)if(c.startsWith(uidDe(tok)+'/'))fotos.delete(c);return {ok:true}}
    }
  };
}

export async function probarSync(raiz){
  const fallos=[],espera=(c,m)=>{if(!c)fallos.push(m)};
  const imp=p=>import(pathToFileURL(join(raiz,...p.split('/'))).href);
  const {crearMotor}=await imp('nucleo/sync/motor.js'),{fusionarProgreso}=await imp('nucleo/sync/fusionar.js'),P=await imp('nucleo/progreso.js');
  const sim=supabaseSimulado();
  const telefono=(equipo,{xp,ej,notas=[],archivos=[],materias=[]},uid='ana')=>{
    const L={equipo,p:P.normalizar({v:11,meta:{tipo:'ejercicios',cantidad:10},dias:{[P.hoy()]:{ej,seg:0,xp,ok:ej>=10}},materias:{matematicas:{xp,lecciones:{},extra:{}}}}),
      notas:new Map(notas.map(n=>[n.id,n])),archivos:new Map(archivos.map(a=>[a.id,a])),materias:new Map(materias.map(m=>[m.id,m])),generados:new Map(),lap:{},est:null,nombre:''};
    const local={
      progreso:()=>L.p,combinarProgreso:(rem,el,lap)=>{L.p=fusionarProgreso(L.p,P.normalizar(rem),{yo:equipo,el,borradas:lap})},
      lapidas:()=>({...L.lap}),ponerLapidas:x=>{L.lap={...x}},
      notas:async()=>[...L.notas.values()],guardarNota:async n=>{L.notas.set(n.id,n)},borrarNota:async id=>{L.notas.delete(id)},
      archivos:async()=>[...L.archivos.values()].map(({blob,...m})=>m),leerArchivo:async id=>L.archivos.get(id)?.blob,guardarArchivo:async(m,blob)=>{L.archivos.set(m.id,{...m,blob})},borrarArchivo:async id=>{L.archivos.delete(id)},
      materias:async()=>[...L.materias.values()],guardarMateria:async m=>{L.materias.set(m.id,m)},borrarMateria:async id=>{L.materias.delete(id)},
      generados:async()=>[...L.generados.values()],guardarGenerado:async g=>{L.generados.set(g.id,g)},borrarGenerado:async id=>{L.generados.delete(id)},
      estado:()=>L.est&&JSON.parse(JSON.stringify(L.est)),ponerEstado:s=>{L.est=JSON.parse(JSON.stringify(s))},
      nombre:()=>L.nombre,ponerNombre:n=>{L.nombre=n}};
    L.motor=crearMotor({api:sim.api,local,sesion:async()=>({token:'tok-'+uid,uid}),equipo,nombreEquipo:()=>'Teléfono '+equipo});
    return L;
  };
  const xp=L=>L.p.materias.matematicas.xp,titulos=L=>[...L.notas.values()].map(n=>n.titulo).sort().join(',');
  const blob={size:1234,type:'image/jpeg',marca:'foto-1'};
  const A=telefono('A',{xp:100,ej:6,notas:[{id:'n1',titulo:'Uno',editada:10}],archivos:[{id:'f1',nota:'n1',tipo:'image/jpeg',blob}],materias:[{id:'mp-1',nombre:'Química',editada:5}]});
  const B=telefono('B',{xp:50,ej:4,notas:[{id:'n2',titulo:'Dos',editada:20}]});
  A.nombre='Ana';
  let r=await A.motor.sincronizar();espera(r.ok&&r.primera,'la primera sincronización de A falla o no da el resumen: '+JSON.stringify(r).slice(0,200));
  r=await B.motor.sincronizar();espera(r.ok&&r.primera?.nube?.xp===100&&r.primera?.antes?.xp===50&&r.primera?.despues?.xp===150,'el resumen del primer inicio de sesión no dice nube 100, aquí 50, después 150: '+JSON.stringify(r.primera));
  await A.motor.sincronizar();
  espera(xp(A)===150&&xp(B)===150,`la XP no converge sin duplicar (A ${xp(A)}, B ${xp(B)}; se esperaba 150)`);
  espera(A.p.dias[P.hoy()].ej===10&&A.p.dias[P.hoy()].ok&&P.racha(A.p)===1,'los ejercicios de hoy no se suman (6 + 4 = meta cumplida y racha)');
  espera(titulos(A)==='Dos,Uno'&&titulos(B)==='Dos,Uno','las notas no llegan a los dos teléfonos: '+titulos(A)+' / '+titulos(B));
  espera(B.archivos.get('f1')?.blob?.marca==='foto-1'&&sim.fotos.has('ana/f1.jpg'),'la foto no sube a la carpeta de la persona o no llega al otro teléfono');
  espera(B.materias.get('mp-1')?.nombre==='Química','las materias propias no llegan al otro teléfono');
  espera(B.nombre==='Ana','el nombre del perfil no llega al teléfono que no lo tenía');
  for(let i=0;i<3;i++){await A.motor.sincronizar();await B.motor.sincronizar()}
  espera(xp(A)===150&&xp(B)===150,'sincronizar muchas veces duplica la XP');
  // cambios en los dos lados
  B.p.materias.matematicas.xp+=10;B.p.dias[P.hoy()].xp+=10;B.notas.set('n1',{...B.notas.get('n1'),titulo:'Uno editada',editada:30});
  A.p.materias.matematicas.xp+=5;
  await B.motor.sincronizar();await A.motor.sincronizar();await B.motor.sincronizar();
  espera(xp(A)===165&&xp(B)===165,`lo ganado en los dos teléfonos no se suma exacto (A ${xp(A)}, B ${xp(B)}; se esperaba 165)`);
  espera(A.notas.get('n1')?.titulo==='Uno editada','la edición más nueva de una nota no gana');
  // borrar con lápida (una nota y una foto) y no resucitar
  A.notas.delete('n2');A.lap.n2=100;A.notas.delete('n1');A.archivos.delete('f1');A.lap.n1=100;A.lap.f1=100;
  await A.motor.sincronizar();await B.motor.sincronizar();await A.motor.sincronizar();
  espera(!B.notas.has('n2')&&!A.notas.has('n2')&&!B.notas.has('n1'),'una nota borrada vuelve o no se borra en el otro teléfono');
  espera(!B.archivos.has('f1')&&!sim.fotos.has('ana/f1.jpg'),'una foto borrada sigue en el otro teléfono o en Storage');
  espera(sim.tablas.notas.find(f=>f.id==='n2')?.borrado===true,'el borrado no queda como lápida en la nube');
  // una edición más nueva que el borrado sí gana
  B.notas.set('n3',{id:'n3',titulo:'Tres',editada:200});await B.motor.sincronizar();await A.motor.sincronizar();
  espera(A.notas.get('n3')?.titulo==='Tres','una nota nueva no llega');
  // carrera: otro dispositivo escribe el progreso entre que A lo lee y lo escribe → A vuelve a combinar
  const orig=sim.api.actualizar;let una=true;
  sim.api.actualizar=async(...a)=>{if(una&&a[0]==='progreso'&&a[1].clave==='eq.progreso'){una=false;B.p.materias.matematicas.xp+=7;await B.motor.sincronizar()}return orig(...a)};
  A.p.materias.matematicas.xp+=3;await A.motor.sincronizar();sim.api.actualizar=orig;await B.motor.sincronizar();
  espera(xp(A)===175&&xp(B)===175,`con dos dispositivos escribiendo a la vez se pierde o duplica XP (A ${xp(A)}, B ${xp(B)}; se esperaba 175)`);
  // sin conexión: no se pierde nada y se envía al volver
  sim.cortarRed(true);A.p.materias.matematicas.xp+=20;A.notas.set('n4',{id:'n4',titulo:'Sin red',editada:300});
  r=await A.motor.sincronizar();espera(!r.ok&&r.error==='red','sin conexión no avisa el error de red');
  sim.cortarRed(false);await A.motor.sincronizar();await B.motor.sincronizar();
  espera(xp(B)===195&&B.notas.get('n4')?.titulo==='Sin red','lo hecho sin conexión no llega al volver la red');
  // otra persona no ve nada de Ana
  const C=telefono('C',{xp:1,ej:0},'beto');await C.motor.sincronizar();
  espera(xp(C)===1&&C.notas.size===0&&!C.materias.size,'otra cuenta ve datos de Ana');
  // dispositivos y espacio
  const ds=await A.motor.dispositivos();espera(ds.length===2&&ds.some(d=>d.este)&&ds.every(d=>d.nombre&&d.ultimo),'la lista de dispositivos no trae los dos');
  // borrar la cuenta: fotos y filas fuera
  B.archivos.set('f9',{id:'f9',tipo:'image/png',blob:{size:10,type:'image/png'}});await B.motor.sincronizar();
  r=await A.motor.borrarCuenta();
  espera(r.ok&&![...sim.fotos.keys()].some(k=>k.startsWith('ana/'))&&!sim.tablas.progreso.some(f=>f.user_id==='ana'),'borrar la cuenta deja fotos o datos');
  return fallos;
}
