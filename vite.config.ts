import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Pozwala na używanie process.env.API_KEY bezpośrednio w kodzie, 
    // co jest wymagane przez instrukcję obsługi SDK.
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  }
});
