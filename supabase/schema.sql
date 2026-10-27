-- =====================================================================
-- EcoCanje Huancayo · esquema de base de datos para Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------- Tablas ----------
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('comerciante','vendedor','comprador','admin')),
  stall text,
  phone text,
  member_code text unique not null default ('EC-' || upper(substr(md5(random()::text), 1, 6))),
  family_id uuid references public.families(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id serial primary key,
  name text not null,
  kind text not null check (kind in ('organico','reciclable')),
  points_per_kg numeric not null,
  co2_per_kg numeric not null,
  active boolean not null default true
);

create table if not exists public.rewards (
  id serial primary key,
  name text not null,
  description text,
  points int not null check (points > 0),
  price numeric,
  stock int not null default 0 check (stock >= 0),
  emoji text default '🎁',
  active boolean not null default true
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id int not null references public.materials(id),
  kg numeric not null check (kg > 0),
  points int not null,
  co2_kg numeric not null,
  registered_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id int not null references public.rewards(id),
  points int not null,
  status text not null default 'pendiente' check (status in ('pendiente','entregado')),
  created_at timestamptz not null default now()
);

-- ---------- Funciones auxiliares ----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.my_family() returns uuid
language sql security definer stable set search_path = public as $$
  select family_id from profiles where id = auth.uid()
$$;

