import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import type { AstroCookies } from 'astro';

type CookieContext = {
  request: Request;
  cookies: AstroCookies;
};

function cookieHandlers(context: CookieContext) {
  return {
    getAll() {
      return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
    },
    setAll(
      cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
    ) {
      cookiesToSet.forEach(({ name, value, options }) =>
        context.cookies.set(name, value, options as Parameters<AstroCookies['set']>[2])
      );
    },
  };
}

/**
 * Cliente de autenticación — usa ANON_KEY + cookies del usuario.
 * Úsalo para: validar sesión (getUser), login, logout.
 * NUNCA uses este cliente para mutaciones de datos.
 */
export function createAuthClient(context: CookieContext) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    { cookies: cookieHandlers(context) }
  );
}

/**
 * Cliente admin — usa SERVICE_ROLE_KEY, bypasea RLS.
 * Úsalo SOLO tras haber verificado la sesión con createAuthClient().
 * Úsalo para: leer datos protegidos (ej: lista de suscriptores con emails).
 *
 * IMPORTANTE: para INSERT/UPDATE/DELETE usa createAuthClient() con la sesión
 * del usuario, NO este cliente, para que los triggers de auditoría capturen
 * el auth.uid() correctamente.
 */
export function createAdminClient(context: CookieContext) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: cookieHandlers(context) }
  );
}
