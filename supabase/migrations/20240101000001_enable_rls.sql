-- Habilitar Row Level Security en todas las tablas públicas
-- Sin políticas activas, RLS en modo DENY por defecto (nadie puede acceder)

ALTER TABLE public.divisiones           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lideres              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscriptores_eventos ENABLE ROW LEVEL SECURITY;
