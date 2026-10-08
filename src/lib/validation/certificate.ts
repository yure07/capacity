import type { NewCertificate } from "@/types/certificate";

export const CERTIFICATE_FIELDS = [
  "student_name",
  "cpf",
  "course_name",
  "course_duration",
  "start_date",
  "completion_date",
] as const;

export type CertificateField = (typeof CERTIFICATE_FIELDS)[number];
export type CertificateFormValues = Record<CertificateField, string>;
export type FieldErrors = Partial<Record<CertificateField, string>>;

export const MAX_COURSE_DURATION = 9999;

/** Valida os dígitos verificadores do CPF. */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

/** Mesmo formato do registro existente no banco: 000.000.000-00 */
export function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function readCertificateForm(formData: FormData): CertificateFormValues {
  const values = {} as CertificateFormValues;
  for (const field of CERTIFICATE_FIELDS) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw.trim() : "";
  }
  return values;
}

export function validateCertificate(
  values: CertificateFormValues,
): { ok: true; data: NewCertificate } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!values.student_name) errors.student_name = "Informe o nome do aluno.";
  else if (values.student_name.length > 200) errors.student_name = "Máximo de 200 caracteres.";

  if (!values.cpf) errors.cpf = "Informe o CPF.";
  else if (!isValidCpf(values.cpf)) errors.cpf = "CPF inválido.";

  if (!values.course_name) errors.course_name = "Informe o nome do curso.";
  else if (values.course_name.length > 300) errors.course_name = "Máximo de 300 caracteres.";

  const duration = Number(values.course_duration);
  if (!values.course_duration) errors.course_duration = "Informe a carga horária.";
  else if (!Number.isInteger(duration) || duration < 1 || duration > MAX_COURSE_DURATION) {
    errors.course_duration = `Use um número inteiro de horas entre 1 e ${MAX_COURSE_DURATION}.`;
  }

  if (!values.start_date) errors.start_date = "Informe a data de início.";
  else if (!isValidIsoDate(values.start_date)) errors.start_date = "Data inválida.";

  if (!values.completion_date) errors.completion_date = "Informe a data de conclusão.";
  else if (!isValidIsoDate(values.completion_date)) errors.completion_date = "Data inválida.";
  else if (!errors.start_date && values.completion_date < values.start_date) {
    errors.completion_date = "A conclusão não pode ser anterior ao início.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      student_name: values.student_name,
      cpf: formatCpf(values.cpf),
      course_name: values.course_name,
      course_duration: duration,
      start_date: values.start_date,
      completion_date: values.completion_date,
    },
  };
}
