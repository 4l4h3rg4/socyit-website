/**
 * gsap.ts — Configuración central de GSAP para SocyIT
 *
 * Responsabilidades:
 * 1. Registrar ScrollTrigger (una sola vez gracias al módulo singleton de Vite)
 * 2. Exponer `withMotion(fn)` — wrapper que respeta prefers-reduced-motion
 * 3. Configurar defaults globales
 * 4. ScrollTrigger.batch global para todos los `.reveal` genéricos
 *    (reemplaza el IntersectionObserver que estaba en BaseLayout)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registro único — Vite deduplica el módulo, no se registra dos veces
gsap.registerPlugin(ScrollTrigger);

// Defaults globales del proyecto
gsap.defaults({ ease: 'power2.out', duration: 0.6 });

// Contexto único de matchMedia — compartido entre todos los componentes
const mm = gsap.matchMedia();

/**
 * Envuelve animaciones en un guard de accesibilidad.
 * Si el usuario tiene `prefers-reduced-motion: reduce` activo,
 * el callback NUNCA se ejecuta y los elementos quedan visibles sin animación.
 */
export function withMotion(fn: () => void): void {
  mm.add('(prefers-reduced-motion: no-preference)', fn);
}

// ─── Batch global para .reveal genéricos ─────────────────────────────────────
// Maneja todos los elementos .reveal que no tengan animación de sección propia.
// Reemplaza el IntersectionObserver de BaseLayout.
withMotion(() => {
  // Estado inicial — GSAP lo establece antes de que el scroll fire
  gsap.set('.reveal', { autoAlpha: 0, y: 28 });

  ScrollTrigger.batch('.reveal', {
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
      }),
    once: true,
    start: 'top 88%',
  });
});

// ─── Nota para el futuro ──────────────────────────────────────────────────────
// Si se añaden View Transitions (Astro), descomentar:
// document.addEventListener('astro:before-swap', () =>
//   ScrollTrigger.getAll().forEach((t) => t.kill())
// );

export { gsap, ScrollTrigger };
