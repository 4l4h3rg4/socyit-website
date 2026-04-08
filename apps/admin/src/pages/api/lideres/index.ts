import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async (context) => {
  let body: Record<string, unknown> = {};
  try { body = await context.request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = createAuthClient(context);
  const { data, error } = await supabase.from('lideres').insert(body).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
