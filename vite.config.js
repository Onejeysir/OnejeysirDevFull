import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        // three.js isolé : le texte s'affiche sans attendre le moteur 3D
        manualChunks: { three: ["three", "@react-three/fiber", "@react-three/drei"] },
      },
    },
  },
});
