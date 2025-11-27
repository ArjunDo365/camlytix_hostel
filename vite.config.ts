import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   proxy: {
  //     "/admin": {
  //       target: "https://camlytix.do365tech.in",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/admin/, "/admin"),
  //     },
  //   },
  // },
});
