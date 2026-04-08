-- ─────────────────────────────────────────────────────────────────────────────
-- Función para otorgar rol admin a un usuario por email.
-- Solo puede ser invocada con la service_role key (privilegio de superusuario).
--
-- USO (una vez que el usuario haya confirmado su email):
--   SELECT public.grant_admin_role('tu@email.com');
--
-- IMPORTANTE: tras ejecutar esto, el usuario debe cerrar sesión y volver
-- a iniciarla para que el JWT refleje el nuevo claim.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.grant_admin_role(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró ningún usuario con email: %', user_email;
  END IF;
END;
$$;

-- Revocar acceso público a la función — solo service_role puede llamarla
REVOKE ALL ON FUNCTION public.grant_admin_role FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_admin_role FROM anon;
REVOKE ALL ON FUNCTION public.grant_admin_role FROM authenticated;
