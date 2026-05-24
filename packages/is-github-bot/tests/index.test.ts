import { expect, test } from "vite-plus/test";
import { isGitHubBot } from "../src/index.ts";

test("keeps the core package scaffold blank", async () => {
  await expect(isGitHubBot("octocat")).resolves.toBeUndefined();
});
