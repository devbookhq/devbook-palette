import { observer } from 'mobx-react-lite';
import { useSearchStore } from 'Search/search.store';
import Loader from 'components/Loader';

function SearchLoader() {
  const searchStore = useSearchStore();
  return (
    <>
      {searchStore.isSearching &&
        <Loader />
      }
    </>
  );
}

export default observer(SearchLoader);
