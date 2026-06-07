import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Replit serves the dev server from a *.replit.dev host; allow it.
    allowedHosts: true,
    // HMR runs through Replit's HTTPS proxy on 443.
    hmr: { clientPort: 443 },
    // Proxy API calls to the FastAPI backend so the browser only ever talks to
    // this single origin (works locally and behind Replit's proxy).
    proxy: {
      "/tasks": "http://127.0.0.1:8000",
    },
  },
});
