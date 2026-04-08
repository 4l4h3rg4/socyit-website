import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const PUT: APIRoute = async (context) => {
  const { id } = context.params;
  let body: Record<string, unknown> = {};
  try { body = await context.request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = createAuthClient(context);
  const { data, error } = await supabase.from('lideres').update(body).eq('id', id!).select().single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async (context) => {
  const { id } = context.params;
  const supabase = createAuthClient(context);
  const { error } = await supabase.from('lideres').delete().eq('id', id!);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
