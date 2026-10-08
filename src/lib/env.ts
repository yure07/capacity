import "server-only";

// Somente variáveis públicas (URL + publishable key). A Service Role Key
// nunca deve ser lida aqui nem enviada ao navegador.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}. Verifique o arquivo .env.`);
  }
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
};

/**
 * URL pública da aplicação (ex.: https://seu-dominio), usada nos links de
 * validação e QR Codes. Lida sob demanda para não quebrar páginas que não a usam.
 */
export function getAppUrl(): string {
  const value = required("APP_URL", process.env.APP_URL);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`APP_URL inválida: "${value}". Use algo como https://seu-dominio.`);
  }
  const isLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
  // http só é aceito localmente; um domínio real precisa de https nos QR Codes.
  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw new Error("APP_URL deve usar https:// (http:// apenas para localhost).");
  }
  return url.origin;
}
