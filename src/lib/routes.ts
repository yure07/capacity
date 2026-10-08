// Rota pública de validação: /validar-certificado/<uid> (usada também nos QR Codes).
export const VALIDATION_PATH = "/validar-certificado";

export function buildValidationUrl(appUrl: string, certificateId: string): string {
  return `${appUrl}${VALIDATION_PATH}/${encodeURIComponent(certificateId)}`;
}
