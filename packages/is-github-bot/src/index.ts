export type GitHubBotStatus = "bot" | "suspicious" | "human";

export interface IsGitHubBotOption {
  token?: string;
}

export async function isGitHubBot(
  _handle: string,
  _option: IsGitHubBotOption = {},
): Promise<GitHubBotStatus | undefined> {
  return undefined;
}
