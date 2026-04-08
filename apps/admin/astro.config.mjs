import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  site: 'https://admin.socyit.org',
  adapter: vercel(),
});
