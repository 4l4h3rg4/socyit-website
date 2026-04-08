// API route: POST /api/suscribir
// Guarda el email en Supabase para el newsletter de eventos

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = (body?.email ?? '').trim().toLowerCase();

    // Validación básica del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar en Supabase (ignora duplicados)
    const { error } = await supabase
      .from('suscriptores_eventos')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      console.error('[suscribir] Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Error al guardar. Intentá de nuevo.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[suscribir] Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: 'Error inesperado.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
