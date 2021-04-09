import { useRef, useEffect } from 'react';

import { HistoryEntry } from "Search/historyEntry";
import SearchHistoryQuery from './SearchHistoryQuery';

interface SearchHistoryQueriesProps {
  history: HistoryEntry[];
  onQueryClick: (query: string) => void;
  selectedQueryIdx: number;
}

function SearchHistoryQueries({ history, onQueryClick, selectedQueryIdx }: SearchHistoryQueriesProps) {
  return (
    <>
      {history.map((h, i) => (
        <SearchHistoryQuery
          key={h.query}
          query={h.query}
          isSelected={selectedQueryIdx === i}
          onClick={() => onQueryClick(h.query)}
        />
      ))}
    </>
  );
}

export default SearchHistoryQueries;
