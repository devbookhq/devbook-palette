import { useSearchStore } from 'Search/search.store';
import { observer } from 'mobx-react-lite';

import DocsSearchResults from './DocsSearchResults';
import DocsFilterModal from './DocsFilterModal';
import { useUIStore } from 'ui/ui.store';

function DocsSearch() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  return (
    <>
      {uiStore.isFilterModalOpened &&
        <DocsFilterModal
          filters={searchStore.filters.docs}
        />
      }
      <DocsSearchResults
        results={searchStore.results.docs}
        selectedIdx={searchStore.selectedResults.docs}
      />
    </>
  );
}

export default observer(DocsSearch);
