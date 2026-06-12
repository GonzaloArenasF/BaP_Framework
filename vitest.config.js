import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/assets/**',
        'src/_components/bap-svg-image/icons.js',
        'src/wip-page/**',
      ],
    },
    // Map Firebase CDN URLs (y DOMPurify vendored) a mocks locales.
    // Forma de array para poder usar `find` con RegExp en el caso de DOMPurify.
    alias: [
      {
        find: 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js',
        replacement: path.resolve('./test/mocks/firebase-app.mock.js'),
      },
      {
        find: 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js',
        replacement: path.resolve('./test/mocks/firebase-auth.mock.js'),
      },
      {
        find: 'https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js',
        replacement: path.resolve('./test/mocks/firebase-database.mock.js'),
      },
      {
        find: 'https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js',
        replacement: path.resolve('./test/mocks/firebase-analytics.mock.js'),
      },
      {
        find: 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js',
        replacement: path.resolve('./test/mocks/firebase-app-check.mock.js'),
      },
      // DOMPurify: SEC-05 lo empaqueta localmente como `./vendor/purify.es.mjs`.
      // El módulo real ESM funciona en navegador; en Vitest/Node.js se redirige al
      // mock local que simula sanitize() de forma determinista. El RegExp captura el
      // especificador completo (relativo) para reemplazarlo íntegramente por el mock.
      {
        find: /.*\/vendor\/purify\.es\.mjs$/,
        replacement: path.resolve('./test/mocks/dompurify.mock.js'),
      },
    ],
  },
});
