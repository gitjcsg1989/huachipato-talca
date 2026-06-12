"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-brand hover:bg-brand/90 text-white"
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@escuelahuachipato.cl"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-bad" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
