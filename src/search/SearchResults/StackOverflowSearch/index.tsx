import { useSearchStore } from 'Search/search.store';
import { observer } from 'mobx-react-lite';

import StackOverflowResultsList from './StackOverflowSearchResults';
import StackOverflowModal from './StackOverflowSearchModal';
import { useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service';

function StackOverflowSearch() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  return (
    <>
      {uiStore.isModalOpened &&
        <StackOverflowModal
          result={searchStore.getSelectedResult(SearchSource.StackOverflow)}
        />
      }
      <StackOverflowResultsList
        results={searchStore.results.stackOverflow}
        selectedIdx={searchStore.selectedResults.stackOverflow}
      />
    </>
  );
}

export default observer(StackOverflowSearch);
