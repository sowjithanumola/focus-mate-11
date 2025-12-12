import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Replaces 'process.env.API_KEY' specifically with the string value
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents "ReferenceError: process is not defined" for other libs accessing process.env
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000
    }
  };
});