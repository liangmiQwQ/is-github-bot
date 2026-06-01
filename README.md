# **Is** that **GitHub** **Bot**?

A collection of tools to detect AI issue or PR spammers on Github.

Inspired by [@MengXi-ream](https://github.com/MengXi-ream) and [Read Frog's GitHub CI](https://github.com/mengxi-ream/read-frog/blob/239f4910f576a364479a6d1ed9676aa07ce415e4/.github/scripts/contributor-trust/run.js) maintained by him.

## Features

- Checks a GitHub user with the public GitHub API.
- Returns a coarse status: `bot`, `suspicious`, `human`, or `undefined` for skipped accounts.
- Uses recent activity from the last six months.
- Supports an optional GitHub token for higher API limits and authenticated extension actions.
- Ships a CLI wrapper around the same package logic.
- Provides a reusable GitHub Actions workflow for labeling suspicious issues and pull requests.
- Includes a static Vue website that runs checks in the browser.
- Includes a Chrome extension that annotates GitHub issue, pull request, and profile pages.

## Detection Signals

The checker combines several signals and exits early when the evidence is strong:

- Repository creation bursts, especially large fork bursts.
- Pull request merge rate across repositories outside the checked user's own account.
- Large volumes of unmerged pull requests.
- Large issue or pull request creation bursts in a single day.
- Repeated generated-looking pull request bodies such as `# Summary` and `# Validation`.
- Activity spread across many repositories and languages.

The result is a maintainer aid, not a moderation authority. Use it as one input when reviewing suspicious activity.

## Package API

```ts
import { isGitHubBot } from "is-github-bot";

const status = await isGitHubBot("octocat", {
  token: process.env.GITHUB_TOKEN,
});

console.log(status);
```

```ts
type GitHubBotStatus = "bot" | "suspicious" | "human";

interface IsGitHubBotOption {
  token?: string;
}

function isGitHubBot(
  handle: string,
  option?: IsGitHubBotOption,
): Promise<GitHubBotStatus | undefined>;
```

`undefined` means the account was skipped or could not be classified as a normal user account, for example a known automation handle or a GitHub App bot account.

## CLI

```bash
is-github-bot github-actions
is-github-bot suspicious-user --token "$GITHUB_TOKEN"
```

The CLI accepts one handle at a time. If `--token` is not provided, it tries to read a local token from `gh auth token`; if that is unavailable, it runs without a token.

From this repository:

```bash
vp run is-github-bot github-actions
```

## GitHub Actions

Use the reusable workflow to label suspicious issue and pull request authors:

```yaml
name: Check AI spammers

on:
  issues:
    types: [opened, edited]
  pull_request_target:
    types: [opened, edited, reopened, synchronize]

permissions:
  issues: write
  pull-requests: write
  contents: read

jobs:
  check:
    uses: liangmiQwQ/is-github-bot/.github/workflows/check.yml@v1
    with:
      label-bot: "AI Bot"
      label-suspicious: "Suspicious AI"
      comment: true
      close: false
      close-after-days: 3
```

When `close` is enabled, the workflow closes marked issues or pull requests only after `close-after-days` has passed and there is no non-bot follow-up comment.

## Website

The website is a Vue 3 app that runs the same checker locally in the user's browser. It lets users search a GitHub handle, view the profile summary, and optionally store a GitHub token in local settings for API requests. You can view https://is-github-bot.void.app/ or built on your local environment.

```bash
vp install
vp run website#dev
```

## Chrome Extension

The Chrome extension runs on `https://github.com/*` and uses the package logic from the background service worker.

It can:

- Outline issue, pull request, and profile avatars by status.
- Cache checked statuses for 15 days.
- Skip collaborators, members, and optionally contributors.
- Add `Close as spam`, `Close and Block`, and profile `Block` actions for bot accounts when enabled.
- Use configurable close comments with `${username}` substitution.

Build the extension from source:

```bash
vp run @is-github-bot/chrome-extension#build
```

The extension metadata lives in `packages/chrome-extension/public`, and the build output is produced under that package's `dist` directory.

## Development

This monorepo uses [Vite+](https://viteplus.dev/).

```bash
vp install
vp check
vp test
vp run -r build
```

Useful scripts:

- `vp run dev`: start the website.
- `vp run is-github-bot <handle>`: run the local CLI.
- `vp run ready`: run checks, tests, and builds.

## License

[MIT](./LICENSE) © Liang Mi
