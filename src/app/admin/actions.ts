"use server";

import { redirect } from "next/navigation";
import { getAdminUser, isAdmin } from "@/lib/auth/admin";
import { buildValidationUrl } from "@/lib/routes";
import { getAppUrl } from "@/lib/env";
import { createCertificate } from "@/lib/repositories/certificates";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";
import {
  readCertificateForm,
  validateCertificate,
  type CertificateFormValues,
  type FieldErrors,
} from "@/lib/validation/certificate";
import type { IssuedCertificate } from "@/types/certificate";

// ---------------------------------------------------------------- login ---

export type LoginState = { error: string | null; email: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha.", email };

  const supabase = await createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "E-mail ou senha incorretos."
        : `Não foi possível entrar: ${error.message}`;
    return { error: message, email };
  }

  // Autenticado não significa autorizado: só o admin pode continuar.
  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return { error: "Este usuário não tem permissão de administrador.", email };
  }

  redirect("/admin/certificados/novo");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// --------------------------------------------------------------- emissão ---

export type IssueCertificateState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: FieldErrors;
      values: CertificateFormValues;
    }
  | {
      status: "success";
      certificate: IssuedCertificate;
      validationUrl: string;
    };

export async function issueCertificateAction(
  _prev: IssueCertificateState,
  formData: FormData,
): Promise<IssueCertificateState> {
  const values = readCertificateForm(formData);

  // Toda action revalida a autorização: não confia na página que a chamou.
  const admin = await getAdminUser();
  if (!admin) {
    return {
      status: "error",
      message: "Sessão expirada ou usuário sem permissão. Entre novamente.",
      fieldErrors: {},
      values,
    };
  }

  const validation = validateCertificate(values);
  if (!validation.ok) {
    return {
      status: "error",
      message: "Corrija os campos destacados.",
      fieldErrors: validation.errors,
      values,
    };
  }

  let appUrl: string;
  try {
    appUrl = getAppUrl();
  } catch (cause) {
    // Verificado antes do insert para não salvar um certificado sem link válido.
    return {
      status: "error",
      message: cause instanceof Error ? cause.message : "APP_URL não configurada.",
      fieldErrors: {},
      values,
    };
  }

  const result = await createCertificate(validation.data);
  if (result.error !== null) {
    return {
      status: "error",
      message: `O certificado não foi salvo. ${result.error}`,
      fieldErrors: {},
      values,
    };
  }

  // Só aqui, com o registro confirmado, o id do banco vira URL de validação.
  return {
    status: "success",
    certificate: result.data,
    validationUrl: buildValidationUrl(appUrl, result.data.id),
  };
}
