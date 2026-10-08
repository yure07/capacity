"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { error: null, email: "" };

const inputClass =
  "mt-1 w-full rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block text-sm font-medium">
        E-mail
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        Senha
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
