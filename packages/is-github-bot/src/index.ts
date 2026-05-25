export type GitHubBotStatus = "bot" | "suspicious" | "human";

export interface IsGitHubBotOption {
  token?: string;
}

interface GitHubUser {
  login: string;
  type: string;
}

interface GitHubRepo {
  fork: boolean;
  created_at: string;
}

interface GitHubSearchResponse<T> {
  total_count: number;
  items: T[];
}

interface GitHubIssue {
  body: string | null;
  created_at: string;
  repository_url: string;
}

interface GitHubRepository {
  language: string | null;
  full_name: string;
}

const GITHUB_API = "https://api.github.com";
const SIX_MONTHS_IN_MS = 183 * 24 * 60 * 60 * 1000;
const AUTOMATION_HANDLES = new Set([
  "dependabot",
  "dependabot-preview",
  "github-actions",
  "renovate",
]);

export async function isGitHubBot(
  handle: string,
  option: IsGitHubBotOption = {},
): Promise<GitHubBotStatus | undefined> {
  const normalizedHandle = normalizeHandle(handle);
  if (!normalizedHandle) return undefined;

  if (isAutomationHandle(normalizedHandle)) return undefined;

  const context = createGitHubContext(option.token);
  const user = await fetchGitHub<GitHubUser>(
    context,
    `/users/${encodeURIComponent(normalizedHandle)}`,
  );
  if (!user || user.type === "Bot") return undefined;

  const since = new Date(Date.now() - SIX_MONTHS_IN_MS).toISOString().slice(0, 10);
  const repos = await fetchRecentRepos(context, normalizedHandle, since);
  const repoSignal = checkRepositoryCreation(repos);
  if (repoSignal === "bot") return "bot";

  const [pullRequests, mergedPullRequests] = await Promise.all([
    searchGitHub(
      context,
      `author:${normalizedHandle} type:pr created:>=${since} -user:${normalizedHandle}`,
    ),
    searchGitHub(
      context,
      `author:${normalizedHandle} type:pr is:merged created:>=${since} -user:${normalizedHandle}`,
    ),
  ]);

  let score = repoSignal;

  const prSignal = checkPullRequestActivity(pullRequests, mergedPullRequests);
  if (prSignal === "bot") return "bot";
  if (prSignal === "human") return "human";
  score += prSignal;

  const [unmergedPullRequests, issues] = await Promise.all([
    searchGitHub<GitHubIssue>(
      context,
      `author:${normalizedHandle} type:pr -is:merged created:>=${since} -user:${normalizedHandle}`,
      100,
    ),
    searchGitHub<GitHubIssue>(
      context,
      `author:${normalizedHandle} type:issue created:>=${since} -user:${normalizedHandle}`,
      100,
    ),
  ]);
  const activitySignal = await checkIssueAndPullRequestActivity(
    context,
    unmergedPullRequests,
    issues,
  );
  if (activitySignal === "bot") return "bot";
  score += activitySignal;

  if (score >= 70) return "bot";

  if (score >= 25) return "suspicious";

  return "human";
}

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

function isAutomationHandle(handle: string) {
  return AUTOMATION_HANDLES.has(handle) || handle.endsWith("[bot]") || handle.endsWith("bot");
}

function createGitHubContext(token: string | undefined) {
  return {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

async function fetchGitHub<T>(
  context: ReturnType<typeof createGitHubContext>,
  path: string,
): Promise<T | undefined> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: context.headers,
  });

  if (response.status === 404) return undefined;

  if (!response.ok)
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);

  return response.json() as Promise<T>;
}

async function searchGitHub<T>(
  context: ReturnType<typeof createGitHubContext>,
  q: string,
  perPage = 1,
): Promise<GitHubSearchResponse<T>> {
  const params = new URLSearchParams({
    q,
    sort: "created",
    order: "desc",
    per_page: String(perPage),
  });

  return (
    (await fetchGitHub<GitHubSearchResponse<T>>(context, `/search/issues?${params}`)) ?? {
      total_count: 0,
      items: [],
    }
  );
}

