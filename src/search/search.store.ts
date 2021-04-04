import {
  makeAutoObservable,
  IReactionDisposer,
  reaction,
} from 'mobx';
import RootStore, { useRootStore } from 'App/RootStore';
import SearchService, { SearchSource, SearchFilterTypings, SearchResultTypings } from 'services/search.service';
import { SearchMode } from 'services/search.service/searchMode';

export function useSearchStore() {
  const { searchStore } = useRootStore();
  return searchStore;
}

type SourceFilters = {
  [source in SearchSource]?: {
    availableFilters: SearchFilterTypings[source][];
    selectedFilter?: SearchFilterTypings[source];
  };
}

type SourceResults = {
  [source in SearchSource]?: SearchResultTypings[source][];
}

export default class SearchStore {
  autosaveHandler: IReactionDisposer;

  query: string = '';
  searchMode: SearchMode = SearchMode.OnEnterPress;
  readonly history: string[] = [];
  readonly results: SourceResults = {};
  readonly filters: SourceFilters = {};

  constructor(readonly rootStore: RootStore) {
    makeAutoObservable(this);
    this.autosaveHandler = reaction(
      () => this.asJSON,
      json => {
        // TODO: Save with syncService.
      },
    );
    this.sync();
  }

  dispose() {
    this.autosaveHandler();
  }

  get asJSON() {
    return {
      query: this.query,
      results: this.results,
      searchMode: this.searchMode,
      history: this.history,
    };
  }

  private async refreshSearchFilters() {
    return Promise.all((Object.keys(SearchSource) as SearchSource[]).map(async (source) => {
      // TypeScript cannot dynamically derive generic types, so we are using `any` here.
      const availableFilters = await SearchService.listFilters(source) as any;
      const selectedFilter = this.filters[source]?.selectedFilter || availableFilters[0];

      this.filters[source] = {
        availableFilters,
        selectedFilter,
      };
    }));
  }

  async executeSearch() {
    this.history.push(this.query);
    return Promise.all((Object.keys(SearchSource) as SearchSource[]).map(async (source) => {
      // TypeScript cannot dynamically derive generic types, so we are using `any` here.
      this.results[source] = await SearchService.search(source, { query: this.query }) as any;
    }));
  }

  private sync() {
    // TODO: Load values using syncService.
  }
}
