import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/jiangnan-science-play/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        ['index.html', 'qinglan-bay/index.html', 'steroid-tile-atlas/index.html', '7-dhc-2048/index.html']
          .map(path => [path, fileURLToPath(new URL(path, import.meta.url))]),
      ),
    },
  },
});
