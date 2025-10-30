import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const domainUrl = env.VITE_DOMAIN_URL || 'http://localhost:6060'
  const port = parseInt(new URL(domainUrl).port) || 6060

  return {
    plugins: [
      // Router plugin should be first
      TanStackRouterVite({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_DOMAIN_URL': JSON.stringify(env.VITE_DOMAIN_URL),
    },

    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    preview: {
      host: '0.0.0.0',
      port: port,
      strictPort: true,
    },
  }
})
