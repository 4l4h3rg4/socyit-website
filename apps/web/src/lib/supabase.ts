import { createClient } from '@supabase/supabase-js';

// Cliente público — para usar en el browser y en páginas SSG
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
