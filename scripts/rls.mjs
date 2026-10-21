/* Prueba de Row Level Security de supabase/sync.sql en un Postgres de verdad (PGlite, en memoria; lo llama npm run revisar).
   Imita lo mínimo de Supabase (esquemas auth y storage, roles anon y authenticated, auth.uid() desde la sesión) y corre el
   archivo TAL CUAL. Comprueba que una persona no puede leer, cambiar, borrar ni suplantar los datos o las fotos de otra,
   y que sin sesión (anon) no se puede nada. Devuelve la lista de fallos (vacía si todo está bien). */
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const SUPABASE_MINIMO=`
create role anon nologin; create role authenticated nologin;
create schema auth; create schema storage;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, storage, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, metadata jsonb);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to anon, authenticated;
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)] $$;
grant execute on function storage.foldername(text) to anon, authenticated;
`;
const ANA='11111111-1111-4111-8111-111111111111',BETO='22222222-2222-4222-8222-222222222222';

export async function probarRLS(sqlPath){
  const fallos=[];
  const w=globalThis.window;delete globalThis.window;   // PGlite busca `window` para saber si está en un navegador (revisar simula uno)
  try{return await probar(sqlPath,fallos)}catch(e){fallos.push('la prueba se interrumpió: '+String(e.message).split(String.fromCharCode(10))[0]);return fallos}finally{if(w!==undefined)globalThis.window=w}
}
async function probar(sqlPath,fallos){
  const db=new PGlite();
  const como=async(rol,uid,sql,params)=>{
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid||''}', false); set role ${rol};`);
    try{return {ok:true,filas:(await db.query(sql,params)).rows}}catch(e){return {ok:false,error:e.message}}
    finally{await db.exec('reset role')}
  };
  const espera=(c,m)=>{if(!c)fallos.push(m)};
  await db.exec(SUPABASE_MINIMO);
  await db.exec(readFileSync(sqlPath,'utf8'));
  await db.exec(readFileSync(sqlPath,'utf8'));   // se puede volver a correr
  await db.query(`insert into auth.users(id,email) values ($1,'ana@ejemplo.com'),($2,'beto@ejemplo.com')`,[ANA,BETO]);
  // cada quien guarda lo suyo
  for(const [u,n] of [[ANA,'Ana'],[BETO,'Beto']]){
    espera((await como('authenticated',u,`insert into public.perfiles(user_id,nombre) values ($1,$2)`,[u,n])).ok,`${n} no puede guardar su perfil`);
    espera((await como('authenticated',u,`insert into public.progreso(user_id,clave,valor,dispositivo) values ($1,'progreso',$2,'eq')`,[u,JSON.stringify({xp:n.length})])).ok,`${n} no puede guardar su progreso`);
    espera((await como('authenticated',u,`insert into public.notas(user_id,id,contenido) values ($1,$2,'{}')`,[u,'nota-'+n])).ok,`${n} no puede guardar su nota`);
    espera((await como('authenticated',u,`insert into storage.objects(bucket_id,name,owner,metadata) values ('notas-fotos',$1,$2,'{"size":1000}')`,[`${u}/foto.jpg`,u])).ok,`${n} no puede subir una foto a su carpeta`);
  }
  // Ana solo ve lo suyo
  for(const t of ['perfiles','progreso','notas']){
    const r=await como('authenticated',ANA,`select user_id from public.${t}`);
    espera(r.ok&&r.filas.length>0&&r.filas.every(f=>f.user_id===ANA),`en ${t}, Ana ve datos de otra persona`);
  }
  const fotos=await como('authenticated',ANA,`select name from storage.objects`);
  espera(fotos.ok&&fotos.filas.length===1&&fotos.filas[0].name.startsWith(ANA),'Ana ve fotos de otra persona');
  // no puede escribir a nombre de Beto ni cambiar o borrar lo de Beto
  espera(!(await como('authenticated',ANA,`insert into public.notas(user_id,id,contenido) values ($1,'intruso','{}')`,[BETO])).ok,'Ana puede crear notas a nombre de Beto');
  espera(!(await como('authenticated',ANA,`insert into public.progreso(user_id,clave,valor) values ($1,'x','{}')`,[BETO])).ok,'Ana puede escribir progreso a nombre de Beto');
  await como('authenticated',ANA,`update public.progreso set valor='{"xp":999}' where user_id=$1`,[BETO]);
  await como('authenticated',ANA,`delete from public.notas where user_id=$1`,[BETO]);
  const beto=(await db.query(`select (select max(valor->>'xp') from public.progreso where user_id=$1 and clave='progreso') xp,(select count(*)::int from public.notas where user_id=$1) n`,[BETO])).rows[0];
  espera(beto.xp==='4'&&beto.n===1,'Ana puede cambiar o borrar los datos de Beto');
  espera(!(await como('authenticated',ANA,`update public.notas set user_id=$1 where user_id=$2`,[BETO,ANA])).ok,'Ana puede pasarle sus filas a Beto');
  espera(!(await como('authenticated',ANA,`insert into storage.objects(bucket_id,name,owner) values ('notas-fotos',$1,$2)`,[`${BETO}/x.jpg`,ANA])).ok,'Ana puede subir fotos a la carpeta de Beto');
  await como('authenticated',ANA,`delete from storage.objects where name like $1`,[BETO+'/%']);
  espera((await db.query(`select count(*)::int n from storage.objects where name like $1`,[BETO+'/%'])).rows[0].n===1,'Ana puede borrar fotos de Beto');
  // sin sesión: nada
  for(const t of ['perfiles','progreso','notas']){
    const r=await como('anon','',`select * from public.${t}`);espera(!r.ok||r.filas.length===0,`sin sesión se puede leer ${t}`);
    espera(!(await como('anon','',`insert into public.${t}(user_id) values ($1)`,[ANA])).ok,`sin sesión se puede escribir en ${t}`);
  }
  espera(((await como('anon','',`select name from storage.objects`)).filas||[]).length===0,'sin sesión se ven fotos');
  espera(!(await como('anon','',`select public.uso_fotos()`)).ok,'sin sesión se puede consultar el espacio');
  espera(!(await como('anon','',`select public.borrar_mi_cuenta()`)).ok,'sin sesión se puede llamar a borrar_mi_cuenta');
  // espacio: lo mío y el total, sin nombres
  const uso=await como('authenticated',ANA,`select public.uso_fotos() u`);
  espera(uso.ok&&uso.filas[0].u.mio===1000&&uso.filas[0].u.total===2000,'uso_fotos no da lo mío y el total: '+JSON.stringify(uso.filas?.[0]));
  // borrar mi cuenta: se va todo lo de Ana y nada de Beto
  espera((await como('authenticated',ANA,`select public.borrar_mi_cuenta()`)).ok,'Ana no puede borrar su cuenta');
  const quedan=(await db.query(`select (select count(*)::int from public.progreso where user_id=$1) a,(select count(*)::int from public.notas where user_id=$1) b,(select count(*)::int from public.perfiles where user_id=$2) c,(select count(*)::int from auth.users) u`,[ANA,BETO])).rows[0];
  espera(quedan.a===0&&quedan.b===0&&quedan.c===1&&quedan.u===1,'borrar la cuenta no borra todo lo de Ana o borra lo de Beto: '+JSON.stringify(quedan));
  await db.close();
  return fallos;
}
