import { appendFile, cp, readFile } from "node:fs/promises";

import { createGenerator } from "unocss";
import Vue from "unplugin-vue/rolldown";
import type { PluginOption } from "vite-plus";
import { defineConfig } from "vite-plus";
import unoConfig from "./uno.config.ts";

export default defineConfig({
  pack: {
    alias: {
      "is-github-bot": new URL("../is-github-bot/src/index.ts", import.meta.url).pathname,
    },
    clean: true,
    deps: {
      alwaysBundle: ["is-github-bot", "vue"],
      onlyBundle: false,
    },
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
    plugins: [Vue({ isProduction: true }) as unknown as PluginOption],
    hooks: {
      "build:done": async () => {
        await cp("public", "dist", { recursive: true });
        await appendFile("dist/style.css", await generateOptionsCss());
      },
    },
  },
  fmt: {},
});

async function generateOptionsCss() {
  const generator = await createGenerator(unoConfig);
  const content = await readFile("src/OptionsApp.vue", "utf8");
  const { css } = await generator.generate(content, { preflights: false });
  return `\n${css}`;
}
