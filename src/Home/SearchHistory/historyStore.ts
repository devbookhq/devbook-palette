import { ElectronStore } from 'mainCommunication/electron';
import debounce from 'utils/debounce';

interface HistoryEntry {
  query: string;
}

class HistoryStore {
  private static readonly store = new ElectronStore({
    name: 'history',
  });

  private static readonly searchHistoryEntriesStoreName = 'searchHistoryEntries';

  private static readonly maxHistorySize = 20;
  private static entries = HistoryStore.store.get(HistoryStore.searchHistoryEntriesStoreName, []) as HistoryEntry[];
  static readonly saveDebouncedQuery = debounce(HistoryStore.saveQuery, 5000);

  static get queries() {
    return HistoryStore.entries
      .map(e => e.query)
      .slice(-10)
      .reverse();
  }

  private static saveQuery(query: string) {
    const index = HistoryStore.entries.findIndex(e => e.query === query);
    const entry = HistoryStore.entries[index];

    if (entry) {
      HistoryStore.entries.push(HistoryStore.entries.splice(index, 1)[0]);
    } else {
      const length = HistoryStore.entries.push({ query });
      if (length > HistoryStore.maxHistorySize) {
        HistoryStore.entries.splice(0, length - HistoryStore.maxHistorySize);
      }
    }

    HistoryStore.store.set(HistoryStore.searchHistoryEntriesStoreName, HistoryStore.entries);
  }

  private constructor() { }
}

export default HistoryStore;
