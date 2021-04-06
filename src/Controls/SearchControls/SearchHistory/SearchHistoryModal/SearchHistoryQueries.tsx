import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { HistoryEntry } from 'Search/search.store';
import SearchHistoryQuery from './SearchHistoryQuery';

interface SearchHistoryQueriesProps {
  history: HistoryEntry[];
  onQueryClick: (query: string) => void;
  selectedQueryIdx: number;
}

function SearchHistoryQueries({ history, onQueryClick, selectedQueryIdx }: SearchHistoryQueriesProps) {
  const queryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queryRef?.current?.scrollIntoView({ block: 'end' });
  }, [selectedQueryIdx]);

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

export default observer(SearchHistoryQueries);
