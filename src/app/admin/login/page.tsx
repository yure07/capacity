import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Área administrativa</h1>
      <p className="mt-1 text-sm text-zinc-500">Acesso restrito ao administrador.</p>
      <LoginForm />
    </main>
  );
}
