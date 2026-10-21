/* Cliente de Supabase para sincronizar (sin librerías, con fetch; sin DOM: también lo prueba npm run revisar con un
   servidor simulado). Solo usa la clave PÚBLICA y el token de la sesión de la persona; las reglas están en supabase/sync.sql.
   Cada función devuelve {ok, datos, status} o {ok:false, error:'red'|'sesion'|'limite_uso'|'conflicto'|'servidor'|'sin_servidor'}. */
const BUCKET='notas-fotos';
export function crearApiSync({url,clave,fetch:f=globalThis.fetch?.bind(globalThis)}={}){
  const listo=!!(url&&clave),base=String(url||'').replace(/\/+$/,'');
  async function pedir(ruta,{metodo='GET',cuerpo,token,extra={},binario=false,blob}={}){
    if(!listo)return {ok:false,error:'sin_servidor'};
    const cab={apikey:clave,...(token?{Authorization:`Bearer ${token}`}:{}),...(blob?{}:{'Content-Type':'application/json'}),...extra};
    let r;
    try{r=await f(base+ruta,{method:metodo,headers:cab,body:blob??(cuerpo===undefined?undefined:JSON.stringify(cuerpo))})}
    catch(e){return {ok:false,error:'red'}}
    if(r.status===429)return {ok:false,error:'limite_uso',status:429};
    if(binario&&r.ok)return {ok:true,datos:await r.blob(),status:r.status};
    let datos=null;try{const t=await r.text();datos=t?JSON.parse(t):null}catch(e){}
    if(r.status===401||(r.status===403&&/jwt|token/i.test(JSON.stringify(datos||''))))return {ok:false,error:'sesion',status:r.status};
    if(r.status===409)return {ok:false,error:'conflicto',status:409};
    if(!r.ok)return {ok:false,error:'servidor',status:r.status,detalle:String(datos?.message||datos?.msg||datos?.error_description||datos?.error||'')};
    return {ok:true,datos,status:r.status};
  }
  const q=o=>Object.entries(o).filter(([,v])=>v!==undefined).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const ruta=p=>String(p).split('/').map(encodeURIComponent).join('/');
  return {
    listo,
    // Sesión: enlace mágico al correo o Google; los dos vuelven a `volver` con #access_token=…&refresh_token=…
    enviarEnlace:(email,volver)=>pedir(`/auth/v1/otp?redirect_to=${encodeURIComponent(volver)}`,{metodo:'POST',cuerpo:{email,create_user:true}}),
    urlGoogle:volver=>`${base}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(volver)}`,
    renovar:refresh=>pedir('/auth/v1/token?grant_type=refresh_token',{metodo:'POST',cuerpo:{refresh_token:refresh}}),
    usuario:token=>pedir('/auth/v1/user',{token}),
    salir:token=>pedir('/auth/v1/logout',{metodo:'POST',token}),
    // Tablas (PostgREST). filtros: {user_id:'eq.…', clave:'like.mias:*', select:'…', order:'…'}
    leer:(tabla,filtros,token)=>pedir(`/rest/v1/${tabla}?${q(filtros)}`,{token}),
    guardar:(tabla,filas,token)=>pedir(`/rest/v1/${tabla}`,{metodo:'POST',cuerpo:filas,token,extra:{Prefer:'resolution=merge-duplicates,return=representation'}}),
    insertar:(tabla,filas,token)=>pedir(`/rest/v1/${tabla}`,{metodo:'POST',cuerpo:filas,token,extra:{Prefer:'return=representation'}}),
    // Cambia solo si la fila sigue como se leyó (filtro actualizado=eq.…): si otro dispositivo escribió antes, no cambia nada
    actualizar:(tabla,filtros,cambios,token)=>pedir(`/rest/v1/${tabla}?${q(filtros)}`,{metodo:'PATCH',cuerpo:cambios,token,extra:{Prefer:'return=representation'}}),
    borrar:(tabla,filtros,token)=>pedir(`/rest/v1/${tabla}?${q(filtros)}`,{metodo:'DELETE',token}),
    rpc:(fn,args,token)=>pedir(`/rest/v1/rpc/${fn}`,{metodo:'POST',cuerpo:args||{},token}),
    // Fotos (Storage, bucket privado notas-fotos/<user_id>/…)
    subirFoto:(camino,blob,token)=>pedir(`/storage/v1/object/${BUCKET}/${ruta(camino)}`,{metodo:'POST',blob,token,extra:{'x-upsert':'true','Content-Type':blob.type||'image/jpeg'}}),
    bajarFoto:(camino,token)=>pedir(`/storage/v1/object/authenticated/${BUCKET}/${ruta(camino)}`,{token,binario:true}),
    listarFotos:(carpeta,token)=>pedir(`/storage/v1/object/list/${BUCKET}`,{metodo:'POST',cuerpo:{prefix:carpeta,limit:1000,offset:0},token}),
    borrarFotos:(caminos,token)=>pedir(`/storage/v1/object/${BUCKET}`,{metodo:'DELETE',cuerpo:{prefixes:caminos},token})
  };
}
