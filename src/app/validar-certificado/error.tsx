"use client";

import { useEffect } from "react";

// Captura erros inesperados de /validar-certificado e /validar-certificado/[id].
// O detalhe técnico vai só para o console; o visitante vê uma mensagem neutra.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Validação de certificado</h1>
      <div
        role="alert"
        className="mt-6 rounded border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        <p className="font-medium">Não foi possível consultar o certificado no momento.</p>
        <p className="mt-1">Tente novamente em alguns instantes.</p>
        {error.digest && <p className="mt-2 text-xs text-zinc-500">Código: {error.digest}</p>}
      </div>
      <button
        onClick={() => retry()}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Tentar novamente
      </button>
    </main>
  );
}
