# SocyIT — Comunidad Tech

Sitio web oficial de **SocyIT**, una comunidad IT enfocada en el apoyo mutuo entre personas de todas las ramas de la tecnología: software, ciberseguridad, robótica & IA, videojuegos y más.

La idea es simple: que nadie en el mundo tech tenga que avanzar solo. Nos ayudamos con proyectos, visibilidad, financiamiento, consejos, y cualquier cosa que se necesite. Las colaboraciones entre divisiones son bienvenidas y esperadas.

## Stack

- [Astro](https://astro.build) — framework principal (output estático + SSR híbrido)
- [Supabase](https://supabase.com) — base de datos y backend (divisiones, eventos, newsletter)
- [Vercel](https://vercel.com) — deploy
- [tsparticles](https://particles.js.org) — fondo animado de estrellas
- [astro-icon](https://github.com/natemoo-re/astro-icon) + Lucide — iconos

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/        # Navbar, Footer
│   ├── sections/      # Secciones de la landing (Hero, Divisiones, Eventos, ...)
│   └── ui/            # Componentes genéricos (StarBackground)
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   └── supabase.ts    # Cliente Supabase
├── pages/
│   ├── index.astro    # Landing principal
│   ├── divisiones.astro
│   ├── 404.astro
│   └── api/
│       └── suscribir.ts  # POST endpoint para el newsletter
├── styles/
│   ├── global.css
│   └── animations.css
└── types/
    └── index.ts
```

## Correr el proyecto localmente

**Requisitos:** Node.js ≥ 22.12.0 y pnpm.

```bash
# Instalar dependencias
pnpm install

# Copiar el archivo de entorno y completarlo con tus credenciales
cp .env.example .env

# Iniciar el servidor de desarrollo
pnpm dev
```

El sitio estará en `http://localhost:4321`.

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase (Settings → API) |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase (segura para el browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor, nunca al cliente) |
| `PUBLIC_WHATSAPP_URL` | Link de invitación al grupo de WhatsApp |

> **Nunca subas tu `.env` al repositorio.** Ya está en `.gitignore`.

## Base de datos (Supabase)

El proyecto usa las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `divisiones` | Divisiones de la comunidad (nombre, ícono, slug, color, etc.) |
| `suscriptores_eventos` | Emails registrados para el newsletter de eventos |

Las divisiones se leen en build time (SSG). El newsletter se procesa vía el endpoint `/api/suscribir`.

## Comandos

```bash
pnpm dev        # Servidor de desarrollo en localhost:4321
pnpm build      # Build de producción
pnpm preview    # Preview del build localmente
```

## Divisiones

Actualmente hay 4 divisiones activas, con más en camino:

- **Robótica & IA** — hardware, automatización, inteligencia artificial
- **Ciberseguridad** — hacking ético, CTFs, defensa y análisis
- **Software** — desarrollo web, móvil, backend, DevOps
- **Videojuegos** — diseño, desarrollo de juegos, narrativa interactiva

Cualquier persona puede unirse a la división (o divisiones) que quiera, con total libertad de elección.

## Contribuir

¡Las contribuciones son bienvenidas! Si quieres aportar:

1. Haz fork del repositorio
2. Crea una rama para tu feature o fix (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios
4. Abre un Pull Request describiendo qué cambiaste y por qué

Si encuentras un bug o tienes una idea, abre un [Issue](../../issues).

## Licencia

MIT — libre para usar, modificar y distribuir.
