import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// Сайт статичний. Локально запити /api йдуть на бекенд (api/, порт 4000),
// у продакшені сайт звертається до адреси з PUBLIC_API_URL.
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: { server: { proxy: { '/api': 'http://localhost:4000' } } },
});