# Is-GitHub-Bot core package

## Reason

To make sure we can have the same check logic for different uses, like browser extensions or website, we provide a public package on npm named `is-github-bot`, it includes the core logic to fetch GitHub api and check whether a GitHub account is an AI robot.

## Package detail

The package should be put inside `packages/is-github-bot` directory and bundled with `vp pack`(tsdown) in ESM with fixed extension.

It should have both a bin and a export for public functions, like core `isGithubBot` logic. The bin is wrapper of the export function, it can be treated as a local CLI which allows users to directly query a user's bot status.

### Interface

#### `isGitHubBot` function

```typescript
export async function isGitHubBot(
  handle: string,
  option: IsGitHubBotOption,
): Promise<"bot" | "suspicious" | "human" | undefined>;
```

This function should run check logic to find whether this account with that handle is a AI robot.

The return value is a coarse-grained result derived from internal scores and early-exit rules.

Return undefined if this account is a Github app bot or name ends with `bot`/`[bot]`, like `github-actions`, `renovate`

#### `IsGitHubBotOption` interface

```typescript
export interface IsGitHubBotOption {
  token?: string;
}
```

### Cli behavior

Cli is essentially a wrapper of `isGitHubBot` function. All options inside `IsGitHubBotOption` can be passed through command arguments.

For `token` option, if users don't pass the token to the CLI directly, we can use `gh auth token` to get local token for only local fetch. If the user doesn't installed `gh` cli or it is not authed, just leave `undefined` for token field.

The CLI is mainly for users directly use, so we do not need consider too much about CI / std behavior. We print a progress bar while doing multiple fetch. The result should be print in green / yellow / red based on the AI bot match rating.

### Check logic

We build several checks for an account. If we've found obvious evidence before finishing all the checks, we can skip the rest of the checks and return `bot` to save API usage. For the case

We only check an account's data within six months.

#### The number of repo creation (High)

A normal human account usually creates less than 10 repos in a day, while an AI account can create more than 100+ a day. Pay attention to fork repos, if an account creates an insane number of forks, it must be an AI account.

#### The merge rate of PR (High)

Mostly, we hope an account's PR merge radio can be higher than 50%, if its PR merge radio is lower than 50%, The probability that he is an AI should grow as a quadratic function.

This check should only for the user who creates more than 10 PRs in the past six months.

Except: its own projects.

#### The number of PR and issue creation (Medium)

A normal human account usually creates less than 20 pull requests and issues a day, while an AI account can easily creates 200+ a day.

Except: its own projects.

#### PR description check (Medium)

If you can find `## Validation` usually appears in its PR description, it can be a robot PR.

Except: its own projects.

#### The span of PR and issue creation (Low)

A normal human account usually creates PR on less than 5-6 repos with 2-3 languages, if an account switches 10+ languages in 20+ repos, it may an AI spammer bot.

Except: its own projects.

### Concept Definition

#### Its own project

If a GitHub repo satisfies any of the following conditions, it should be treated as his/her own project.

1. The project is under its own account
2. He or she has write perssions in this repo. (There are commits submitted by it without a PR / He can merge a PR in the repo)
3. More than 80% commits are made by the account given