-- Crea el perfil automáticamente cuando alguien se registra.
-- El rol "admin" NUNCA se puede elegir desde el registro.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'role', 'comprador');
begin
  if r not in ('comerciante','vendedor','comprador') then r := 'comprador'; end if;
  insert into public.profiles (id, full_name, role, stall, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Usuario'),
    r,
    nullif(new.raw_user_meta_data->>'stall', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Seguridad (Row Level Security) ----------
alter table public.families    enable row level security;
alter table public.profiles    enable row level security;
alter table public.materials   enable row level security;
alter table public.rewards     enable row level security;
alter table public.deposits    enable row level security;
alter table public.redemptions enable row level security;

create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.is_admin()
         or (family_id is not null and family_id = public.my_family()));
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- Solo se pueden editar estas columnas (el rol y el código no se tocan)
revoke update on public.profiles from authenticated;
grant update (full_name, stall, phone) on public.profiles to authenticated;

create policy "families_select" on public.families for select
  using (id = public.my_family() or public.is_admin());

create policy "materials_read"  on public.materials for select using (true);
create policy "materials_admin" on public.materials for all
  using (public.is_admin()) with check (public.is_admin());

create policy "rewards_read"  on public.rewards for select using (true);
create policy "rewards_admin" on public.rewards for all
  using (public.is_admin()) with check (public.is_admin());

create policy "deposits_select" on public.deposits for select
  using (user_id = auth.uid() or public.is_admin()
         or exists (select 1 from profiles p where p.id = deposits.user_id
                    and p.family_id is not null and p.family_id = public.my_family()));

create policy "redemptions_select" on public.redemptions for select
  using (user_id = auth.uid() or public.is_admin()
         or exists (select 1 from profiles p where p.id = redemptions.user_id
                    and p.family_id is not null and p.family_id = public.my_family()));
create policy "redemptions_admin_update" on public.redemptions for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Funciones de negocio (RPC) ----------
-- Saldo de EcoPuntos: personal, o familiar si el usuario pertenece a una familia
create or replace function public.my_balance() returns json
language plpgsql security definer stable set search_path = public as $$
declare fam uuid := public.my_family(); earned int; spent int;
begin
  select coalesce(sum(d.points), 0) into earned
    from deposits d join profiles p on p.id = d.user_id
    where p.id = auth.uid() or (fam is not null and p.family_id = fam);
  select coalesce(sum(r.points), 0) into spent
    from redemptions r join profiles p on p.id = r.user_id
    where p.id = auth.uid() or (fam is not null and p.family_id = fam);
  return json_build_object('earned', earned, 'spent', spent,
                           'balance', earned - spent, 'family', fam is not null);
end $$;

-- El operador registra lo que el socio entrega en el punto EcoCanje
create or replace function public.register_deposit(p_code text, p_material int, p_kg numeric)
returns json language plpgsql security definer set search_path = public as $$
declare u uuid; m materials; pts int; co2 numeric;
begin
  if not public.is_admin() then raise exception 'No tienes permiso para registrar entregas'; end if;
  if p_kg is null or p_kg <= 0 then raise exception 'El peso debe ser mayor a 0'; end if;
  select id into u from profiles where member_code = upper(trim(p_code));
  if u is null then raise exception 'No existe un socio con ese código'; end if;
  select * into m from materials where id = p_material and active;
  if not found then raise exception 'Material no válido'; end if;
  pts := round(p_kg * m.points_per_kg);
  co2 := round(p_kg * m.co2_per_kg, 2);
  insert into deposits (user_id, material_id, kg, points, co2_kg, registered_by)
  values (u, m.id, p_kg, pts, co2, auth.uid());
  return json_build_object('points', pts, 'co2', co2);
end $$;

-- Canje de premios (valida saldo y stock)
create or replace function public.redeem_reward(p_reward int) returns void
language plpgsql security definer set search_path = public as $$
declare rw rewards; bal int;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para canjear'; end if;
  select * into rw from rewards where id = p_reward and active for update;
  if not found then raise exception 'Premio no disponible'; end if;
  if rw.stock <= 0 then raise exception 'Premio agotado'; end if;
  bal := (public.my_balance()->>'balance')::int;
  if bal < rw.points then raise exception 'EcoPuntos insuficientes'; end if;
  update rewards set stock = stock - 1 where id = rw.id;
  insert into redemptions (user_id, reward_id, points) values (auth.uid(), rw.id, rw.points);
end $$;

-- Familias (puntos compartidos para compradores)
create or replace function public.create_family(p_name text) returns void
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Escribe un nombre para la familia'; end if;
  insert into families (name) values (trim(p_name)) returning id into f;
  update profiles set family_id = f where id = auth.uid();
end $$;

create or replace function public.join_family(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión'; end if;
  select id into f from families where code = upper(trim(p_code));
  if f is null then raise exception 'No existe una familia con ese código'; end if;
  update profiles set family_id = f where id = auth.uid();
end $$;

create or replace function public.leave_family() returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set family_id = null where id = auth.uid();
end $$;

-- ---------- Datos iniciales ----------
-- Regla de la economía de puntos: 1 EcoPunto = S/ 0.10.
-- Los puntos por kg salen del precio al que paga la recicladora:
--   plásticos valorizables S/ 1.00/kg (dato real) · cartón S/ 0.20/kg (dato real)
--   PET S/ 1.50/kg y latas S/ 3.00/kg (ESTIMADOS: confirmar con la recicladora)
--   restos orgánicos: 0.5 punto/kg, apoyo simbólico (no tienen precio de mercado)
-- Los factores de CO2 son referenciales: cita la fuente que uses en tu informe.
insert into public.materials (name, kind, points_per_kg, co2_per_kg) values
  ('Restos de frutas y verduras', 'organico',   0.5, 0.5),
  ('Cartón limpio',               'reciclable', 2,   0.9),
  ('Botellas PET',                'reciclable', 15,  1.5),
  ('Plásticos valorizables',      'reciclable', 10,  1.2),
  ('Latas',                       'reciclable', 30,  8.0);

-- Premios con precios reales de mercado (price = valor referencial en soles)
insert into public.rewards (name, description, points, price, stock, emoji) values
  ('Bolsa reutilizable de tela',     'Para tus compras en el mercado', 10, 1.00, 30, '👜'),
  ('Bolsas para residuos (10 un.)',  'Bolsas resistentes para tu puesto', 15, 1.40, 30, '🗑️'),
  ('Lejía 636 ml',                   'Desinfección de puestos y pisos', 20, 2.00, 20, '🧴'),
  ('Jabón de lavar (1 barra)',       'Jabón en barra multiuso', 25, 2.30, 20, '🧼'),
  ('Detergente 500 g',               'Detergente en polvo', 30, 2.70, 20, '🫧'),
  ('Bolsas biodegradables (20 un.)', 'Para residuos orgánicos', 40, 4.00, 15, '🌱'),
  ('Plantita ornamental',            'Una planta pequeña para tu puesto o tu casa', 40, 4.00, 10, '🪴'),
  ('Papel higiénico (4 rollos)',     'Para el hogar o el puesto', 45, 4.30, 15, '🧻'),
  ('Esponjas de cocina (3 un.)',     'Para limpiar mesas y utensilios', 60, 6.00, 10, '🧽'),
  ('Guantes de limpieza',            'Guantes resistentes para limpiar', 100, 10.00, 5, '🧤'),
  ('Kit de limpieza',                'Lejía, detergente, jabón y esponjas (3 un.)', 130, 13.00, 5, '🧹');
