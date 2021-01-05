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

export interface DocSource {
  slug: string;
  name: string;
  isIncludedInSearch: boolean;
}

export async function search(query: string, docSources: DocSource[]): Promise<DocResult[]> {
  let url = 'https://api.usedevbook.com/search/docs';
  if (isDev) url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query, filter: docSources.length > 0 ? docSources.map(ds => ds.slug) : undefined });
  return result.data.results;
}

export async function fetchDocSources(): Promise<DocSource[]> {
  let url = 'https://api.usedevbook.com/search/docs';
  if (isDev) url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.get(url);
  return result.data.docs.map((ds: DocSource) => ({...ds, isIncludedInSearch: true}));
}

