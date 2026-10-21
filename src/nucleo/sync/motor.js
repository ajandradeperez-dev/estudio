/* Motor de la sincronización (sin DOM: npm run revisar lo prueba con dos «teléfonos» y un Supabase simulado).
   Todo se combina con las reglas de sync/fusionar.js; nada se borra en silencio (solo lo que tiene lápida más nueva).
   - progreso y lápidas: una fila cada uno; se lee, se combina y se escribe SOLO si nadie la cambió mientras tanto
     (filtro actualizado=eq.<lo leído>); si otro dispositivo ganó, se vuelve a leer y combinar.
   - notas: una fila por nota; se bajan las cambiadas desde la última vez (cursor) y se suben las editadas aquí.
   - Mis materias y lo generado: filas 'mias:<id>' / 'gen:<id>', gana la más nueva (editada / creado).
   - fotos: archivo en Storage (<user_id>/<id>.<ext>) + fila 'foto:<id>' con sus datos; antes de subir se revisa el espacio.
   `local` adapta lo de este dispositivo (ver sync/navegador.js); `sesion()` da {token, uid} o null. */
import {fusionarProgreso,marcarAportes,unirLapidas,resumenProgreso} from './fusionar.js';
import {normalizar} from '../progreso.js';

export const LIMITE_FOTOS=1024**3;            // plan gratuito de Supabase: 1 GB de Storage para todo el proyecto
export const AVISO_FOTOS=0.8,TOPE_FOTOS=0.95;
const ext=t=>/png/.test(t||'')?'png':/webp/.test(t||'')?'webp':'jpg';

