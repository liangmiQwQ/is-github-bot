import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/cli.ts"],
    dts: {
      tsgo: true,
    },
    deps: {
      neverBundle: ["node:child_process", "node:util"],
    },
    exports: true,
    fixedExtension: true,
    platform: "neutral",
  },
});
