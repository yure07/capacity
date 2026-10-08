import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { logoutAction } from "../../actions";
import { IssueCertificate } from "./issue-certificate";

export default function NewCertificatePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Verificando acesso…</p>}
      >
        <AdminArea />
      </Suspense>
    </main>
  );
}

// Lê a sessão (cookies), por isso fica dentro do Suspense.
async function AdminArea() {
  const admin = await requireAdmin();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Emitir certificado</h1>
        <form action={logoutAction} className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">{admin.email}</span>
          <button className="rounded border border-zinc-300 px-3 py-1 dark:border-zinc-700">
            Sair
          </button>
        </form>
      </header>
      <IssueCertificate />
    </>
  );
}
