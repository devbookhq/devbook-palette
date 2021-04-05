import { observer } from 'mobx-react-lite';

import { useSearchStore } from 'Search/search.store';
import SearchHistoryQueries from './SearchHistoryQueries';

function SearchHistoryModal() {
  const searchStore = useSearchStore();

  return (
    <>
      <SearchHistoryQueries
        history={searchStore.history}
      />
    </>
  );
}

export default observer(SearchHistoryModal);
