import { isDev } from 'mainProcess';
import axios from 'axios';

interface Page {
  route: string[];
  breadcrumbs: string[];
  html: string;
  documentation: string;
  name: string;
  summary: string;
}

export interface DocResult {
  score: number;
  id: string;
  highlights: string[];
  page: Page;
}

export async function search(query: string): Promise<DocResult[]> {
  let url = 'https://api.usedevbook.com/search/docs';
  if (isDev) url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query });
  console.log('docs', result.data.results);
  return result.data.results;
}

