import { cp } from "node:fs/promises";

import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    clean: true,
    entry: {
      background: "src/background.ts",
      content: "src/content.ts",
      options: "src/options.ts",
    },
    format: ["esm"],
    platform: "browser",
    outExtensions: () => ({
      js: ".js",
    }),
    hooks: {
      "build:done": async () => {
        await cp("public", "dist", { recursive: true });
      },
    },
  },
  fmt: {},
});
