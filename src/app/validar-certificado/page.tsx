import type { Metadata } from "next";
import { CertificateSearchForm } from "@/components/certificate-search-form";

export const metadata: Metadata = { title: "Validar certificado" };

// Busca pública. O envio (?id=<uid>) é redirecionado pelo proxy para
// /validar-certificado/<uid>, o mesmo endereço usado nos QR Codes.
export default function ValidateSearchPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Validar certificado</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Informe o código (UID) impresso no certificado ou leia o QR Code.
      </p>
      <CertificateSearchForm />
    </main>
  );
}
