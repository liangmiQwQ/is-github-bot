import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/cli.ts"],
    dts: {
      tsgo: true,
    },
    exports: true,
    fixedExtension: true,
    platform: "neutral",
  },
});
