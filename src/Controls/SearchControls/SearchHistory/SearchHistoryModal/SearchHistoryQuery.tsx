import Button from 'components/Button';
import { useSearchStore } from 'Search/search.store';

interface SearchHistoryQuery {
  query: string;
  isSelected: boolean;
}

function SearchHistoryQuery({ query }: SearchHistoryQuery) {
  const searchStore = useSearchStore();
  return (
    <>
      <Button
        onClick={() => searchStore.executeSearch(query)}
      >
        {query}
      </Button>
    </>
  );
}

export default SearchHistoryQuery;
