import { ElectronStore } from '../mainCommunication/electron';
import debounce from '../utils/debounce';

interface HistoryEntry {
  query: string;
  occurence: number;
}

class SearchHistory {
  private static readonly store = new ElectronStore({
    name: 'history',
  });

  private static readonly maxHistorySize = 200;
  private static entries = SearchHistory.store.get('searchHistoryEntries1', []) as HistoryEntry[];
  static readonly debouncedSaveQuery = debounce(SearchHistory.saveQuery, 5000);

  static get queries() {
    return SearchHistory.entries
      .map(e => e.query)
      .slice(-20);
  }

  private static saveQuery(query: string) {
    const index = SearchHistory.entries.findIndex(e => e.query === query);
    const entry = SearchHistory.entries[index];
    if (entry) {
      entry.occurence = entry.occurence + 1;
      SearchHistory.entries.push(SearchHistory.entries.splice(index, 1)[0]);
    } else {
      const length = SearchHistory.entries.push({ query, occurence: 1 });
      if (length > SearchHistory.maxHistorySize) {
        SearchHistory.entries.splice(0, length - SearchHistory.maxHistorySize);
      }
    }

    SearchHistory.entries = [
      ...SearchHistory.entries.slice(0, -4).sort((a, b) => a.occurence - b.occurence),
      ...SearchHistory.entries.slice(-4),
    ];

    SearchHistory.store.set('searchHistoryEntries1', SearchHistory.entries);
    return SearchHistory.queries;
  }

  private constructor() { }
}

export default SearchHistory;
