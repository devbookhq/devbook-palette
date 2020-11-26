import { getGithubAccessToken } from 'mainProcess';
import { Octokit } from '@octokit/rest';

export interface CodeResult {
  name: string;
  path: string;
  text_matches: {
    fragment: string;
    matches: { indices: number[], text: string; }[];
  }[];
}

let octokit: Octokit | undefined;

export async function init(accessToken?: string) {
  const auth = accessToken || await getGithubAccessToken();

  if (!auth) {
    throw new Error('No access token found');
  }

  octokit = new Octokit({ auth });
}

export async function getUserInfo() {
  const result = await octokit?.users.getAuthenticated();
  return {
    name: result?.data.name,
    login: result?.data.login,
  };
}

export async function searchCode(query: string, pageSize?: number, page?: number) {
  if (!octokit) {
    await init();
  }

  const result = await octokit!.search.code({
    headers: {
      accept: 'application/vnd.github.v3.text-match+json',
    },
    q: query,
    page,
    per_page: pageSize,
  });

  return result.data.items;
}

export async function searchRepositories(query: string, pageSize?: number, page?: number) {
  if (!octokit) {
    await init();
  }

  const result = await octokit!.search.issuesAndPullRequests({
    q: query,
    page,
    per_page: pageSize,
  });

  return result.data.items;
}

export async function searchIssues(query: string, pageSize?: number, page?: number) {
  if (!octokit) {
    await init();
  }

  const result = await octokit!.search.repos({
    q: query,
    page,
    per_page: pageSize,
  });

  return result.data.items;
}

