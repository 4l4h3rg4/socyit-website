import { defineMiddleware } from 'astro:middleware';
import { createAuthClient } from './lib/supabase';

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = new Set([
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (PUBLIC_ROUTES.has(pathname)) {
    return next();
  }

  const supabase = createAuthClient(context);

  // getUser() valida el JWT contra Supabase Auth remotamente.
  // NUNCA usar getSession() — solo lee la cookie sin verificar la firma.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  // Verificar claim admin en app_metadata del JWT
  const role = user.app_metadata?.role;
  if (role !== 'admin') {
    await supabase.auth.signOut();
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Acceso denegado.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login?reason=forbidden');
  }

  // Inyectar usuario en locals para todas las páginas
  context.locals.user = user;
  context.locals.adminEmail = user.email!;

  return next();
});
