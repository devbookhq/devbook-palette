import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service';
import { useUIStore } from 'ui/ui.store';
import SearchSourceFilter from './SearchSourceFilter';

function SearchSourceFilters() {
  const uiStore = useUIStore();

  const changeFilter = useCallback((source: SearchSource) => {
    uiStore.searchSource = source;
  }, []);

  return (
    <>
      <SearchSourceFilter
        source={SearchSource.StackOverflow}
        onSelect={changeFilter}
        isSelected={uiStore.searchSource === SearchSource.StackOverflow}
      />
      <SearchSourceFilter
        source={SearchSource.Docs}
        onSelect={changeFilter}
        isSelected={uiStore.searchSource === SearchSource.Docs}
      />
    </>
  );
}

export default observer(SearchSourceFilters);