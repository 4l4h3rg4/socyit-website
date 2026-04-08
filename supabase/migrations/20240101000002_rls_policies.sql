-- ─────────────────────────────────────────────────────────────────────────────
-- Función helper: devuelve true si el JWT del usuario tiene role = 'admin'
-- en app_metadata. Usada en todas las políticas de admin.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DIVISIONES
-- anon: puede leer solo divisiones activas (las que muestra el sitio público)
-- admin: puede leer todas (incluyendo inactivas) y hacer INSERT/UPDATE/DELETE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "public_read_active_divisiones"
  ON public.divisiones
  FOR SELECT
  TO anon
  USING (activa = true);

CREATE POLICY "admin_read_all_divisiones"
  ON public.divisiones
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_divisiones"
  ON public.divisiones
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_divisiones"
  ON public.divisiones
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_divisiones"
  ON public.divisiones
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- LIDERES
-- anon: puede leer todos (se muestran en las páginas de branch)
-- admin: acceso completo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "public_read_lideres"
  ON public.lideres
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "admin_all_lideres"
  ON public.lideres
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PROYECTOS
-- anon: puede leer proyectos activos
-- admin: acceso completo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "public_read_proyectos"
  ON public.proyectos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "admin_all_proyectos"
  ON public.proyectos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- SUSCRIPTORES_EVENTOS
-- anon: solo puede INSERT (suscribirse al newsletter)
--       INSERT ... ON CONFLICT DO NOTHING NO requiere SELECT, es compatible
--       con el endpoint /api/suscribir existente
-- admin: acceso completo (leer, eliminar, exportar)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "anon_subscribe"
  ON public.suscriptores_eventos
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "admin_all_suscriptores"
  ON public.suscriptores_eventos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
