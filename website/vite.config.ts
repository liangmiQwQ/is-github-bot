import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

export default defineConfig({
  resolve: {
    alias: {
      "is-github-bot": new URL("../packages/is-github-bot/src/index.ts", import.meta.url).pathname,
    },
  },
  plugins: [voidPlugin(), vue(), UnoCSS()],
});
