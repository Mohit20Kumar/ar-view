import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/xr",
    ],
  },
  server: {
    // https: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "c7c6-2401-4900-1cb8-e4e6-c0f8-5a19-aadf-fc05.ngrok-free.app",
      // You can add additional ngrok hosts here if needed
      ".ngrok-free.app", // This will allow any subdomain of ngrok-free.app
    ],
  },
});
