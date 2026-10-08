"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
    >
      {status === "copied" ? "Copiado!" : status === "failed" ? "Falha ao copiar" : label}
    </button>
  );
}
