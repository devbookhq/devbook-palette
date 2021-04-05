import {
  makeAutoObservable,
  IReactionDisposer,
  reaction,
  observable,
} from 'mobx';
import RootStore, { useRootStore } from 'App/RootStore';
import SearchService, { SearchSource, SearchFilterTypings, SearchResult } from 'services/search.service';
import { SearchMode } from 'services/search.service/searchMode';
import SyncService, { StorageKey } from 'services/sync.service';

export function useSearchStore() {
  const { searchStore } = useRootStore();
  return searchStore;
}

export type SourceFilters = {
  [source in SearchSource]: {
    availableFilters: SearchFilterTypings[source][];
    selectedFilter: SearchFilterTypings[source] | undefined;
  };
}

export interface HistoryEntry {
  query: string;
}

export type SourceResults = {
  [source in SearchSource]: SearchResult[source][];
}

export type SourceResultsSelection = {
  [source in SearchSource]: number;
}

class SearchStore {
  readonly _maxHistorySize = 20;

  autosaveHandler: IReactionDisposer;

  _query: string = '';
  _searchMode: SearchMode = SearchMode.OnEnterPress;
  _history: HistoryEntry[] = [];

  readonly results: SourceResults = {
    [SearchSource.Docs]: [],
    [SearchSource.StackOverflow]: [],
  };

  readonly selectedResults: SourceResultsSelection = {
    [SearchSource.Docs]: 0,
    [SearchSource.StackOverflow]: 0,
  };

  readonly filters: SourceFilters = {
    [SearchSource.Docs]: { availableFilters: [], selectedFilter: undefined },
    [SearchSource.StackOverflow]: { availableFilters: [], selectedFilter: undefined },
  };

  set query(query: string) {
    this._query = query;
  }

  get query() {
    return this._query;
  }

  set searchMode(mode: SearchMode) {
    this._searchMode = mode;
  }

  get searchMode() {
    return this._searchMode;
  }

  constructor(readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      _maxHistorySize: false,
      autosaveHandler: false,
    });
    this.autosaveHandler = reaction(
      () => this.asJSON,
      json => {
        // TODO: Save with syncService.
      },
    );
    this.refreshSearchFilters();
    // this.sync();
    // setInterval(() => this.backup(), 20000);
  }

  dispose() {
    this.autosaveHandler();
  }

  private setResults<T extends SearchSource>(source: T, results: SearchResult[T][]) {
    this.results[source] = results as any;
  }

  private hasSelectedResult<T extends SearchSource>(source: T) {
    return this.results[source].length > 0 && this.results[source].length > this.selectedResults[source];
  }

  getSelectedResult<T extends SearchSource>(source: T) {
    if (this.hasSelectedResult(source)) return this.results[source][this.selectedResults[source]];
    throw new Error(`No selected result in ${source}`);
  }

  get asJSON() {
    return {
      query: this.query,
      results: this.results,
      searchMode: this.searchMode,
      history: this.history,
    };
  }

  private setFilter<T extends SearchSource>(source: T, filters: SourceFilters[T]) {
    this.filters[source] = filters;
  }

  private async refreshSearchFilters() {
    return Promise.all((Object.values(SearchSource) as SearchSource[]).map(async (source) => {
      const availableFilters = await SearchService.listFilters(source);
      const selectedFilter = this.filters[source]?.selectedFilter || availableFilters[0];
      this.setFilter(source, {
        availableFilters,
        selectedFilter,
      });
    }));
  }

  async executeSearch(query?: string) {
    if (query !== undefined) this.query = query;
    if (!this.query) return;

    console.log('Search query', this.query);

    const stackOverflowResultsPromise = SearchService.search(SearchSource.StackOverflow, { query: this.query });
    const docsResultsPromise = this.filters.docs.selectedFilter
      ? SearchService.search(SearchSource.Docs, { query: this.query, filter: this.filters.docs.selectedFilter })
      : [];

    const [stackOverflowResults, docsResults] = await Promise.all([stackOverflowResultsPromise, docsResultsPromise]);

    this.setResults(SearchSource.StackOverflow, stackOverflowResults);
    this.setResults(SearchSource.Docs, docsResults);

    if (stackOverflowResults.length > 0 || docsResults.length > 0) this.saveHistoryQuery(this.query);
  }

  get history() {
    return this._history
      .slice(-10)
      .reverse();
  }

  saveHistoryQuery(query: string) {
    if (!query) return;

    const index = this.history.findIndex(e => e.query === query);
    const entry = this.history[index];

    if (entry) {
      this.history.push(this.history.splice(index, 1)[0]);
    } else {
      const length = this.history.push({ query });
      if (length > this._maxHistorySize) {
        this.history.splice(0, length - this._maxHistorySize);
      }
    }
  }

  private async sync() {
    const query = await SyncService.get(StorageKey.LastQuery);
    const searchMode = await SyncService.get(StorageKey.SearchMode);
    // const docsFilter = await SyncService.get(StorageKey.ActiveDocSource);
    // const searchSource = await SyncService.get(StorageKey.SearchFilter);

    this.query = query;
    this.searchMode = searchMode;
    // this.filters[SearchSource.Docs].selectedFilter = docsFilter;

    // TODO: Load values using syncService.
  }

  private backup() {
    SyncService.set(StorageKey.LastQuery, this.query);
    SyncService.set(StorageKey.SearchMode, this.searchMode);
    // SyncService.set(StorageKey.ActiveDocSource, this.filters.docs.selectedFilter);
    // SyncService.set(StorageKey.SearchFilter, this.sea);
  }
}

export default SearchStore;
