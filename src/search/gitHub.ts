import { getGitHubAccessToken } from 'mainProcess';
import { Octokit } from '@octokit/rest';

let octokit: Octokit | undefined;

export async function init(accessToken?: string) {
  if (!accessToken) {
    const accessToken = await getGitHubAccessToken();
    octokit = new Octokit({
      auth: accessToken,
    });
  } else {
    octokit = new Octokit({
      auth: accessToken,
    });
  }
}

export function isInitialized() {
  return !!octokit;
}

export async function getUserInfo() {
  const result = await octokit?.users.getAuthenticated();
  return {
    name: result?.data.name,
    login: result?.data.login,
  };
}

export async function searchCode(query: string, page?: number) {
  if (!octokit) {
    throw new Error('GitHub is not initialized');
  }

  const result = await octokit.search.code({
    q: query,
    page,
  });

  return result.data.items;
}

export async function searchRepositories(query: string, page?: number) {
  if (!octokit) {
    throw new Error('GitHub is not initialized');
  }

  const result = await octokit.search.issuesAndPullRequests({
    q: query,
    page,
  });

  return result.data.items;
}

export async function searchIssues(query: string, page?: number) {
  if (!octokit) {
    throw new Error('GitHub is not initialized');
  }

  const result = await octokit.search.repos({
    q: query,
    page,
  });

  return result.data.items;
}
