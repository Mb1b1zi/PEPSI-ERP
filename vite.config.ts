import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Not VITE_-prefixed: only read here, in the dev server proxy config, never bundled to the client.
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin = env.BACKEND_ORIGIN || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Dev-only: forwards Factory/Depot/Admin/Auth/Dashboard API calls to the real backend so
      // the browser never has to deal with CORS. Has no effect on `vite build`.
      proxy: {
        '/factory': backendOrigin,
        '/depot': backendOrigin,
        '/admin': backendOrigin,
        '/auth': backendOrigin,
        '/dashboard': backendOrigin,
      },
    },
  }
})