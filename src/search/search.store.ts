import {
  makeAutoObservable,
  toJS,
} from 'mobx';
import { useRootStore } from 'App/RootStore';
import SearchService, { SearchFilterTypings, SearchResult } from 'services/search.service';
import { SearchSource } from 'services/search.service/searchSource';
import SyncService, { StorageKey } from 'services/sync.service';
import { HistoryEntry } from './historyEntry';

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

export type SourceResults = {
  [source in SearchSource]: { results: SearchResult[source][], selectedIdx: number };
}

export type SourceResultsSelection = {
  [source in SearchSource]: number;
}

type SearchInvocation = Promise<void>;

class SearchStore {
  readonly _maxHistorySize = 20;

  _isSearching = false;
  _query: string = '';
  _lastQuery: string = '';
  _history: HistoryEntry[] = [];
  _lastSearchInvocation?: SearchInvocation;

  readonly results: SourceResults = {
    [SearchSource.Docs]: { results: [], selectedIdx: 0 },
    [SearchSource.StackOverflow]: { results: [], selectedIdx: 0 },
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

  get isQueryDirty() {
    return this._query !== this._lastQuery;
  }

  get isSearching() {
    return this._isSearching;
  }

  set isSearching(value: boolean) {
    this._isSearching = value;
  }

  setSelectedFilter<T extends SearchSource>(source: T, value: SearchFilterTypings[T] | undefined) {
    this.filters[source].selectedFilter = value;
    this.executeSearch();
  }

  private setLastQuery(query: string) {
    this._lastQuery = query;
  }

  constructor() {
    makeAutoObservable(this, {
      _maxHistorySize: false,
      _lastSearchInvocation: false,
    });
    this.sync().then(() => {
      this.executeSearch();
      this.backup();
    });
  }

  private setResults<T extends SearchSource>(source: T, results: SearchResult[T][]) {
    this.results[source].results = results as any;
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
    this.setLastQuery(this.query);
    this.isSearching = true;

    const searchInvocation = new Promise<void>(async (resolve, reject) => {
      try {
        const stackOverflowResultsPromise = SearchService.search(SearchSource.StackOverflow, { query: this.query });
        const docsResultsPromise = this.filters.docs.selectedFilter
          ? SearchService.search(SearchSource.Docs, { query: this.query, filter: this.filters.docs.selectedFilter })
          : [];

        const [stackOverflowResults, docsResults] = await Promise.all([stackOverflowResultsPromise, docsResultsPromise]);

        if (this._lastSearchInvocation === searchInvocation) {
          this.setResults(SearchSource.StackOverflow, stackOverflowResults);
          this.setResults(SearchSource.Docs, docsResults);
          this.isSearching = false;
          if (stackOverflowResults.length > 0 || docsResults.length > 0) this.saveHistoryQuery(this.query);
        }
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
    this._lastSearchInvocation = searchInvocation;
    return searchInvocation;
  }

  set history(value: HistoryEntry[]) {
    this._history = value;
  }

  get history() {
    return this._history
      .slice(-10)
      .filter(h => h.query !== this.query)
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
    const docsSelectedFilter = await SyncService.get(StorageKey.ActiveDocSource);
    const history = await SyncService.get(StorageKey.SearchHistoryEntries);
    this.query = query;
    this.history = history;
    this.setSelectedFilter(SearchSource.Docs, docsSelectedFilter);
    await this.refreshSearchFilters();
  }

  private backup() {
    SyncService.registerBackup(StorageKey.LastQuery, () => this.query);
    SyncService.registerBackup(StorageKey.ActiveDocSource, () => toJS(this.filters[SearchSource.Docs].selectedFilter));
    SyncService.registerBackup(StorageKey.SearchHistoryEntries, () => toJS(this._history));
  }
}

export default SearchStore;
