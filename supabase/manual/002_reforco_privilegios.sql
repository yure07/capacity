-- =====================================================================
-- EXECUÇÃO MANUAL no Supabase → SQL Editor (não é uma migration).
-- Reforço de segurança. NÃO apaga dados, NÃO altera colunas, NÃO mexe no RLS.
--
-- Contexto: por padrão o Supabase concede ALL (inclusive UPDATE, DELETE e
-- TRUNCATE) ao papel `authenticated` em tabelas do schema public. Hoje o RLS
-- já bloqueia UPDATE/DELETE (não existem policies para isso), mas TRUNCATE
-- não passa pelo RLS. Como o cadastro público de usuários está aberto,
-- qualquer pessoa pode virar `authenticated`. Aqui deixamos para esse papel
-- apenas o que o sistema usa: SELECT e INSERT (ambos ainda limitados ao admin
-- pelas policies existentes).
--
-- Impacto: nenhum no sistema (o app só usa SELECT/INSERT do admin e a função
-- validate_certificate). Reversível com GRANT.
-- =====================================================================

begin;

revoke update, delete, truncate, references, trigger
  on table public."CAPACITY" from authenticated;

-- Garantia: visitantes anônimos continuam sem nenhum privilégio na tabela.
revoke all on table public."CAPACITY" from anon;

commit;

-- Conferência: deve listar apenas INSERT e SELECT para authenticated,
-- e nada para anon.
-- select grantee, privilege_type
--   from information_schema.role_table_grants
--  where table_schema = 'public' and table_name = 'CAPACITY'
--    and grantee in ('anon', 'authenticated')
--  order by grantee, privilege_type;
