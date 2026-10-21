import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import vike from 'vike/plugin';

export default defineConfig({
  server: { proxy: { '/api/chat/socket.io': { target: process.env.API_SERVER_URL || 'http://127.0.0.1:3001', ws: true } } },
  plugins: [
    react(), tailwindcss(), vike()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
