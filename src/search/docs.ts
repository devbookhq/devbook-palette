import axios from 'axios';

import { isDev } from 'mainCommunication';

/*
interface Page {
  route: string[];
  breadcrumbs: string[];
  html: string;
  documentation: string;
  name: string;
  summary: string;
  hasHTMLExtension: boolean;
  pageURL: string;
}
*/

interface Page {
  html: string;
  documentation: string; // Name of the documentation.
  name: string; // Title of the found section.
  breadcrumbs: string[];
  summary: string;
  anchor: string; // ID of the element where the found section starts.
  pageURL: string;
}

export interface DocResult {
  score: number;
  id: string;
  page: Page;
}

export interface DocSource {
  slug: string;
  name: string;
}

export async function search(query: string, docSources: DocSource[]): Promise<DocResult[]> {
  const url = isDev ? 'https://dev.usedevbook.com/search/docs' : 'https://api.usedevbook.com/search/docs';

  const result = await axios.post(url, { query, filter: docSources.length > 0 ? docSources.map(ds => ds.slug) : undefined });
  return result.data.results;
}

export async function fetchDocSources(): Promise<DocSource[]> {
  const url = isDev ? 'https://dev.usedevbook.com/search/docs' : 'https://api.usedevbook.com/search/docs';

  const result = await axios.get(url);
  return result.data.docs.map((ds: DocSource) => ({ ...ds }));
}
