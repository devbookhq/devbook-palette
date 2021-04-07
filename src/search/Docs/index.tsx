import { useSearchStore } from 'Search/search.store';
import { observer } from 'mobx-react-lite';

import { useUIStore } from 'ui/ui.store';
import DocsSearchResults from './DocsResults';
import DocsFilterModal from './DocsFilterModal';

function DocsSearch() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  return (
    <>
      {uiStore.isFilterModalOpened &&
        <DocsFilterModal
          onCloseRequest={uiStore.toggleFilterModal}
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
