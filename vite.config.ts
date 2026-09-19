import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      port: 3001,
      future: {
        v3_singleFetch: false, // <-- Disabilita la funzionalità Single Fetch (.data)
      },
      host: true,
      // proxy: {
      //   'http://': {
      //     target: 'http://backend:3001',
      //     changeOrigin: true,
      //     secure: false,
      //   },
      // },
    },
  };
});
