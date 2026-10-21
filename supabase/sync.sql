-- ☁️ Sincronizar entre dispositivos (Supabase / Postgres), en el MISMO proyecto que propuestas.sql.
-- Se pega completo en Supabase → SQL Editor → New query → Run. Se puede volver a correr: no borra datos.
-- La app usa SOLO la clave pública (anon / publishable) y la sesión de la persona (enlace mágico o Google).
-- La seguridad está aquí: Row Level Security en cada tabla y en el bucket de fotos. Cada quien ve y cambia SOLO lo suyo
-- (user_id = auth.uid()); sin sesión (anon) no se puede leer ni escribir nada. La clave service_role NUNCA va en la app.
-- Las claves de IA nunca se suben: la app no las incluye en nada de lo que sincroniza.
--
--   perfiles  una fila por persona: su nombre
--   progreso  filas clave → valor (jsonb): 'progreso' (todo el progreso combinado), 'borradas' (lápidas), 'usuario',
--             'mias:<id>' y 'gen:<id>' (Mis materias y lo generado con IA), 'foto:<id>' (datos de cada foto) y
--             'equipo:<id>' (cada dispositivo: nombre y última sincronización)
--   notas     una fila por nota del cuaderno (contenido jsonb); un borrado queda como borrado = true (lápida)
--   bucket notas-fotos (privado): fotos y dibujos en notas-fotos/<user_id>/<id>.<ext>

create table if not exists public.perfiles(
  user_id     uuid primary key references auth.users(id) on delete cascade,
  nombre      text check (char_length(nombre) <= 60),
  actualizado timestamptz not null default now()
);
create table if not exists public.progreso(
  user_id     uuid not null references auth.users(id) on delete cascade,
  clave       text not null check (char_length(clave) between 1 and 120),
  valor       jsonb not null check (pg_column_size(valor) <= 4000000),
  actualizado timestamptz not null default now(),
  dispositivo text check (char_length(dispositivo) <= 64),
  primary key (user_id, clave)
);
create table if not exists public.notas(
  user_id     uuid not null references auth.users(id) on delete cascade,
  id          text not null check (char_length(id) between 1 and 80),
  contenido   jsonb check (pg_column_size(contenido) <= 1000000),
  actualizado timestamptz not null default now(),
  borrado     boolean not null default false,
  primary key (user_id, id)
);
create index if not exists notas_actualizado on public.notas(user_id, actualizado);

-- actualizado lo pone el servidor (la app lo usa para no pisar cambios de otro dispositivo)
create or replace function public.tocar_actualizado() returns trigger language plpgsql as $$
begin new.actualizado := clock_timestamp(); return new; end $$;
drop trigger if exists perfiles_tocar on public.perfiles;
create trigger perfiles_tocar before insert or update on public.perfiles for each row execute function public.tocar_actualizado();
drop trigger if exists progreso_tocar on public.progreso;
create trigger progreso_tocar before insert or update on public.progreso for each row execute function public.tocar_actualizado();
drop trigger if exists notas_tocar on public.notas;
create trigger notas_tocar before insert or update on public.notas for each row execute function public.tocar_actualizado();

alter table public.perfiles enable row level security;
alter table public.progreso enable row level security;
alter table public.notas    enable row level security;

revoke all on public.perfiles, public.progreso, public.notas from anon;
grant select, insert, update, delete on public.perfiles, public.progreso, public.notas to authenticated;

drop policy if exists solo_lo_mio on public.perfiles;
create policy solo_lo_mio on public.perfiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists solo_lo_mio on public.progreso;
create policy solo_lo_mio on public.progreso for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists solo_lo_mio on public.notas;
create policy solo_lo_mio on public.notas for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Fotos: bucket privado, máximo 3 MB por archivo, solo imágenes; cada quien en su carpeta <user_id>/
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notas-fotos', 'notas-fotos', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists fotos_leer on storage.objects;
create policy fotos_leer on storage.objects for select to authenticated
  using (bucket_id = 'notas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fotos_subir on storage.objects;
create policy fotos_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'notas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fotos_cambiar on storage.objects;
create policy fotos_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'notas-fotos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'notas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fotos_borrar on storage.objects;
create policy fotos_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'notas-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Espacio de fotos: lo mío y el total del proyecto (para avisar antes del límite del plan gratuito, 1 GB).
-- security definer solo para sumar tamaños: no devuelve nombres ni datos de nadie.
create or replace function public.uso_fotos() returns json
language sql stable security definer set search_path = public, storage as $$
  select json_build_object(
    'mio',   coalesce(sum((metadata->>'size')::bigint) filter (where (storage.foldername(name))[1] = auth.uid()::text), 0),
    'total', coalesce(sum((metadata->>'size')::bigint), 0))
  from storage.objects where bucket_id = 'notas-fotos' and auth.uid() is not null;
$$;
revoke all on function public.uso_fotos() from public, anon;
grant execute on function public.uso_fotos() to authenticated;

-- «Borrar mi cuenta y mis datos»: la app primero borra sus fotos con la API de Storage y luego llama a esto,
-- que borra la cuenta; perfiles, progreso y notas se borran solos (on delete cascade).
create or replace function public.borrar_mi_cuenta() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
