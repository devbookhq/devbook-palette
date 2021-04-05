import { useState } from 'react';

import { HistoryEntry } from 'Search/search.store';
import SearchHistoryQuery from './SearchHistoryQuery';

interface SearchHistoryQueriesProps {
  history: HistoryEntry[];
}

function SearchHistoryQueries({ history }: SearchHistoryQueriesProps) {
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);

  return (
    <>
      {history.map((entry, i) => (
        <SearchHistoryQuery
          key={entry.query}
          query={entry.query}
          isSelected={selectedQueryIdx === i}
        />
      ))}
    </>
  );
}

export default SearchHistoryQueries;
