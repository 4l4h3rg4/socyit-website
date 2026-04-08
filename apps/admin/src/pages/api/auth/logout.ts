import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async (context) => {
  const supabase = createAuthClient(context);
  await supabase.auth.signOut();

  return context.redirect('/login');
};
