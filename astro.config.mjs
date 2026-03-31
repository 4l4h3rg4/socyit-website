import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],
});
