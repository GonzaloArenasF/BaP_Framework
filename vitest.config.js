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
    // Map Firebase CDN URLs to local mocks
    alias: {
      'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js':
        path.resolve('./test/mocks/firebase-app.mock.js'),
      'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js':
        path.resolve('./test/mocks/firebase-auth.mock.js'),
      'https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js':
        path.resolve('./test/mocks/firebase-database.mock.js'),
      'https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js':
        path.resolve('./test/mocks/firebase-analytics.mock.js'),
      'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-check.js':
        path.resolve('./test/mocks/firebase-app-check.mock.js'),
    },
  },
});
