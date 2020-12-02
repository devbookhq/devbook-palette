import { getGithubAccessToken } from 'mainProcess';
import axios from 'axios';

// TODO: These types are also present in the `devbook` repository - move them into a shared library.
interface FilePreview {
  startLine: number;
  fragment: string;
  indices: number[][];
}

export interface CodeResult {
  repoFullName: string;
  repoURL: string;
  filePath: string;
  fileURL: string;
  filePreviews: FilePreview[];
}

let accessToken: string | null = null;

export async function init(token?: string) {
  accessToken = token || await getGithubAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }
}

export async function searchCode(query: string, pageSize?: number, page?: number): Promise<CodeResult[]> {
  if (!accessToken) {
    await init();
  }

  // const result = await axios.post('http://localhost:3002/search/github/code', {
  const result = await axios.post('https://api.getsidekick.app/search/github/code', {
    accessToken,
    query,
    pageSize,
    page,
  })

  return result.data.results;
}

