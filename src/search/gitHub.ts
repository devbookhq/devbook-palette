import { getGithubAccessToken } from 'mainProcess';
import { Octokit } from '@octokit/rest';

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

let octokit: Octokit | undefined;

export async function init(accessToken?: string) {
  const auth = accessToken || await getGithubAccessToken();

  if (!auth) {
    throw new Error('No access token found');
  }

  octokit = new Octokit({ auth });
}

export async function searchCode(query: string, pageSize?: number, page?: number) {
  if (!octokit) {
    await init();
  }

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

  return [] as CodeResult[];
}

