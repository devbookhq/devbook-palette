import axios from 'axios';
import ElectronService from 'services/electron.service';
import { APIVersion } from 'services/api.service';
import { SearchSource } from './searchSource';
import { DocSource } from './docSource';

export type SearchFilterTypings = {
  [SearchSource.Docs]: DocSource;
  [SearchSource.StackOverflow]: never;
}

interface Page {
  html: string;
  name: string; // Title of the found section.
  breadcrumbs: string[];
  summary: string;
  anchor: string; // ID of the element where the found section starts.
  pageURL?: string;
  urlWithoutAnchor?: string;
}

export interface DocResult {
  score: number;
  id: string;
  page: Page;
}

export enum AnswerType {
  Accepted = 'Accepted answer',
  MostUpvoted = 'Most upvoted answer',
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

export type SearchResult = {
  [SearchSource.Docs]: DocResult;
  [SearchSource.StackOverflow]: StackOverflowResult;
};

type SearchOptionsTypings = {
  [SearchSource.StackOverflow]: {};
  [SearchSource.Docs]: { filter: DocSource };
};

type SearchFilterMap = {
  [source in SearchSource]: SearchFilterTypings[source];
}

type SearchOptionsMap = {
  [source in SearchSource]: SearchOptionsTypings[source] & { version?: APIVersion, query: string };
}

export type SearchResultMap = {
  [source in SearchSource]: SearchResult[source];
}

class SearchService {
  private constructor() { }
  private static readonly baseURL = ElectronService.isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  private static readonly apiVersion = APIVersion.V1;
  private static readonly baseURLWithVersion = `${SearchService.baseURL}/${SearchService.apiVersion}`;

  static async listFilters<T extends SearchSource>(source: T): Promise<SearchFilterMap[T][]> {
    switch (source) {
      case SearchSource.Docs:
        return (await axios.get('/search/docs',
          { baseURL: SearchService.baseURLWithVersion },
        )).data.docs;

      default:
        return [];
    }
  }

  static async search<T extends SearchSource>(source: T, options: SearchOptionsMap[T]): Promise<SearchResultMap[T][]> {
    const { query, version } = options;

    try {
      const stackOverflowBaseURL = version
        ? `${SearchService.baseURL}/${version}`
        : SearchService.baseURLWithVersion;

      switch (source) {
        case SearchSource.StackOverflow:
          const stackOverflowResults = await axios.post('/search/stackoverflow',
            { query },
            { baseURL: stackOverflowBaseURL },
          );
          return stackOverflowResults.data.results;

        case SearchSource.Docs:
          const { filter } = options as SearchOptionsMap[SearchSource.Docs];

          const docsVersion = filter.version ? filter.version : version;
          const docsBaseURL = docsVersion ? `${SearchService.baseURL}/${docsVersion}` : SearchService.baseURLWithVersion;
          const docsFilter = docsVersion === APIVersion.V0 ? [filter.slug] : filter.slug;

          const docsResults = await axios.post('/search/docs',
            {
              query,
              filter: docsFilter,
            },
            {
              baseURL: docsBaseURL,
            },
          );

          if (version || SearchService.apiVersion >= APIVersion.V2) {
            const results = docsResults.data.results as DocResult[];
            const pages = docsResults.data.pages as { content: string; url_without_anchor: string }[];
            const style = docsResults.data.style as string;
            return results.map(r => ({
              ...r,
              page: {
                ...r.page,
                html: `${style}${pages.find(p => p.url_without_anchor === r.page.urlWithoutAnchor)}`,
              },
            })) as any;
          }
          return docsResults.data.results;

        default:
          throw new Error(`Invalid search source ${source}.`);
      }
    } catch (error) {
      console.error(error.response);
      throw error;
    }
  }
}

export default SearchService;
