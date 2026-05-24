#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cac } from "cac";
import pc from "picocolors";
import { isGitHubBot, type GitHubBotStatus, type IsGitHubBotOption } from "./index.ts";

const execFileAsync = promisify(execFile);

const cli = cac("is-github-bot");

cli
  .command("[handles...]", "Check GitHub accounts for AI spammer signals")
  .option("--token <token>", "GitHub token")
  .action(async (handles: string[], options: IsGitHubBotOption) => {
    if (handles.length === 0) {
      cli.outputHelp();
      return;
    }

    const token = options.token ?? (await getLocalGitHubToken());

    for (const [index, handle] of handles.entries()) {
      process.stderr.write(`Checking ${index + 1}/${handles.length}: ${handle}\r`);

      try {
        const status = await isGitHubBot(handle, { token });
        process.stderr.write(" ".repeat(80) + "\r");
        console.log(`${handle}: ${formatStatus(status)}`);
      } catch (error) {
        process.stderr.write(" ".repeat(80) + "\r");
        process.exitCode = 1;
        console.error(
          `${handle}: ${pc.red(error instanceof Error ? error.message : String(error))}`,
        );
      }
    }
  });

cli.help();
cli.version("0.0.0");
cli.parse();

async function getLocalGitHubToken() {
  try {
    const { stdout } = await execFileAsync("gh", ["auth", "token"], {
      timeout: 5_000,
    });
    const token = stdout.trim();
    return token.length > 0 ? token : undefined;
  } catch {
    return undefined;
  }
}

function formatStatus(status: GitHubBotStatus | undefined) {
  if (status === "bot") return pc.red(status);

  if (status === "suspicious") return pc.yellow(status);

  if (status === "human") return pc.green(status);

  return pc.gray("skipped");
}
