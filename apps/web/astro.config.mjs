import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

export default defineConfig({
  output: 'static',
  site: 'https://socyit.org',
  adapter: vercel(),
  integrations: [
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],
});
