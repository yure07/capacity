-- =====================================================================
-- EXECUÇÃO MANUAL no Supabase → SQL Editor (não é uma migration).
-- Não altera colunas da tabela public."CAPACITY": apenas permissões,
-- policies de RLS e uma função de validação pública.
--
-- Antes de executar:
--   1. Crie o usuário administrador em Authentication → Users → Add user
--      (e-mail + senha, marque "Auto Confirm User").
--   2. Troque 'EMAIL_DO_ADMIN@exemplo.com' no passo 4 pelo e-mail dele.
--      Se o e-mail não corresponder a exatamente 1 usuário, o script
--      inteiro é cancelado (nenhuma alteração parcial).
-- =====================================================================

begin;

-- 1. Fecha o acesso direto de visitantes anônimos à tabela ----------------
--    (a policy antiga permitia ler todas as colunas, inclusive o CPF completo)
drop policy if exists "Public can validate certificates" on public."CAPACITY";
revoke all on table public."CAPACITY" from anon;

alter table public."CAPACITY" enable row level security;

-- 2. Somente o administrador (app_metadata.role = 'admin') lê e insere -----
--    app_metadata só pode ser alterado pelo painel/SQL, nunca pelo usuário.
grant select, insert on table public."CAPACITY" to authenticated;

drop policy if exists "Admin can insert certificates" on public."CAPACITY";
create policy "Admin can insert certificates"
  on public."CAPACITY"
  for insert
  to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Necessária para o insert(...).select() devolver o id gerado pelo banco.
drop policy if exists "Admin can read certificates" on public."CAPACITY";
create policy "Admin can read certificates"
  on public."CAPACITY"
  for select
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- (Sem policies de UPDATE/DELETE: ninguém altera ou apaga via API.)

-- 3. Validação pública: um certificado por id, CPF mascarado no banco ------
create or replace function public.validate_certificate(p_id uuid)
returns table (
  id uuid,
  course_name text,
  student_name text,
  course_duration integer,
  start_date date,
  completion_date date,
  cpf_masked text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id::uuid,
    c.course_name::text,
    c.student_name::text,
    c.course_duration::integer,
    c.start_date::date,
    c.completion_date::date,
    case
      when length(d.digits) = 11
        then '***.' || substr(d.digits, 4, 3) || '.' || substr(d.digits, 7, 3) || '-**'
    end
  from public."CAPACITY" c
  cross join lateral (
    select regexp_replace(coalesce(c.cpf::text, ''), '\D', '', 'g') as digits
  ) d
  where c.id::uuid = p_id;
$$;

revoke all on function public.validate_certificate(uuid) from public, anon, authenticated;
grant execute on function public.validate_certificate(uuid) to anon, authenticated;

-- 4. Define o administrador único ------------------------------------------
--    Localiza o usuário real pelo e-mail e grava role = 'admin' no
--    app_metadata dele. Se não houver exatamente 1 usuário, nada é aplicado.
do $$
declare
  v_email   text := 'rafaelyure53@gmail.com';  -- ← troque pelo e-mail do admin
  v_user_id uuid;
  v_count   integer;
begin
  select count(*) into v_count from auth.users where lower(email) = lower(trim(v_email));
  if v_count <> 1 then
    raise exception 'Esperado 1 usuário com o e-mail %, encontrados %. Nada foi alterado.', v_email, v_count;
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(trim(v_email));

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('role', 'admin')
   where id = v_user_id;

  raise notice 'Administrador definido: % (id %)', v_email, v_user_id;
end;
$$;

commit;

-- Conferência (opcional) ---------------------------------------------------
-- select policyname, roles, cmd from pg_policies
--  where schemaname = 'public' and tablename = 'CAPACITY';
-- select email, raw_app_meta_data from auth.users
--  where raw_app_meta_data ->> 'role' = 'admin';   -- deve retornar 1 linha
