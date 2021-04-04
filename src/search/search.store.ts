import {
  makeAutoObservable,
  IReactionDisposer,
  reaction,
  observable,
  ObservableMap,
  computed
} from 'mobx';
import RootStore, { useRootStore } from 'App/RootStore';
import SearchService, { SearchSource, SearchFilterTypings, SearchResult } from 'services/search.service';
import { SearchMode } from 'services/search.service/searchMode';
import StackOverflowSearch from './StackOverflowSearch';

export function useSearchStore() {
  const { searchStore } = useRootStore();
  return searchStore;
}

type SourceFilters = {
  [source in SearchSource]: {
    availableFilters: SearchFilterTypings[source][];
    selectedFilter: SearchFilterTypings[source] | undefined;
  };
}

type SourceResults = {
  [source in SearchSource]: SearchResult[source][];
}

class SearchStore {
  autosaveHandler: IReactionDisposer;

  query: string = '';
  searchMode: SearchMode = SearchMode.OnEnterPress;
  readonly history: string[] = [];
  readonly results = observable.map({
    [SearchSource.Docs]: [],
    [SearchSource.StackOverflow]: [],
  });

  readonly filters: SourceFilters = {
    [SearchSource.Docs]: { availableFilters: [], selectedFilter: undefined },
    [SearchSource.StackOverflow]: { availableFilters: [], selectedFilter: undefined },
  };

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

  get getResults() {
    return this.results;
  }

  private setQuery(value: string) {
    this.query = value;
  }

  private setResults<T extends SearchSource>(source: T, results: SearchResult[T][]) {
    this.results.set(source, results as any);
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
    return Promise.all((Object.values(SearchSource) as SearchSource[]).map(async (source) => {
      // TypeScript cannot dynamically derive generic types, so we are using `any` here.
      const availableFilters = await SearchService.listFilters(source) as any;
      const selectedFilter = this.filters[source]?.selectedFilter || availableFilters[0];

      this.filters[source] = {
        availableFilters,
        selectedFilter,
      };
    }));
  }

  async executeSearch(query: string) {
    this.setQuery(query);
    // this.history.push(this.query);

    this.setResults(
      SearchSource.StackOverflow,
      await SearchService.search(SearchSource.StackOverflow, { query: this.query })
    );

    if (this.filters.docs.selectedFilter) {
      this.setResults(
        SearchSource.Docs,
        await SearchService.search(SearchSource.Docs, { query: this.query, filter: this.filters.docs.selectedFilter.slug })
      );
    }

  }

  private sync() {
    // TODO: Load values using syncService.
  }
}

export default SearchStore;
