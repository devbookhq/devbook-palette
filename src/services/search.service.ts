import axios from 'axios';
import ElectronService from 'services/electron.service';
import { APIVersion } from 'services/api.service';

export enum SearchSource {
  StackOverflow = 'stackOverflow',
  Docs = 'docs',
}

type SearchFilterTypings = {
  [SearchSource.Docs]: string[];
  [SearchSource.StackOverflow]: never;
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
  version: APIVersion;
  iconURL: string;
}

export interface StackOverflowQuestion {
  link: string;
  title: string;
  html: string;
  timestamp: number;
  votes: number;
}

export interface StackOverflowAnswer {
  html: string;
  votes: number;
  isAccepted: boolean;
  timestamp: number;
}

export interface StackOverflowResult {
  question: StackOverflowQuestion;
  answers: StackOverflowAnswer[];
}

type SearchResultTypings = {
  [SearchSource.Docs]: DocResult[];
  [SearchSource.StackOverflow]: StackOverflowResult[];
};

type SearchOptionsTypings = {
  [SearchSource.StackOverflow]: {};
  [SearchSource.Docs]: { filter: string };
};

type SearchFilterMap = {
  [source in SearchSource]: SearchFilterTypings[source];
}

type SearchOptionsMap = {
  [source in SearchSource]: SearchOptionsTypings[source] & { version?: APIVersion, query: string };
}

type SearchResultMap = {
  [source in SearchSource]: SearchResultTypings[source];
}

class SearchService {
  private constructor() { }
  private static readonly baseURL = ElectronService.isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  private static readonly apiVersion = APIVersion.v1;
  private static readonly baseURLWithVersion = `${SearchService.baseURL}/${SearchService.apiVersion}`;

  static async listFilters<T extends SearchSource>(source: T): Promise<SearchFilterMap[T]> {
    switch (source) {
      case SearchSource.Docs:
        return (await axios.get('/search/docs',
          { baseURL: SearchService.baseURL },
        )).data.docs;

      default:
        throw new Error(`Source ${source} has no list of filters.`);
    }
  }

  static async search<T extends SearchSource>(source: T, options: SearchOptionsMap[T]): Promise<SearchResultMap[T]> {
    const { query, version } = options;

    const baseURL = version
      ? `${SearchService.baseURL}/${version}`
      : SearchService.baseURLWithVersion;

    switch (source) {
      case SearchSource.StackOverflow:
        return (await axios.post('/search/stackoverflow',
          { query },
          { baseURL },
        )).data.results;

      case SearchSource.Docs:
        const { filter } = options as SearchOptionsMap[SearchSource.Docs];
        return (await axios.post('/search/docs',
          { query, filter },
          { baseURL },
        )).data.results;
    }
    throw new Error(`Invalid search source ${source}.`);
  }
}

export default SearchService;
