import type { Metadata } from "next";
import { connection } from "next/server";
import { CertificateDetails } from "@/components/certificate-details";
import { CertificateSearchForm } from "@/components/certificate-search-form";
import { getCertificateById } from "@/lib/repositories/certificates";

export const metadata: Metadata = {
  title: "Validação de certificado",
  robots: { index: false },
};

export default async function ValidateCertificatePage({
  params,
}: PageProps<"/validar-certificado/[id]">) {
  // A validação sempre consulta o banco na hora da requisição (nunca no pré-render).
  await connection();
  const { id } = await params;
  const code = safeDecode(id);
  const result = await getCertificateById(code);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Validação de certificado</h1>

      {result.status === "found" && (
        <div className="mt-6 space-y-4">
          <p className="rounded border border-green-300 bg-green-50 p-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            ✓ Certificado válido
          </p>
          <CertificateDetails
            certificate={result.certificate}
            cpfMasked={result.certificate.cpf_masked}
          />
        </div>
      )}

      {(result.status === "not_found" || result.status === "invalid_id") && (
        <div
          role="alert"
          className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <p className="font-medium">Certificado não validado.</p>
          <p className="mt-1">
            {result.status === "not_found"
              ? "Não foi encontrado um certificado correspondente ao código informado."
              : "O código informado não está no formato correto. Confira o código impresso no certificado."}
          </p>
        </div>
      )}

      {result.status === "unavailable" && (
        <div
          role="alert"
          className="mt-6 rounded border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <p className="font-medium">Não foi possível consultar o certificado no momento.</p>
          <p className="mt-1">
            O serviço de validação está temporariamente indisponível. Tente novamente em
            alguns instantes.
          </p>
        </div>
      )}

      {result.status !== "found" && (
        <CertificateSearchForm defaultValue={result.status === "unavailable" ? code : ""} />
      )}
    </main>
  );
}

// Um código com "%" malformado não deve virar erro: segue para a validação de formato.
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
