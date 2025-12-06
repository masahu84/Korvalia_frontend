// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server", // Habilita SSR para rutas dinámicas
  adapter: node({
    mode: "standalone", // o 'server', pero 'standalone' suele ir bien
  }),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
