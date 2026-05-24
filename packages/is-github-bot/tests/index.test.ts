import { afterEach, expect, test, vi } from "vite-plus/test";
import { isGitHubBot } from "../src/index.ts";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("skips known automation handles before fetching GitHub data", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  await expect(isGitHubBot("github-actions")).resolves.toBeUndefined();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("skips GitHub bot accounts", async () => {
  mockGitHubFetch((url) => {
    expect(url).toContain("/users/app-service");
    return {
      login: "app-service",
      type: "Bot",
    };
  });

  await expect(isGitHubBot("app-service")).resolves.toBeUndefined();
});

test("returns bot for extreme repository creation bursts", async () => {
  vi.setSystemTime(new Date("2026-05-24T00:00:00Z"));
  mockGitHubFetch((url) => {
    if (url.includes("/users/spammer/repos"))
      return Array.from({ length: 100 }, (_, index) => ({
        fork: index % 2 === 0,
        created_at: "2026-05-01T00:00:00Z",
      }));

    return {
      login: "spammer",
      type: "User",
    };
  });

  await expect(isGitHubBot("spammer")).resolves.toBe("bot");
});

test("returns human for high pull request merge rates", async () => {
  vi.setSystemTime(new Date("2026-05-24T00:00:00Z"));
  const unmergedPullRequests = Array.from({ length: 46 }, (_, index) => ({
    body: null,
    created_at: `2026-05-${String((index % 20) + 1).padStart(2, "0")}T00:00:00Z`,
    repository_url: "https://api.github.com/repos/example/project",
  }));

  mockGitHubFetch((url) => {
    if (url.includes("/users/maintainer/repos")) return [];

    if (url.includes("/search/issues") && url.includes("-is%3Amerged"))
      return searchResponse(46, unmergedPullRequests);

    if (url.includes("/search/issues") && url.includes("is%3Amerged"))
      return searchResponse(413, []);

    if (url.includes("/search/issues") && url.includes("type%3Aissue"))
      return searchResponse(0, []);

    return {
      login: "maintainer",
      type: "User",
    };
  });

  await expect(isGitHubBot("maintainer")).resolves.toBe("human");
});

test("returns bot for many unmerged generated pull requests", async () => {
  vi.setSystemTime(new Date("2026-05-24T00:00:00Z"));
  const generatedPullRequests = Array.from({ length: 50 }, () => ({
    body: "# Summary\n\nGenerated fix.\n\n# Validation\n\nTests.",
    created_at: "2026-05-01T00:00:00Z",
    repository_url: "https://api.github.com/repos/example/project",
  }));

  mockGitHubFetch((url) => {
    if (url.includes("/users/suspicious/repos")) return [];

    if (url.includes("/search/issues") && url.includes("-is%3Amerged"))
      return searchResponse(50, generatedPullRequests);

    if (url.includes("/search/issues") && url.includes("is%3Amerged")) return searchResponse(8, []);

    if (url.includes("/search/issues") && url.includes("type%3Aissue"))
      return searchResponse(0, []);

    if (url.includes("/search/issues")) return searchResponse(20, []);

    return {
      login: "suspicious",
      type: "User",
    };
  });

  await expect(isGitHubBot("suspicious")).resolves.toBe("bot");
});

test("returns bot for a single extreme unmerged pull request day", async () => {
  vi.setSystemTime(new Date("2026-05-24T00:00:00Z"));
  const unmergedPullRequests = Array.from({ length: 30 }, () => ({
    body: null,
    created_at: "2026-05-01T00:00:00Z",
    repository_url: "https://api.github.com/repos/example/project",
  }));

  mockGitHubFetch((url) => {
    if (url.includes("/users/burst/repos")) return [];

    if (url.includes("/search/issues") && url.includes("-is%3Amerged"))
      return searchResponse(30, unmergedPullRequests);

    if (url.includes("/search/issues") && url.includes("is%3Amerged"))
      return searchResponse(20, []);

    if (url.includes("/search/issues") && url.includes("type%3Aissue"))
      return searchResponse(0, []);

    return {
      login: "burst",
      type: "User",
    };
  });

  await expect(isGitHubBot("burst")).resolves.toBe("bot");
});

function mockGitHubFetch(getBody: (url: string) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      return Response.json(getBody(getRequestUrl(input)));
    }),
  );
}

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;

  if (input instanceof URL) return input.href;

  return input.url;
}

function searchResponse(totalCount: number, items: unknown[]) {
  return {
    total_count: totalCount,
    items,
  };
}
