import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import path from 'path';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};

function resolveGitCommit() {
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT;
  try {
    return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

const buildInfo = {
  version: packageJson.version,
  commit: resolveGitCommit(),
  builtAt: process.env.BUILD_TIME ?? new Date().toISOString(),
};

export default defineConfig({
  define: {
    __PLM_BUILD_INFO__: JSON.stringify(buildInfo),
  },
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/pro-components', '@ant-design/icons'],
          vendor: ['axios', 'zustand', 'dayjs', 'nprogress'],
        },
      },
    },
  },
});