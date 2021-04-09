import { useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import Hotkey from 'components/Hotkey';
import { useSearchStore } from 'Search/search.store';
import { useUIStore, HotkeyAction } from 'ui/ui.store';
import useHotkey from 'hooks/useHotkey';

function SearchButton() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  const searchCurrentQuery = useCallback(() => {
    searchStore.executeSearch();
  }, []);

  useHotkey(
    uiStore.hotkeys[HotkeyAction.Search],
    searchCurrentQuery,
  );

  return (
    <Hotkey
      onClick={searchCurrentQuery}
      isHighlighted={searchStore.isQueryDirty}
      isHighlightedText={searchStore.isQueryDirty}
      hotkey={['Enter']}
    >
      to search
    </Hotkey>
  );
}

export default observer(SearchButton);
