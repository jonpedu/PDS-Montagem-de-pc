import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    define: {
      // Disponibiliza as variáveis de ambiente para o browser
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      // Configuração otimizada para produção
      rollupOptions: {
        output: {
          manualChunks: {
            'google-genai': ['@google/genai'],
            'pdf': ['jspdf', 'jspdf-autotable'],
            'react-vendor': ['react', 'react-dom']
          }
        }
      }
    },
    server: {
      // Configuração do servidor de desenvolvimento
      port: 5173,
      host: true
    }
  };
});
