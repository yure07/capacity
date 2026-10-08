import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";

export type AdminUser = { id: string; email: string };

/**
 * Apenas o usuário com app_metadata.role = 'admin' é administrador.
 * Estar autenticado não basta. app_metadata não é editável pelo usuário.
 * A mesma regra é aplicada pelo banco nas policies de RLS.
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}

/** Valida a sessão no servidor de Auth e retorna o admin, ou null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !isAdmin(data.user)) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}
