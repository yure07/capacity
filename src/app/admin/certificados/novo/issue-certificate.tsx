"use client";

import { useActionState, useState } from "react";
import { CertificateDetails } from "@/components/certificate-details";
import { MAX_COURSE_DURATION, type CertificateField } from "@/lib/validation/certificate";
import {
  issueCertificateAction,
  type IssueCertificateState,
} from "../../actions";
import { CopyButton } from "./copy-button";
import { QrCodePanel } from "./qr-code-panel";

const initialState: IssueCertificateState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function IssueCertificate() {
  // Trocar a key remonta o formulário e zera o estado da action.
  const [formKey, setFormKey] = useState(0);
  return <IssueFlow key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function IssueFlow({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(
    issueCertificateAction,
    initialState,
  );

  if (state.status === "success") {
    return <IssuedResult state={state} onReset={onReset} />;
  }

  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.fieldErrors : {};

  const field = (name: CertificateField) => ({
    name,
    defaultValue: values?.[name] ?? "",
    "aria-invalid": errors[name] ? true : undefined,
    className: inputClass,
  });

  const errorText = (name: CertificateField) =>
    errors[name] ? (
      <span className="mt-1 block text-xs text-red-700 dark:text-red-400">{errors[name]}</span>
    ) : null;

  return (
    <form action={formAction} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
      <label className="block text-sm font-medium sm:col-span-2">
        Nome do aluno
        <input {...field("student_name")} required maxLength={200} />
        {errorText("student_name")}
      </label>

      <label className="block text-sm font-medium">
        CPF
        <input
          {...field("cpf")}
          required
          inputMode="numeric"
          placeholder="000.000.000-00"
          maxLength={14}
        />
        {errorText("cpf")}
      </label>

      <label className="block text-sm font-medium">
        Carga horária (horas)
        <input
          {...field("course_duration")}
          type="number"
          required
          min={1}
          max={MAX_COURSE_DURATION}
          step={1}
        />
        {errorText("course_duration")}
      </label>

      <label className="block text-sm font-medium sm:col-span-2">
        Nome do curso
        <textarea {...field("course_name")} required maxLength={300} rows={2} />
        {errorText("course_name")}
      </label>

      <label className="block text-sm font-medium">
        Data de início
        <input {...field("start_date")} type="date" required />
        {errorText("start_date")}
      </label>

      <label className="block text-sm font-medium">
        Data de conclusão
        <input {...field("completion_date")} type="date" required />
        {errorText("completion_date")}
      </label>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Emitindo…" : "Emitir certificado"}
        </button>
      </div>
    </form>
  );
}

function IssuedResult({
  state,
  onReset,
}: {
  state: Extract<IssueCertificateState, { status: "success" }>;
  onReset: () => void;
}) {
  const { certificate, validationUrl } = state;

  return (
    <section className="mt-8 space-y-6">
      <p
        role="status"
        className="rounded border border-green-300 bg-green-50 p-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
      >
        ✓ Certificado emitido e salvo no banco de dados.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]">
        <CertificateDetails certificate={certificate} />
        <QrCodePanel url={validationUrl} fileName={`qrcode-certificado-${certificate.id}.png`} />
      </div>

      <div className="space-y-1 text-sm">
        <p className="font-medium">URL pública de validação</p>
        <a
          href={validationUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all text-blue-700 underline dark:text-blue-400"
        >
          {validationUrl}
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={certificate.id} label="Copiar UID" />
        <CopyButton value={validationUrl} label="Copiar URL" />
        <button
          type="button"
          onClick={onReset}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Emitir outro certificado
        </button>
      </div>
    </section>
  );
}
