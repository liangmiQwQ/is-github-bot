import { expect, test, vi } from "vite-plus/test";
import {
  getEventItem,
  hasHumanFollowUp,
  shouldCloseItem,
  type GitHubActionInput,
} from "../src/github-action.ts";

test("reads issue or pull request items from GitHub event payloads", () => {
  expect(getEventItem({ issue: createItem(1) })?.number).toBe(1);
  expect(getEventItem({ pull_request: createItem(2) })?.number).toBe(2);
});

test("detects human follow-up comments after the original item", () => {
  const item = createItem(1, "2026-05-01T00:00:00Z");

  expect(
    hasHumanFollowUp(item, [
      {
        body: "I can clarify.",
        created_at: "2026-05-02T00:00:00Z",
        user: {
          login: "contributor",
          type: "User",
        },
      },
    ]),
  ).toBe(true);
});

test("ignores action marker comments and bot comments when checking follow-up", () => {
  const item = createItem(1, "2026-05-01T00:00:00Z");

  expect(
    hasHumanFollowUp(item, [
      {
        body: "<!-- is-github-bot -->",
        created_at: "2026-05-02T00:00:00Z",
        user: {
          login: "github-actions",
          type: "Bot",
        },
      },
      {
        body: "Automated response.",
        created_at: "2026-05-03T00:00:00Z",
        user: {
          login: "other-bot",
          type: "Bot",
        },
      },
    ]),
  ).toBe(false);
});

test("only closes items after the configured age", () => {
  vi.setSystemTime(new Date("2026-05-10T00:00:00Z"));

  const input = createInput({
    close: true,
    closeAfterDays: 3,
  });

  expect(shouldCloseItem(input, createItem(1, "2026-05-06T00:00:00Z"))).toBe(true);
  expect(shouldCloseItem(input, createItem(1, "2026-05-08T00:00:00Z"))).toBe(false);

  vi.useRealTimers();
});

function createItem(number: number, createdAt = "2026-05-01T00:00:00Z") {
  return {
    number,
    created_at: createdAt,
    user: {
      login: "contributor",
      type: "User",
    },
  };
}

function createInput(input: Partial<GitHubActionInput> = {}): GitHubActionInput {
  return {
    token: "token",
    repository: "owner/repo",
    eventPath: "event.json",
    labelBot: "AI Bot",
    labelSuspicious: "Suspicious AI",
    comment: false,
    commentMessage: "",
    close: false,
    closeAfterDays: 3,
    closeMessage: "",
    ...input,
  };
}
