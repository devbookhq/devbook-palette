import Button from 'components/Button';
import { useSearchStore } from 'Search/search.store';

function SearchButton() {
  const searchStore = useSearchStore();

  return (
    <Button
      onClick={() => searchStore.executeSearch()}
    >
      Search
    </Button>
  );
}

export default SearchButton;
