import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // In production (Vercel), VITE_API_BASE points to Railway backend.
  // In local dev, proxy to localhost:8001 (run ceo_remote_backend locally).
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
});
