import type { APIRoute } from 'astro';
import { createAdminClient } from '../../../lib/supabase';

export const GET: APIRoute = async (context) => {
  const supabase = createAdminClient(context);
  const { data, error } = await supabase
    .from('suscriptores_eventos')
    .select('email, suscrito_en')
    .order('suscrito_en', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const csv = [
    'email,suscrito_en',
    ...(data ?? []).map(
      row => `${row.email},${row.suscrito_en}`
    ),
  ].join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="suscriptores-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
};
