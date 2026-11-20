-- Crea la fila de acceso del plan gratis cuando se registra una cuenta nueva.
create or replace function public.crear_acceso_gratis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accesos (user_id, plan, activo)
  values (new.id, 'gratis', true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger crear_acceso_gratis_al_registrar
  after insert on auth.users
  for each row execute function public.crear_acceso_gratis();

-- Cuentas que ya existían: les damos el plan gratis si todavía no tienen fila.
insert into public.accesos (user_id, plan, activo)
select id, 'gratis', true from auth.users
on conflict (user_id) do nothing;
