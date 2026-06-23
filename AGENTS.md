# `is-github-bot` Agent Guide

`is-github-bot` is a collection of tools to detect AI issue or PR spammers on Github.

Designed for opensource maintainers on GitHub.

## Product Features

The core feature of the project is maintaining a logic to check whether an GitHub account is a bot. Most of the time, there are several distinct characteristics to help us distinguish.

If you want detailed information about some feature, view [RFCS](/rfcs) directory.

## Rule

Vite+ is used as the project manager. Use `vp install` to install dependencies. Always use named catalogs in `pnpm-workspace.yaml` to manage dependency versions. Use `vp run` command to run commands in `package.json`.

Use `@liangmi/vp-config` for Vite+ configuration. Use `base` at the workspace root and the matching project preset in each workspace package.

Run `vp check` (lint and format) and `vp test`(vitest) after you make changes.

Keep AGENTS.md updated with the project codebase. Consider if there is need to modify AGENTS.md after your changes. Don't store meaningless things like project structure or project status in AGENTS.md.

Never use emoji no matter where.

Keep code functional. Never use classes. Write simple code and make function reusable if possible. Use Unix philosophy to design your code (Every function should only do one thing and should not be too long or complex).

The project is designed for opensource developers on GitHub, consider about it if you need to make any decision. Do not import features out of its scope.

Use existing dependencies and tools. Feel free to add dependencies. Don't reinvent the wheel. We should always use `cac` for cli command parsing and `picocolors` for output formatting, we should always use `fetch` api to start requests on the Internet.

Chrome extension code belongs in `packages/chrome-extension`. Keep extension packaging based on `vp pack` / tsdown output; put manifest and static extension metadata in that package's `public` directory so the build copies them into `dist`, and zip `dist` in GitHub Actions.

Add `.gitkeep` file when creating new empty directory
