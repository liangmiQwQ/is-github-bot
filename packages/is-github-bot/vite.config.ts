import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/cli.ts", "src/github-action.ts"],
    dts: {
      tsgo: true,
    },
    deps: {
      neverBundle: ["node:child_process", "node:fs/promises", "node:util"],
    },
    exports: true,
    fixedExtension: true,
    platform: "neutral",
  },
});
