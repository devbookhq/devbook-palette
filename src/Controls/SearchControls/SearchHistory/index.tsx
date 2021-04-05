import { observer } from 'mobx-react-lite';
import { useUIStore } from 'ui/ui.store';

import SearchHistoryModal from './SearchHistoryModal';
import Button from 'components/Button';

function SearchHistory() {
  const uiStore = useUIStore();

  return (
    <>
      <Button
        onClick={uiStore.toggleSeachHistory.bind(uiStore)}
      >
        History
      </Button>
      {uiStore.isSearchHistoryVisible &&
        <SearchHistoryModal />
      }
    </>
  );
}

export default observer(SearchHistory);
