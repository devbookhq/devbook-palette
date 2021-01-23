import axios from 'axios';

import {
  isDev,
  getGithubAccessToken,
} from 'mainCommunication';

// TODO: These types are also present in the `devbook` repository - move them into a shared library.
export interface FilePreview {
  startLine: number;
  fragment: string;
  indices: number[][];
}

export interface CodeResult {
  repoFullName: string;
  repoURL: string;
  filePath: string;
  fileURL: string;
  fileContent: string;
  absoluteIndices: number[][];
  filePreviews: FilePreview[];
}

let accessToken: string | null = null;

export async function init(token?: string) {
  accessToken = token || accessToken || await getGithubAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }
}

export function disconnect() {
  accessToken = null;
}

export function getIsGitHubConnected() {
  if (accessToken) return true;
}

export async function searchCode(query: string, pageSize?: number, page?: number): Promise<CodeResult[]> {
  if (!accessToken) {
    await init();
  }

  let url = 'https://api.usedevbook.com/search/github/code';
  if (isDev) url = 'https://dev.usedevbook.com/search/github/code';

  const result = await axios.post(url, {
    accessToken,
    query,
    pageSize,
    page,
  })

  return result.data.results;
}
