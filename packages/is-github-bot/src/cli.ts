#!/usr/bin/env node

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cac } from "cac";
import pc from "picocolors";
import { isGitHubBot, type GitHubBotStatus, type IsGitHubBotOption } from "./index.ts";

const execFileAsync = promisify(execFile);
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const cli = cac("is-github-bot");

cli
  .command("[...handles]", "Check GitHub accounts for AI spammer signals")
  .option("--token <token>", "GitHub token")
  .action(async (handles: string[], options: IsGitHubBotOption) => {
    const handle = handles[0];

    if (!handle) {
      cli.outputHelp();
      return;
    }

    if (handles.length > 1) throw new Error("Only one GitHub account can be checked at a time.");

    const token = options.token ?? (await getLocalGitHubToken());
    const spinner = startSpinner(handle);

    try {
      const status = await isGitHubBot(handle, { token });
      spinner.stop();
      console.log(formatResult(handle, status));
    } catch (error) {
      spinner.stop();
      process.exitCode = 1;
      console.error(formatError(handle, error));
    }
  });

cli.help();
cli.version("0.0.0");

try {
  cli.parse(normalizeArgv(process.argv), { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  process.exitCode = 1;
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
}

function normalizeArgv(argv: string[]) {
  if (argv[2] !== "--") return argv;

  return [argv[0] ?? "", argv[1] ?? "", ...argv.slice(3)];
}

function startSpinner(handle: string) {
  let index = 0;

  const render = () => {
    const frame = SPINNER_FRAMES[index % SPINNER_FRAMES.length];
    index += 1;
    process.stderr.write(`${pc.cyan(frame)} Checking @${handle}\r`);
  };
  const timer = setInterval(render, 80);
  render();

  return {
    stop() {
      clearInterval(timer);
      process.stderr.write(" ".repeat(80) + "\r");
    },
  };
}

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

function formatResult(handle: string, status: GitHubBotStatus | undefined) {
  if (status === "bot")
    return `${pc.red("✗")} ${pc.bold(`@${handle}`)} is a ${pc.red("bot")} account`;

  if (status === "suspicious")
    return `${pc.yellow("⚠")} ${pc.bold(`@${handle}`)} is a ${pc.yellow("suspicious")} account`;

  if (status === "human")
    return `${pc.green("✓")} ${pc.bold(`@${handle}`)} is a ${pc.green("human")} account`;

  return `${pc.gray("⚠")} ${pc.bold(`@${handle}`)} is a ${pc.gray("skipped")} account`;
}

function formatError(handle: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return `${pc.red("✗")} ${pc.bold(`@${handle}`)} could not be checked: ${pc.red(message)}`;
}
