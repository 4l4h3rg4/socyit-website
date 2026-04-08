import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

// Rate limiting simple en memoria — límite por IP
// Para producción considera Upstash Redis (@upstash/ratelimit)
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export const POST: APIRoute = async (context) => {
  const ip =
    context.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    context.request.headers.get('cf-connecting-ip') ??
    'unknown';

  const now = Date.now();
  const record = attempts.get(ip);

  // Verificar rate limit
  if (record && record.count >= MAX_ATTEMPTS && record.resetAt > now) {
    const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
    return new Response(
      JSON.stringify({ error: `Demasiados intentos. Espera ${minutesLeft} min.` }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { email?: string; password?: string } = {};
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Cuerpo de la solicitud inválido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email y contraseña son requeridos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createAuthClient(context);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    // Incrementar contador de intentos fallidos
    const current = attempts.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });

    return new Response(
      JSON.stringify({ error: 'Credenciales incorrectas.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verificar claim admin en el JWT antes de aceptar la sesión
  const role = data.user?.app_metadata?.role;
  if (role !== 'admin') {
    await supabase.auth.signOut();
    return new Response(
      JSON.stringify({ error: 'No tienes permisos de administrador.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Login correcto — limpiar contador
  attempts.delete(ip);

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
