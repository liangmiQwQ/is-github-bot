import { readFile } from "node:fs/promises";
import { isGitHubBot, type GitHubBotStatus } from "./index.ts";

export interface GitHubActionInput {
  token: string;
  repository: string;
  eventPath: string;
  labelBot: string;
  labelSuspicious: string;
  comment: boolean;
  commentMessage: string;
  close: boolean;
  closeAfterDays: number;
  closeMessage: string;
}

export interface GitHubActionItem {
  number: number;
  created_at: string;
  user: {
    login: string;
    type?: string;
  } | null;
  pull_request?: unknown;
}

interface GitHubActionEvent {
  issue?: GitHubActionItem;
  pull_request?: GitHubActionItem;
}

interface GitHubComment {
  body: string | null;
  created_at: string;
  user: {
    login: string;
    type?: string;
  } | null;
}

interface GitHubContext {
  owner: string;
  repo: string;
  token: string;
}

const GITHUB_API = "https://api.github.com";
const COMMENT_MARKER = "<!-- is-github-bot -->";

export async function runGitHubAction(input = readActionInput()) {
  const event = JSON.parse(await readFile(input.eventPath, "utf8")) as GitHubActionEvent;
  const item = getEventItem(event);

  if (!item?.user) {
    console.log("No issue or pull request author found in this event.");
    return;
  }

  const status = await isGitHubBot(item.user.login, { token: input.token });
  if (status !== "bot" && status !== "suspicious") {
    console.log(`@${item.user.login} is ${status ?? "skipped"}.`);
    return;
  }

  const context = createGitHubContext(input);
  const label = getStatusLabel(status, input);
  await addLabel(context, item.number, label);
  console.log(`Added "${label}" to #${item.number}.`);

  if (input.comment) {
    const comments = await fetchComments(context, item.number);
    if (!hasActionComment(comments)) {
      await createComment(context, item.number, input.commentMessage, status);
      console.log(`Commented on #${item.number}.`);
    }
  }

  if (!shouldCloseItem(input, item)) return;

  const comments = await fetchComments(context, item.number);
  if (hasHumanFollowUp(item, comments)) {
    console.log(`#${item.number} has human follow-up, skipping close.`);
    return;
  }

  if (input.closeMessage) await createComment(context, item.number, input.closeMessage, status);

  await closeItem(context, item);
  console.log(`Closed #${item.number}.`);
}

export function getEventItem(event: GitHubActionEvent) {
  return event.issue ?? event.pull_request;
}

export function hasHumanFollowUp(item: GitHubActionItem, comments: GitHubComment[]) {
  const itemCreatedAt = Date.parse(item.created_at);

  return comments.some((comment) => {
    if (!comment.user || comment.body?.includes(COMMENT_MARKER)) return false;
    if (Date.parse(comment.created_at) <= itemCreatedAt) return false;

    return comment.user.type !== "Bot";
  });
}

export function shouldCloseItem(input: GitHubActionInput, item: GitHubActionItem) {
  if (!input.close) return false;

  const age = Date.now() - Date.parse(item.created_at);
  return age >= input.closeAfterDays * 24 * 60 * 60 * 1000;
}

function readActionInput(): GitHubActionInput {
  return {
    token: readRequiredEnv("GITHUB_TOKEN"),
    repository: readRequiredEnv("GITHUB_REPOSITORY"),
    eventPath: readRequiredEnv("GITHUB_EVENT_PATH"),
    labelBot: process.env.INPUT_LABEL_BOT || "AI Bot",
    labelSuspicious: process.env.INPUT_LABEL_SUSPICIOUS || "Suspicious AI",
    comment: readBooleanEnv("INPUT_COMMENT"),
    commentMessage: process.env.INPUT_COMMENT_MESSAGE || defaultCommentMessage(),
    close: readBooleanEnv("INPUT_CLOSE"),
    closeAfterDays: readNumberEnv("INPUT_CLOSE_AFTER_DAYS", 3),
    closeMessage: process.env.INPUT_CLOSE_MESSAGE || defaultCloseMessage(),
  };
}

function readRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);

  return value;
}

function readBooleanEnv(name: string) {
  return process.env[name] === "true";
}

function readNumberEnv(name: string, fallback: number) {
  const rawValue = process.env[name];
  if (!rawValue) return fallback;

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a positive number.`);

  return value;
}

function createGitHubContext(input: GitHubActionInput): GitHubContext {
  const [owner, repo] = input.repository.split("/");
  if (!owner || !repo) throw new Error("GITHUB_REPOSITORY must use owner/repo format.");

  return {
    owner,
    repo,
    token: input.token,
  };
}

function getStatusLabel(status: GitHubBotStatus, input: GitHubActionInput) {
  return status === "bot" ? input.labelBot : input.labelSuspicious;
}

async function addLabel(context: GitHubContext, issueNumber: number, label: string) {
  await requestGitHub(
    context,
    `/repos/${context.owner}/${context.repo}/issues/${issueNumber}/labels`,
    {
      method: "POST",
      body: JSON.stringify({ labels: [label] }),
    },
  );
}

async function fetchComments(context: GitHubContext, issueNumber: number) {
  return requestGitHub<GitHubComment[]>(
    context,
    `/repos/${context.owner}/${context.repo}/issues/${issueNumber}/comments?per_page=100`,
  );
}

function hasActionComment(comments: GitHubComment[]) {
  return comments.some((comment) => comment.body?.includes(COMMENT_MARKER));
}

async function createComment(
  context: GitHubContext,
  issueNumber: number,
  message: string,
  status: GitHubBotStatus,
) {
  await requestGitHub(
    context,
    `/repos/${context.owner}/${context.repo}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        body: `${message.trim()}\n\n${COMMENT_MARKER}\nStatus: ${status}`,
      }),
    },
  );
}

async function closeItem(context: GitHubContext, item: GitHubActionItem) {
  await requestGitHub(context, `/repos/${context.owner}/${context.repo}/issues/${item.number}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}

async function requestGitHub<T>(
  context: GitHubContext,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Content-Type", "application/json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("Authorization", `Bearer ${context.token}`);

  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok)
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

function defaultCommentMessage() {
  return [
    "This issue / PR looks like it may be generated by an AI bot.",
    "",
    "If this is a real human contribution, please leave a short follow-up comment and we will be happy to review it.",
  ].join("\n");
}

function defaultCloseMessage() {
  return "Closing this because it was marked as suspicious and there was no human follow-up.";
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href) {
  try {
    await runGitHubAction();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
