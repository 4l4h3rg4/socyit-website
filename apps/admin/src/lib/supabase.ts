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
 * Cliente admin — usa ANON_KEY + sesión del usuario autenticado.
 * Las políticas RLS permiten al rol admin hacer todo.
 * Úsalo para: leer y escribir datos desde páginas del panel admin.
 */
export function createAdminClient(context: CookieContext) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    { cookies: cookieHandlers(context) }
  );
}
