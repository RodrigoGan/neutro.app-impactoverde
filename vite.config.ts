import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Permite acesso externo
    port: 3000,
    hmr: {
      overlay: false // Desabilita o overlay de erro do HMR
    }
  },
});
