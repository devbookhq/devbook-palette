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

enum DocSourceVersion {
  V0 = 'v0',
  V1 = 'v1',
}

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
  version: DocSourceVersion;
  iconURL: string;
}

export async function search(query: string, docSource: DocSource): Promise<DocResult[]> {
  const version = docSource.version === DocSourceVersion.V0 ? '' : `/${docSource.version}`;
  const url = isDev ? `https://dev.usedevbook.com${version}/search/docs` : `https://api.usedevbook.com${version}/search/docs`;
  //const url = `http://127.0.0.1:3002${version}/search/docs`;


  const body = {
    query,
    filter: docSource.version === DocSourceVersion.V0 ? [docSource.slug] : docSource.slug,
  }

  const result = await axios.post(url, body);
  return result.data.results;
}

export async function fetchDocSources(): Promise<DocSource[]> {
  const url = isDev ? 'https://dev.usedevbook.com/v1/search/docs' : 'https://api.usedevbook.com/v1/search/docs';

  const result = await axios.get(url);
  return result.data.docs;
}
