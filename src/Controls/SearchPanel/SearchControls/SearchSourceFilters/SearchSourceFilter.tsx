import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service/searchSource';
import Hotkey from 'components/Hotkey';
import useHotkey from 'hooks/useHotkey';
import { useUIStore, HotkeyAction } from 'ui/ui.store';

interface SearchSourceFilterProps {
  source: SearchSource;
}

const searchSourceNames: { [source in SearchSource]: string } = {
  [SearchSource.Docs]: 'Docs',
  [SearchSource.StackOverflow]: 'Stack Overflow',
}

const searchSourceHotkeyActions: { [source in SearchSource]: HotkeyAction } = {
  [SearchSource.StackOverflow]: HotkeyAction.SelectStackOverflowSource,
  [SearchSource.Docs]: HotkeyAction.SelectDocsSource,
}

function SearchSourceFilter({ source }: SearchSourceFilterProps) {
  const uiStore = useUIStore();

  const changeFilter = useCallback(() => {
    uiStore.searchSource = source;
  }, [source, uiStore]);

  const selectSource = useHotkey(uiStore.hotkeys[searchSourceHotkeyActions[source]],
    changeFilter,
  );

  return (
    <Hotkey
      onClick={selectSource.handler}
      reverseContent={true}
      isHighlightedText={source === uiStore.searchSource}
      hotkey={selectSource.label}
    >
      {searchSourceNames[source]}
    </Hotkey>
  );
}

export default observer(SearchSourceFilter);
