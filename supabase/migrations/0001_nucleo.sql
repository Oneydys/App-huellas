-- Huellas · Migración 0001: núcleo de datos.
-- Inactiva hasta que conectes Supabase. Aplícala en un proyecto de prueba antes que en producción.
--
-- Reglas:
--   * RLS activo en todas las tablas.
--   * Los clientes (anon y authenticated) solo leen o escriben sus propias filas (auth.uid() = user_id).
--   * accesos y compras no las escribe el cliente: solo el servidor, con la clave de servicio.
--   * Se revocan privilegios por defecto a anon. Nada queda abierto sin política.
--
-- Datos: no se guardan fotos, correos ni datos de contacto de la mascota. Las compras guardan
-- un hash SHA-256 del correo, nunca el correo en claro.

-- 1. Accesos: quién puede usar /app. Lo escribe solo el servidor (Hotmart y, después, el enlace con la cuenta).
create table public.accesos (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis', 'pro')), -- [VERIFICAR] nombres de plan
  activo boolean not null default false,
  actualizado_en timestamptz not null default now()
);

alter table public.accesos enable row level security;
revoke all on public.accesos from anon, authenticated;
grant select on public.accesos to authenticated;

-- Cada usuario lee solo su fila. No hay políticas de insert, update ni delete para clientes.
create policy accesos_leer_propio on public.accesos
  for select to authenticated
  using (auth.uid() = user_id);

-- 2. Compras: una fila por transacción de Hotmart. El webhook la escribe con la clave de servicio.
-- Sin privilegios ni políticas para clientes: ninguno la lee ni la escribe.
create table public.compras (
  transaccion text primary key check (char_length(transaccion) between 1 and 100),
  correo_hash text not null check (correo_hash ~ '^[0-9a-f]{64}$'), -- SHA-256 del correo en minúsculas
  evento text not null check (char_length(evento) between 1 and 60),
  estado text not null check (estado in ('activa', 'reembolsada', 'cancelada')),
  recibido_en timestamptz not null
);

create index compras_correo_hash_idx on public.compras (correo_hash);

alter table public.compras enable row level security;
revoke all on public.compras from anon, authenticated;

-- 3. Mascotas: el carnet de cada mascota. Mínimo: sin fotos ni datos de contacto.
create table public.mascotas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 24),
  especie text not null check (especie in ('perro', 'gato')),
  raza text not null default '' check (char_length(raza) <= 40),
  nacimiento date not null,
  nacimiento_aproximado boolean not null default true,
  personaje text not null check (char_length(personaje) between 1 and 40),
  creada_en timestamptz not null default now()
);

create index mascotas_user_id_idx on public.mascotas (user_id);

alter table public.mascotas enable row level security;
revoke all on public.mascotas from anon;
grant select, insert, update, delete on public.mascotas to authenticated;

-- Cada usuario lee, crea, cambia y borra solo sus mascotas. with check impide asignar una mascota a otro usuario.
create policy mascotas_propias on public.mascotas
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
