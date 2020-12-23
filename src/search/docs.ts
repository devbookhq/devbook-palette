import { isDev } from 'mainProcess';
import axios from 'axios';

export interface DocResult {
  score: number;
  id: string;
  highlight: string;
  record: {
    categories: string[];
    html: string;
  };
}

export async function search(query: string): Promise<DocResult[]> {
  let url = 'https://api.usedevbook.com/search/docs';
  if (isDev) url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query });
  return result.data.results;
}

