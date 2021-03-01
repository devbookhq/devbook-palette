import { ElectronStore } from '../../mainCommunication/electron';
import debounce from '../../utils/debounce';

interface HistoryEntry {
  query: string;
  occurence: number;
}

class HistoryStore {
  private static readonly store = new ElectronStore({
    name: 'history',
  });

  private static readonly searchHistoryEntriesStoreName = 'searchHistoryEntries';

  private static readonly maxHistorySize = 200;
  private static entries = HistoryStore.store.get(HistoryStore.searchHistoryEntriesStoreName, []) as HistoryEntry[];
  static readonly debouncedSaveQuery = debounce(HistoryStore.saveQuery, 5000);

  static get queries() {
    return HistoryStore.entries
      .map(e => e.query)
      .slice(-20);
  }

  private static saveQuery(query: string) {
    const index = HistoryStore.entries.findIndex(e => e.query === query);
    const entry = HistoryStore.entries[index];
    if (entry) {
      entry.occurence = entry.occurence + 1;
      HistoryStore.entries.push(HistoryStore.entries.splice(index, 1)[0]);
    } else {
      const length = HistoryStore.entries.push({ query, occurence: 1 });
      if (length > HistoryStore.maxHistorySize) {
        HistoryStore.entries.splice(0, length - HistoryStore.maxHistorySize);
      }
    }

    HistoryStore.entries = [
      ...HistoryStore.entries.slice(0, -4).sort((a, b) => a.occurence - b.occurence),
      ...HistoryStore.entries.slice(-4),
    ];

    HistoryStore.store.set(HistoryStore.searchHistoryEntriesStoreName, HistoryStore.entries);
    return HistoryStore.queries;
  }

  private constructor() { }
}

export default HistoryStore;
