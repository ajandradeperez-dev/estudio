/* Cliente de Supabase con fetch (sin librerías): REST de PostgREST (rpc/…) y Auth (enlace mágico) para el administrador.
   Solo usa la clave PÚBLICA (anon o publishable): las reglas están en la base (supabase/propuestas.sql).
   crearApi({url, clave, fetch}) → funciones que devuelven {ok, datos} o {ok:false, error:'<código de logica.MENSAJES>'}. */
const esJWT=k=>/^eyJ/.test(k||'');
export function crearApi({url,clave,fetch:f=globalThis.fetch?.bind(globalThis)}={}){
  const listo=!!(url&&clave);
  const base=String(url||'').replace(/\/+$/,'');
  const cab=token=>({'Content-Type':'application/json',apikey:clave,...(token?{Authorization:`Bearer ${token}`}:esJWT(clave)?{Authorization:`Bearer ${clave}`}:{})});
  async function pedir(ruta,{metodo='POST',cuerpo,token,extra={}}={}){
    if(!listo)return {ok:false,error:'sin_servidor'};
    let r;
    try{r=await f(base+ruta,{method:metodo,headers:{...cab(token),...extra},body:cuerpo===undefined?undefined:JSON.stringify(cuerpo)})}
    catch(e){return {ok:false,error:'red'}}
    if(r.status===429)return {ok:false,error:'limite_uso'};
    let datos=null;try{const t=await r.text();datos=t?JSON.parse(t):null}catch(e){}
    if(!r.ok){const m=String(datos?.message||datos?.msg||datos?.error_description||'');const k=['limite_votos','cerrada','no_existe','limite_propuestas','ofensivo','titulo','descripcion','tipo','sin_dispositivo'].find(x=>m.includes(x));
      return {ok:false,error:k||'servidor',detalle:m,status:r.status}}
    return {ok:true,datos};
  }
  const rpc=(fn,args,token)=>pedir(`/rest/v1/rpc/${fn}`,{cuerpo:args||{},token});
  return {
    listo,
    listar:()=>rpc('listar_propuestas'),
    misVotos:disp=>rpc('mis_votos',{p_dispositivo:disp}),
    votar:(disp,id)=>rpc('votar',{p_dispositivo:disp,p_propuesta:id}),
    quitar:(disp,id)=>rpc('quitar_voto',{p_dispositivo:disp,p_propuesta:id}),
    proponer:(disp,{tipo,titulo,descripcion})=>rpc('proponer',{p_dispositivo:disp,p_tipo:tipo,p_titulo:titulo,p_descripcion:descripcion||''}),
    // Administrador: enlace mágico al correo; al abrirlo, Supabase vuelve a la app con #access_token=… (ver main.js)
    enviarEnlace:(email,volver)=>pedir(`/auth/v1/otp?redirect_to=${encodeURIComponent(volver)}`,{cuerpo:{email,create_user:true}}),
    renovar:refresh=>pedir('/auth/v1/token?grant_type=refresh_token',{cuerpo:{refresh_token:refresh}}),
    esAdmin:token=>rpc('es_admin',{},token),
    todas:token=>pedir('/rest/v1/propuestas?select=id,tipo,titulo,descripcion,estado,motivo,respuesta,enlace,creada,actualizada&order=creada.desc',{metodo:'GET',token}),
    actualizar:(token,id,campos)=>pedir(`/rest/v1/propuestas?id=eq.${+id}`,{metodo:'PATCH',cuerpo:campos,token,extra:{Prefer:'return=representation'}})
  };
}
