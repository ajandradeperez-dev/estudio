-- 🗳️ Propuestas y votos de Estudio+ (Supabase / Postgres).
-- Se pega completo en Supabase → SQL Editor → New query → Run. Se puede volver a correr: no borra votos ni propuestas.
-- La app usa SOLO la clave pública (anon / publishable): la seguridad está aquí, con Row Level Security y funciones que
-- validan los límites en la base (no en la app). La clave service_role NUNCA va en la app ni en git.
--
-- Qué puede hacer cada quien:
--   cualquiera (anon)  → listar_propuestas(), mis_votos(), votar(), quitar_voto(), proponer()   (solo por estas funciones)
--   administrador      → leer y cambiar todo en la tabla propuestas (inicia sesión con enlace mágico y está en la tabla admins)
-- Nadie puede leer ni escribir las tablas directamente con la clave pública.

create table if not exists public.propuestas(
  id          bigint generated always as identity primary key,
  tipo        text not null check (tipo in ('curso','tema','libro')),
  titulo      text not null check (char_length(titulo) between 3 and 60),
  descripcion text not null default '' check (char_length(descripcion) <= 280),
  -- pendiente: espera revisión (no se ve) · votacion · aprobada (llegó a 5 votos) · preparacion · disponible · descartada (con motivo) · rechazada (spam: no se ve)
  estado      text not null default 'pendiente' check (estado in ('pendiente','votacion','aprobada','preparacion','disponible','descartada','rechazada')),
  motivo      text check (char_length(motivo) <= 280),      -- por qué se descartó
  respuesta   text check (char_length(respuesta) <= 280),   -- mensaje del administrador ("Lo empiezo esta semana")
  enlace      text check (char_length(enlace) <= 120),      -- ruta de la app cuando está disponible (p. ej. cursos/excel)
  autor       uuid,                                          -- dispositivo que la propuso (nunca se publica)
  creada      timestamptz not null default now(),
  actualizada timestamptz not null default now(),
  aprobada_en timestamptz
);
create table if not exists public.votos(
  dispositivo uuid   not null,
  propuesta   bigint not null references public.propuestas(id) on delete cascade,
  creado      timestamptz not null default now(),
  primary key (dispositivo, propuesta)                       -- 1 voto por propuesta por dispositivo
);
create index if not exists votos_propuesta on public.votos(propuesta);
create table if not exists public.admins(
  usuario uuid primary key references auth.users(id) on delete cascade
);

alter table public.propuestas enable row level security;
alter table public.votos      enable row level security;
alter table public.admins     enable row level security;

-- Sin acceso directo con la clave pública
revoke all on public.propuestas, public.votos, public.admins from anon;
revoke all on public.votos, public.admins from authenticated;
grant select, insert, update, delete on public.propuestas to authenticated;   -- RLS deja pasar solo al administrador

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where usuario = auth.uid())
$$;

drop policy if exists admin_todo on public.propuestas;
create policy admin_todo on public.propuestas for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Mantiene la fecha de actualización y la de aprobación
create or replace function public.tocar_propuesta() returns trigger language plpgsql as $$
begin
  new.actualizada := now();
  if new.estado = 'aprobada' and old.estado is distinct from 'aprobada' then new.aprobada_en := now(); end if;
  return new;
end $$;
drop trigger if exists propuestas_tocar on public.propuestas;
create trigger propuestas_tocar before update on public.propuestas for each row execute function public.tocar_propuesta();

-- Filtro básico de palabras ofensivas (el administrador revisa todo antes de publicarlo de todos modos)
create or replace function public.ofensivo(t text) returns boolean language sql immutable as $$
  select lower(translate(coalesce(t,''),'ÁÉÍÓÚÜáéíóúü0134@$','AEIOUUaeiouuoieaas')) ~
    '(^|[^a-zñ])(puta|puto|pendej|chinga|verga|mierda|cabron|culero|marica|maricon|idiota|imbecil|estupid|zorra|joto|naco|perra|coño|gilipoll|malparid|hijueputa|huevon|weon|culiao)'
$$;

