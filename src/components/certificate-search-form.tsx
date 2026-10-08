import { VALIDATION_PATH } from "@/lib/routes";

/** Formulário GET: /validar-certificado?id=<uid> redireciona para /validar-certificado/<uid>. */
export function CertificateSearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form className="mt-6 flex gap-2" action={VALIDATION_PATH}>
      <input
        name="id"
        defaultValue={defaultValue}
        placeholder="Código do certificado (UID)"
        aria-label="Código do certificado (UID)"
        required
        className="min-w-0 flex-1 rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
      />
      <button className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
        Validar
      </button>
    </form>
  );
}
