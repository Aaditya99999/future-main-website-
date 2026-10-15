import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync } from 'fs';

// The scripts in src/ are plain (non-module) scripts so pages also work
// without a build; Vite leaves those alone, so copy them into the output as-is.
const copySiteScripts = {
  name: 'copy-site-scripts',
  closeBundle() {
    cpSync(resolve(__dirname, 'src'), resolve(__dirname, 'dist/src'), { recursive: true });
  }
};

export default defineConfig({
  plugins: [copySiteScripts],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        academy: resolve(__dirname, 'academy.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        partnership: resolve(__dirname, 'partnership.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogeditor: resolve(__dirname, 'blogeditor.html'),
        admin1: resolve(__dirname, 'admin1.html')
      }
    }
  }
});