-- Lo que ve cualquiera: propuestas publicadas con su número de votos (sin el autor)
create or replace function public.listar_propuestas()
returns table(id bigint, tipo text, titulo text, descripcion text, estado text, motivo text, respuesta text, enlace text, votos int, actualizada timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.tipo, p.titulo, p.descripcion, p.estado, p.motivo, p.respuesta, p.enlace,
         (select count(*)::int from public.votos v where v.propuesta = p.id), p.actualizada
  from public.propuestas p
  where p.estado not in ('pendiente','rechazada')
  order by p.estado = 'votacion' desc, p.id
$$;

create or replace function public.mis_votos(p_dispositivo uuid) returns setof bigint
language sql stable security definer set search_path = public as $$
  select propuesta from public.votos where dispositivo = p_dispositivo
$$;

-- Votar: solo propuestas en votación, 1 por propuesta (repetir no suma) y máximo 3 votos activos por dispositivo.
-- Al llegar a 5 votos la propuesta pasa sola a "aprobada".
create or replace function public.votar(p_dispositivo uuid, p_propuesta bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_estado text; v_activos int; v_total int;
begin
  if p_dispositivo is null then raise exception 'sin_dispositivo'; end if;
  select estado into v_estado from public.propuestas where id = p_propuesta for update;   -- bloquea: dos votos a la vez no se pisan
  if v_estado is null then raise exception 'no_existe'; end if;
  if v_estado <> 'votacion' then raise exception 'cerrada'; end if;
  if exists(select 1 from public.votos where dispositivo = p_dispositivo and propuesta = p_propuesta) then
    select count(*) into v_total from public.votos where propuesta = p_propuesta;
    return json_build_object('votos', v_total, 'estado', v_estado, 'repetido', true);
  end if;
  select count(*) into v_activos from public.votos v join public.propuestas p on p.id = v.propuesta
    where v.dispositivo = p_dispositivo and p.estado = 'votacion';
  if v_activos >= 3 then raise exception 'limite_votos'; end if;
  insert into public.votos(dispositivo, propuesta) values (p_dispositivo, p_propuesta);
  select count(*) into v_total from public.votos where propuesta = p_propuesta;
  if v_total >= 5 then update public.propuestas set estado = 'aprobada' where id = p_propuesta; v_estado := 'aprobada'; end if;
  return json_build_object('votos', v_total, 'estado', v_estado, 'repetido', false);
end $$;

-- Quitar el voto (para moverlo a otra): solo mientras la propuesta sigue en votación
create or replace function public.quitar_voto(p_dispositivo uuid, p_propuesta bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_total int;
begin
  if exists(select 1 from public.propuestas where id = p_propuesta and estado <> 'votacion') then raise exception 'cerrada'; end if;
  delete from public.votos where dispositivo = p_dispositivo and propuesta = p_propuesta;
  select count(*) into v_total from public.votos where propuesta = p_propuesta;
  return json_build_object('votos', v_total);
end $$;

-- Proponer: queda "pendiente" (no se ve) hasta que el administrador la apruebe. Máximo 2 por dispositivo cada 7 días.
create or replace function public.proponer(p_dispositivo uuid, p_tipo text, p_titulo text, p_descripcion text) returns json
language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_titulo text := btrim(coalesce(p_titulo,'')); v_desc text := btrim(coalesce(p_descripcion,''));
begin
  if p_dispositivo is null then raise exception 'sin_dispositivo'; end if;
  if p_tipo not in ('curso','tema','libro') then raise exception 'tipo'; end if;
  if char_length(v_titulo) < 3 or char_length(v_titulo) > 60 then raise exception 'titulo'; end if;
  if char_length(v_desc) > 280 then raise exception 'descripcion'; end if;
  if public.ofensivo(v_titulo) or public.ofensivo(v_desc) then raise exception 'ofensivo'; end if;
  if (select count(*) from public.propuestas where autor = p_dispositivo and creada > now() - interval '7 days') >= 2 then raise exception 'limite_propuestas'; end if;
  insert into public.propuestas(tipo, titulo, descripcion, autor) values (p_tipo, v_titulo, v_desc, p_dispositivo) returning id into v_id;
  return json_build_object('id', v_id, 'estado', 'pendiente');
end $$;

revoke all on function public.votar(uuid,bigint), public.quitar_voto(uuid,bigint), public.proponer(uuid,text,text,text),
  public.listar_propuestas(), public.mis_votos(uuid) from public;
grant execute on function public.votar(uuid,bigint), public.quitar_voto(uuid,bigint), public.proponer(uuid,text,text,text),
  public.listar_propuestas(), public.mis_votos(uuid), public.es_admin() to anon, authenticated;

-- Contenido inicial (solo si la tabla está vacía)
insert into public.propuestas(tipo, titulo, descripcion, estado, enlace, respuesta)
select * from (values
  ('curso','Excel','Fórmulas, funciones, búsqueda, tablas dinámicas y gráficos, con una mini hoja de cálculo.','disponible','cursos/excel','¡Ya está disponible!'),
  ('curso','Python desde cero','Variables, condiciones, ciclos, funciones y pequeños proyectos.','votacion',null,null),
  ('curso','Redes Cisco CCNA','Conmutación, enrutamiento, VLAN, OSPF y seguridad, con práctica tipo examen.','votacion',null,null),
  ('curso','Linux básico','Terminal, archivos, permisos, procesos y scripts sencillos.','votacion',null,null),
  ('curso','Finanzas personales','Presupuesto, ahorro, deudas, interés compuesto e inversión básica.','votacion',null,null),
  ('curso','Power BI','Importar datos, modelos, medidas DAX básicas y tableros.','votacion',null,null),
  ('tema','Probabilidad avanzada','Variables aleatorias, distribuciones continuas y teorema central del límite.','votacion',null,null),
  ('tema','Física I','Cinemática, leyes de Newton, trabajo y energía.','votacion',null,null),
  ('tema','Química básica','Materia, átomos, tabla periódica, enlaces y estequiometría.','votacion',null,null),
  ('tema','Inglés para entrevistas','Presentarte, hablar de tu experiencia y responder preguntas típicas.','votacion',null,null)
) as s(tipo, titulo, descripcion, estado, enlace, respuesta)
where not exists (select 1 from public.propuestas);

-- Para hacerte administrador (UNA vez, después de iniciar sesión desde la app con tu correo):
--   insert into public.admins(usuario) select id from auth.users where email = 'TU_CORREO';
-- (Se corre en el SQL Editor; tu correo no queda en este archivo ni en el repositorio.)
