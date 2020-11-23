import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

// TODO: Add github app credentials


export async function searchRepos(query: string) {
  const result = await octokit.search.repos({
    q: query,
  });
  return result.data.items;
}

export async function searchCode(query: string) {
  const result = await octokit.search.code({
    q: query,
  });
  return result.data.items;
}

export async function searchIssues(query: string) {
  const result = await octokit.search.issuesAndPullRequests({
    q: query,
  });
  return result.data.items;
}
