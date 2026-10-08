import "server-only";

import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  IssuedCertificate,
  NewCertificate,
  PublicCertificate,
} from "@/types/certificate";

// Tabela criada com nome em maiúsculas: o PostgREST diferencia maiúsculas.
const TABLE = "CAPACITY";

// Consulta pública via função do banco: um registro por id, CPF já mascarado.
// Visitantes anônimos não têm acesso direto à tabela.
const PUBLIC_VALIDATION_RPC = "validate_certificate";

// Colunas devolvidas ao admin após o insert (o CPF não volta).
const ISSUED_COLUMNS =
  "id, course_name, student_name, course_duration, start_date, completion_date";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RepositoryResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

type SupabaseError = { code?: string; message: string };

function describeError(error: SupabaseError): string {
  // Sem `code` = falha de rede/conexão (o fetch nem chegou ao PostgREST).
  if (!error.code) return `Falha de conexão com o Supabase: ${error.message}`;
  if (error.code === "42501") return "Permissão negada pelo banco de dados (RLS).";
  if (error.code === "PGRST202") {
    return "Função validate_certificate não encontrada. Execute o script supabase/manual/001_admin_e_validacao.sql.";
  }
  return `${error.code}: ${error.message}`;
}

export function isValidCertificateId(id: string): boolean {
  return UUID_REGEX.test(id);
}

export type CertificateLookup =
  | { status: "found"; certificate: PublicCertificate }
  | { status: "not_found" } // UUID válido sem registro no banco
  | { status: "invalid_id" } // código malformado (nem chega ao banco)
  | { status: "unavailable" }; // falha de rede/configuração: não dá para afirmar nada

/**
 * Busca pública pelo id. O certificado só é considerado válido se o banco
 * devolver o registro. Detalhes técnicos de erro ficam apenas no log do servidor.
 */
export async function getCertificateById(id: string): Promise<CertificateLookup> {
  if (!isValidCertificateId(id)) return { status: "invalid_id" };

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .rpc(PUBLIC_VALIDATION_RPC, { p_id: id })
      .maybeSingle<PublicCertificate>();

    if (error) {
      console.error("[validate_certificate]", describeError(error));
      return { status: "unavailable" };
    }
    return data ? { status: "found", certificate: data } : { status: "not_found" };
  } catch (cause) {
    console.error("[validate_certificate] falha inesperada", cause);
    return { status: "unavailable" };
  }
}

/**
 * Insere um certificado com a sessão do usuário logado (RLS exige admin) e
 * devolve o registro salvo, com o id gerado pelo banco.
 */
export async function createCertificate(
  input: NewCertificate,
): Promise<RepositoryResult<IssuedCertificate>> {
  const supabase = await createSupabaseAuthClient();

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(input)
      .select(ISSUED_COLUMNS)
      .single<IssuedCertificate>();

    if (error) return { data: null, error: describeError(error) };
    if (!data || !isValidCertificateId(String(data.id))) {
      return { data: null, error: "O banco não retornou o id do certificado inserido." };
    }
    return { data, error: null };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { data: null, error: `Falha de conexão com o Supabase: ${message}` };
  }
}
