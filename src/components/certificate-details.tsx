import type { IssuedCertificate } from "@/types/certificate";

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function CertificateDetails({
  certificate,
  cpfMasked,
}: {
  certificate: IssuedCertificate;
  cpfMasked?: string | null;
}) {
  const fields: [string, string][] = [
    ["Aluno", certificate.student_name],
    ...(cpfMasked !== undefined ? [["CPF", cpfMasked ?? "—"] as [string, string]] : []),
    ["Curso", certificate.course_name],
    ["Carga horária", `${certificate.course_duration} horas`],
    ["Início", formatDate(certificate.start_date)],
    ["Conclusão", formatDate(certificate.completion_date)],
    ["Código (UID)", certificate.id],
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm sm:grid-cols-[140px_1fr] dark:border-zinc-800 dark:bg-zinc-900">
      {fields.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="font-medium text-zinc-500">{label}</dt>
          <dd className="whitespace-pre-line break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
