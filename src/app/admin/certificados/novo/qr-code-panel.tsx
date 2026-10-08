"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type QrResult = { attempt: number; dataUrl: string | null; error: string | null };

/** Gera o QR Code (PNG) da URL de validação já confirmada pelo servidor. */
export function QrCodePanel({ url, fileName }: { url: string; fileName: string }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<QrResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 512, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => {
        if (!cancelled) setResult({ attempt, dataUrl, error: null });
      })
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : String(cause);
        if (!cancelled) setResult({ attempt, dataUrl: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  const current = result?.attempt === attempt ? result : null;

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-56">
      <div className="flex aspect-square w-full items-center justify-center rounded border border-zinc-200 bg-white p-2 dark:border-zinc-800">
        {!current && <span className="text-xs text-zinc-500">Gerando QR Code…</span>}
        {current?.dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL gerada localmente
          <img src={current.dataUrl} alt={`QR Code para ${url}`} className="h-full w-full" />
        )}
        {current?.error && (
          <span role="alert" className="px-2 text-center text-xs text-red-700">
            Erro ao gerar o QR Code: {current.error}
          </span>
        )}
      </div>

      {current?.dataUrl && (
        <a
          href={current.dataUrl}
          download={fileName}
          className="w-full rounded border border-zinc-300 px-4 py-2 text-center text-sm dark:border-zinc-700"
        >
          Baixar QR Code (PNG)
        </a>
      )}
      {current?.error && (
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="w-full rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