export function crearMotor({api,local,sesion,equipo,nombreEquipo=()=>'Este dispositivo',ahora=()=>Date.now()}){
  const fallo=r=>({ok:false,error:r?.error||'servidor'});

  // Lee una fila de 'progreso', la combina con lo local y la escribe sin pisar a otro dispositivo
  async function filaCombinada(s,clave,local_,combinar,subir=x=>x){
    for(let i=0;i<4;i++){
      const r=await api.leer('progreso',{user_id:`eq.${s.uid}`,clave:`eq.${clave}`,select:'valor,actualizado,dispositivo'},s.token);
      if(!r.ok)return r;
      const fila=r.datos?.[0],unido=fila?combinar(local_,fila.valor,fila.dispositivo):local_,valor=subir(unido);
      const w=fila?await api.actualizar('progreso',{user_id:`eq.${s.uid}`,clave:`eq.${clave}`,actualizado:`eq.${fila.actualizado}`},{valor,dispositivo:equipo},s.token)
        :await api.insertar('progreso',[{user_id:s.uid,clave,valor,dispositivo:equipo}],s.token);
      if(w.ok&&(!fila||w.datos?.length===1))return {ok:true,datos:valor,remoto:fila?.valor??null};
      if(!w.ok&&w.error!=='conflicto')return w;
    }
    return {ok:false,error:'conflicto'};
  }

  async function sincronizar(){
    const s=await sesion();if(!s)return {ok:false,error:'sin_sesion'};
    const st={cursor:null,subidas:{},fotos:{},...(local.estado()||{})};
    const primera=st.uid!==s.uid;
    if(primera)Object.assign(st,{cursor:null,subidas:{},fotos:{}});
    const antes=primera?{...resumenProgreso(local.progreso()),notas:(await local.notas()).length}:null;
    // 1 · lápidas (antes que todo: así nada borrado vuelve)
    let r=await filaCombinada(s,'borradas',local.lapidas(),(a,b)=>unirLapidas(a,b||{}));
    if(!r.ok)return fallo(r);
    local.ponerLapidas(unirLapidas(local.lapidas(),r.datos));
    const lap=local.lapidas();
    // 2 · progreso
    r=await filaCombinada(s,'progreso',local.progreso(),(a,b,el)=>fusionarProgreso(a,normalizar(b),{yo:equipo,el:el||'nube',borradas:lap}),p=>marcarAportes(p,equipo));
    if(!r.ok)return fallo(r);
    const remotoProgreso=r.remoto;
    local.combinarProgreso(r.datos,equipo,lap);   // con lo que haya cambiado aquí mientras tanto
    // 3 · notas: bajar lo cambiado
    const notasLoc=new Map((await local.notas()).map(n=>[n.id,n]));
    r=await api.leer('notas',{user_id:`eq.${s.uid}`,...(st.cursor?{actualizado:`gt.${st.cursor}`}:{}),select:'id,contenido,actualizado,borrado',order:'actualizado.asc'},s.token);
    if(!r.ok)return fallo(r);
    let bajadas=0;
    for(const f of r.datos||[]){
      const n=notasLoc.get(f.id);
      if(f.borrado){const t=f.contenido?.editada||Date.parse(f.actualizado)||0;lap[f.id]=Math.max(lap[f.id]||0,t);
        if(n&&(n.editada||0)<t){await local.borrarNota(f.id);notasLoc.delete(f.id)}st.subidas[f.id]=-1}
      else if(f.contenido){const c=f.contenido;
        if(!(lap[f.id]>(c.editada||0))&&(!n||(c.editada||0)>(n.editada||0))){await local.guardarNota(c);notasLoc.set(f.id,c);bajadas++}
        st.subidas[f.id]=Math.max(st.subidas[f.id]||0,c.editada||0)}
      st.cursor=f.actualizado;
    }
    local.ponerLapidas(lap);
    // subir lo editado aquí y las lápidas de notas que ya estaban en la nube
    const subir=[...notasLoc.values()].filter(n=>(n.editada||0)>(st.subidas[n.id]||0)).map(n=>({user_id:s.uid,id:n.id,contenido:n,borrado:false}));
    for(const [id,t] of Object.entries(lap))if(st.subidas[id]>0&&t>=st.subidas[id]&&!notasLoc.has(id))subir.push({user_id:s.uid,id,contenido:{editada:t},borrado:true});
    for(let i=0;i<subir.length;i+=50){const w=await api.guardar('notas',subir.slice(i,i+50),s.token);if(!w.ok)return fallo(w);
      for(const x of subir.slice(i,i+50))st.subidas[x.id]=x.borrado?-1:(x.contenido.editada||0)}
    local.ponerEstado(st);   // lo ya subido no se vuelve a subir si algo de abajo falla
    // 4 · Mis materias y lo generado con IA
    r=await api.leer('progreso',{user_id:`eq.${s.uid}`,or:'(clave.like.mias:*,clave.like.gen:*)',select:'clave,ed:valor->editada,cr:valor->creado'},s.token);
    if(!r.ok)return fallo(r);
    for(const [pref,lista,campo,guardar,borrarLoc] of [['mias:',await local.materias(),'editada',local.guardarMateria,local.borrarMateria],['gen:',await local.generados(),'creado',local.guardarGenerado,local.borrarGenerado]]){
      const rem=new Map((r.datos||[]).filter(f=>f.clave.startsWith(pref)).map(f=>[f.clave.slice(pref.length),+(f.ed??f.cr)||0]));
      const loc=new Map(lista.map(x=>[x.id,x]));
      for(const [id,t] of rem){
        if(lap[id]>t){await api.borrar('progreso',{user_id:`eq.${s.uid}`,clave:`eq.${pref}${id}`},s.token);continue}
        const x=loc.get(id);
        if(!x||t>(x[campo]||0)){const g=await api.leer('progreso',{user_id:`eq.${s.uid}`,clave:`eq.${pref}${id}`,select:'valor'},s.token);
          if(!g.ok)return fallo(g);if(g.datos?.[0]?.valor)await guardar(g.datos[0].valor)}
      }
      const nuevas=lista.filter(x=>!lap[x.id]&&(x[campo]||0)>(rem.get(x.id)??-1)).map(x=>({user_id:s.uid,clave:pref+x.id,valor:x,dispositivo:equipo}));
      for(const f of nuevas){const w=await api.guardar('progreso',[f],s.token);if(!w.ok)return fallo(w)}
      for(const id of loc.keys())if(lap[id]>(loc.get(id)[campo]||0))await borrarLoc(id);
    }
    // 5 · fotos y dibujos
    const fotos=await sincronizarFotos(s,st,lap);if(!fotos.ok)return fallo(fotos);
    // 6 · nombre y este dispositivo
    const nombre=local.nombre();
    if(nombre)await api.guardar('perfiles',[{user_id:s.uid,nombre:String(nombre).slice(0,60)}],s.token);
    else{const p=await api.leer('perfiles',{user_id:`eq.${s.uid}`,select:'nombre'},s.token);if(p.ok&&p.datos?.[0]?.nombre)local.ponerNombre(p.datos[0].nombre)}
    await api.guardar('progreso',[{user_id:s.uid,clave:`equipo:${equipo}`,valor:{nombre:nombreEquipo(),ultimo:new Date(ahora()).toISOString()},dispositivo:equipo}],s.token);
    st.uid=s.uid;st.ultima=ahora();local.ponerEstado(st);
    const res={ok:true,bajadas,subidas:subir.length,fotos};
    if(primera)res.primera={antes,nube:remotoProgreso?resumenProgreso(normalizar(remotoProgreso)):null,despues:{...resumenProgreso(local.progreso()),notas:(await local.notas()).length}};
    return res;
  }

  async function sincronizarFotos(s,st,lap){
    const r=await api.leer('progreso',{user_id:`eq.${s.uid}`,clave:'like.foto:*',select:'clave,valor'},s.token);
    if(!r.ok)return r;
    const rem=new Map((r.datos||[]).map(f=>[f.clave.slice(5),f.valor])),loc=await local.archivos(),tengo=new Set(loc.map(a=>a.id));
    let bajadas=0,subidas=0,aviso=null;
    for(const [id,m] of rem){
      const camino=`${s.uid}/${id}.${ext(m.tipo)}`;
      if(lap[id]){await api.borrarFotos([camino],s.token);await api.borrar('progreso',{user_id:`eq.${s.uid}`,clave:`eq.foto:${id}`},s.token);continue}
      if(!tengo.has(id)){const b=await api.bajarFoto(camino,s.token);if(b.ok){await local.guardarArchivo(m,b.datos);bajadas++}}
      st.fotos[id]=1;
    }
    for(const a of loc)if(lap[a.id]){await local.borrarArchivo(a.id);delete st.fotos[a.id]}
    const pendientes=loc.filter(a=>!rem.has(a.id)&&!st.fotos[a.id]&&!lap[a.id]);
    let uso=null;
    if(pendientes.length){const u=await api.rpc('uso_fotos',{},s.token);if(u.ok)uso=u.datos}
    for(const a of pendientes){
      if(uso&&uso.total>=LIMITE_FOTOS*TOPE_FOTOS){aviso='lleno';break}
      const blob=await local.leerArchivo(a.id);if(!blob)continue;
      const {blob:_,...meta}=a,camino=`${s.uid}/${a.id}.${ext(a.tipo||blob.type)}`;
      const w=await api.subirFoto(camino,blob,s.token);if(!w.ok)return w;
      const g=await api.guardar('progreso',[{user_id:s.uid,clave:`foto:${a.id}`,valor:{...meta,tipo:a.tipo||blob.type,bytes:blob.size||0},dispositivo:equipo}],s.token);if(!g.ok)return g;
      st.fotos[a.id]=1;subidas++;if(uso)uso.total+=blob.size||0;
    }
    if(!aviso&&uso&&uso.total>=LIMITE_FOTOS*AVISO_FOTOS)aviso='casi';
    return {ok:true,bajadas,subidas,aviso,uso};
  }

  return {
    sincronizar,
    async dispositivos(){const s=await sesion();if(!s)return [];
      const r=await api.leer('progreso',{user_id:`eq.${s.uid}`,clave:'like.equipo:*',select:'clave,valor'},s.token);
      return r.ok?(r.datos||[]).map(f=>({id:f.clave.slice(7),...f.valor,este:f.clave.slice(7)===equipo})).sort((a,b)=>(b.ultimo||'')<(a.ultimo||'')?-1:1):[]},
    async usoFotos(){const s=await sesion();if(!s)return null;const r=await api.rpc('uso_fotos',{},s.token);return r.ok?r.datos:null},
    // Borra fotos (Storage) y luego la cuenta (perfiles, progreso y notas se van en cascada)
    async borrarCuenta(){const s=await sesion();if(!s)return {ok:false,error:'sin_sesion'};
      const l=await api.listarFotos(s.uid,s.token);
      if(l.ok&&l.datos?.length){const w=await api.borrarFotos(l.datos.map(f=>`${s.uid}/${f.name}`),s.token);if(!w.ok)return w}
      return api.rpc('borrar_mi_cuenta',{},s.token)}
  };
}
