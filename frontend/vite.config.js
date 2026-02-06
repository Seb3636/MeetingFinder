import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      protocol: "wss",
      host: "meetingfinder.de",
      port: 5173
    }
  }
});


