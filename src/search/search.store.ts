import {
  makeAutoObservable,
  IReactionDisposer,
  reaction,
} from 'mobx';
import RootStore, { useRootStore } from 'App/RootStore';
import SearchService from 'services/search.service';
import SyncService from 'services/sync.service';
import { SearchSource } from 'Search';
import { SearchMode } from 'Preferences/Pages/searchMode';

export function useSearchStore() {
  const { searchStore } = useRootStore();
  return searchStore;
}

export default class SearchStore {
  autosaveHandler: IReactionDisposer;
  searchService = new SearchService();
  syncService = new SyncService();

  query: string = '';
  results: any[] = []; // TODO: Type
  searchMode: any; // TODO: Type
  history: string[] = []; // TODO: Type

  activeSearchSource = SearchSource.Stack;
  activeSearchMode = SearchMode.OnEnterPress;

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

  private sync() {
    // TODO: Load values using syncService.
  }
}

