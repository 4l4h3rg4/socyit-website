-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: audit_log
-- Registra automáticamente quién hizo qué y cuándo en las tablas principales.
-- La escritura la hace el trigger con SECURITY DEFINER, nunca la aplicación.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  text        NOT NULL DEFAULT 'system',
  action      text        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name  text        NOT NULL,
  record_id   text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices para el visor de auditoría (filtra por tabla, usuario, fecha)
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx    ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_table_name_idx ON public.audit_log (table_name);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);

-- RLS: solo admin puede leer, nadie puede escribir directamente
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_audit_log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIÓN: audit_trigger_fn
-- Se ejecuta automáticamente tras cada INSERT/UPDATE/DELETE en las tablas
-- configuradas. Captura el usuario del JWT via auth.uid() y auth.email().
--
-- NOTA: auth.uid() funciona cuando la mutación viene con un JWT de usuario
-- (anon key + sesión). Con service_role key pura, retorna null.
-- Por eso el admin usa siempre el auth client (con JWT de usuario) para mutaciones.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    uuid;
  v_user_email text;
  v_record_id  text;
BEGIN
  v_user_id    := auth.uid();
  v_user_email := coalesce(auth.email(), 'system');

  CASE TG_OP
    WHEN 'DELETE' THEN v_record_id := OLD.id::text;
    ELSE               v_record_id := NEW.id::text;
  END CASE;

  INSERT INTO public.audit_log (
    user_id, user_email, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_user_id,
    v_user_email,
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- El audit nunca bloquea la operación principal
  RAISE WARNING 'audit_trigger_fn falló: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Adjuntar trigger a las tablas que requieren auditoría
CREATE TRIGGER audit_divisiones
  AFTER INSERT OR UPDATE OR DELETE ON public.divisiones
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_lideres
  AFTER INSERT OR UPDATE OR DELETE ON public.lideres
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_proyectos
  AFTER INSERT OR UPDATE OR DELETE ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
