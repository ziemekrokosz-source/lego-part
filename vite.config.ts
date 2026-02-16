import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Kluczowe dla działania SDK Gemini w przeglądarce
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
