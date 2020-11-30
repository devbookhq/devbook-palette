import { getGithubAccessToken } from 'mainProcess';
import axios from 'axios';
// import { Octokit } from '@octokit/rest';

export interface CodeResult {
  filePath: string;
  repoFullName: string;
  filePreviews: {
    startLine: number;
    fragment: string;
    indices: number[];
  }[];
  repoURL: string;
  fileURL: string;
}

// let octokit: Octokit | undefined;
let accessToken: string | null = null;

export async function init(token?: string) {
  accessToken = token || await getGithubAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }
}

export async function searchCode(query: string, pageSize?: number, page?: number) {
  if (!accessToken) {
    await init();
  }

  const result = await axios.post('https://api.getsidekick.app/search/github/code', { accessToken, query })
  console.log('github result', result);

  /*
  const result = await octokit!.request('GET /search/code', {
    headers: {
      accept: 'application/vnd.github.v3.text-match+json',
    },
    q: query,
    page,
    per_page: pageSize,
  });
  */

  return result.data.results as CodeResult[];
}

