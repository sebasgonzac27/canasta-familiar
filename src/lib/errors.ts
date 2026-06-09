/** Map Supabase / Postgres errors to friendly Spanish messages. */
export function friendlyError(err: unknown): string {
  const msg = (err as any)?.message ? String((err as any).message) : String(err ?? "");
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Confirma tu correo antes de iniciar sesión.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese correo.";
  if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Revisa tu correo, parece incompleto.";
  if (m.includes("invalid_code") || m.includes("invalid code")) return "Código de invitación no válido.";
  if (m.includes("not_authenticated")) return "Inicia sesión para continuar.";
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Espera un momento.";
  if (m.includes("network") || m.includes("fetch")) return "Sin conexión. Revisa tu internet.";
  return msg || "Algo salió mal. Inténtalo de nuevo.";
}
