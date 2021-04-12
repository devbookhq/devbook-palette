import { useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import Hotkey from 'components/Hotkey';
import { useSearchStore } from 'Search/search.store';
import { useUIStore, HotkeyAction } from 'ui/ui.store';
import useHotkey from 'hooks/useHotkey';
import AnalyticsService, { AnalyticsEvent } from 'services/analytics.service';

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

  const isHighlighted = searchStore.isQueryDirty && !!searchStore.query;

  return (
    <Hotkey
      onClick={searchCurrentQuery}
      isHighlighted={isHighlighted}
      isHighlightedText={isHighlighted}
      hotkey={['Enter']}
    >
      to search
    </Hotkey>
  );
}

export default observer(SearchButton);