function checkRepositoryCreation(repos: GitHubRepo[]) {
  const reposByDay = countByDay(repos, (repo) => repo.created_at);
  const forksByDay = countByDay(
    repos.filter((repo) => repo.fork),
    (repo) => repo.created_at,
  );
  const maxReposInDay = Math.max(0, ...reposByDay.values());
  const maxForksInDay = Math.max(0, ...forksByDay.values());

  if (maxReposInDay >= 50 || maxForksInDay >= 30) return "bot" as const;

  if (maxReposInDay >= 20 || maxForksInDay >= 12) return 45;

  if (maxReposInDay >= 10 || maxForksInDay >= 6) return 25;

  return 0;
}

async function fetchRecentRepos(
  context: ReturnType<typeof createGitHubContext>,
  handle: string,
  since: string,
) {
  const repos: GitHubRepo[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const batch =
      (await fetchGitHub<GitHubRepo[]>(
        context,
        `/users/${encodeURIComponent(handle)}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`,
      )) ?? [];

    repos.push(...batch.filter((repo) => repo.created_at.slice(0, 10) >= since));

    if (batch.length < 100 || batch.some((repo) => repo.created_at.slice(0, 10) < since)) break;
  }

  return repos;
}

function checkPullRequestActivity(
  pullRequests: GitHubSearchResponse<unknown>,
  mergedPullRequests: GitHubSearchResponse<unknown>,
) {
  const totalPullRequests = pullRequests.total_count;

  if (totalPullRequests <= 10) return 0;

  const mergeRate = mergedPullRequests.total_count / totalPullRequests;
  const unmergedPullRequests = Math.max(0, totalPullRequests - mergedPullRequests.total_count);

  if (mergeRate >= 0.8 && totalPullRequests >= 20) return "human" as const;

  if (unmergedPullRequests >= 80) return "bot" as const;

  if (mergeRate <= 0.2 && totalPullRequests >= 20) return "bot" as const;

  let score = 0;

  if (unmergedPullRequests >= 40) score += 45;
  else if (unmergedPullRequests >= 20) score += 25;

  if (mergeRate < 0.55) score += Math.ceil(((0.55 - mergeRate) / 0.55) ** 2 * 35);

  return score;
}

async function checkIssueAndPullRequestActivity(
  context: ReturnType<typeof createGitHubContext>,
  pullRequests: GitHubSearchResponse<GitHubIssue>,
  issues: GitHubSearchResponse<GitHubIssue>,
) {
  const recentItems = [...pullRequests.items, ...issues.items];
  const dailyActivity = countByDay(recentItems, (item) => item.created_at);
  const maxDailyActivity = Math.max(0, ...dailyActivity.values());

  if (maxDailyActivity >= 60 || issues.total_count >= 120) return "bot" as const;

  let score = 0;

  if (maxDailyActivity >= 25 || issues.total_count >= 60) score += 35;
  else if (maxDailyActivity >= 12 || issues.total_count >= 30) score += 20;

  score += scorePullRequestBodies(pullRequests.items);
  score += await scoreRepositorySpan(context, recentItems);

  return score;
}

function scorePullRequestBodies(pullRequests: GitHubIssue[]) {
  if (pullRequests.length < 5) return 0;

  const templateMatches = pullRequests.filter((pullRequest) => {
    const body = pullRequest.body ?? "";
    return /^#{1,3}\s+(summary|validation)\b/im.test(body);
  }).length;
  const ratio = templateMatches / pullRequests.length;

  if (templateMatches >= 10 && ratio >= 0.7) return 45;

  if (templateMatches >= 5 && ratio >= 0.4) return 30;

  return 0;
}

async function scoreRepositorySpan(
  context: ReturnType<typeof createGitHubContext>,
  items: GitHubIssue[],
) {
  const repositoryUrls = [...new Set(items.map((item) => item.repository_url))].slice(0, 30);

  if (repositoryUrls.length < 20) return 0;

  const repositories = await Promise.all(
    repositoryUrls.map((url) =>
      fetchGitHub<GitHubRepository>(context, url.replace(GITHUB_API, "")),
    ),
  );
  const languages = new Set(
    repositories
      .map((repository) => repository?.language)
      .filter((language) => typeof language === "string"),
  );

  if (repositoryUrls.length >= 20 && languages.size >= 10) return 20;

  return 0;
}

function countByDay<T>(items: T[], getDate: (item: T) => string) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const day = getDate(item).slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return counts;
}
