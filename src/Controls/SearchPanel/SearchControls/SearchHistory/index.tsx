import { observer } from 'mobx-react-lite';
import { useUIStore, HotkeyAction } from 'ui/ui.store';

import SearchHistoryModal from './SearchHistoryModal';
import Hotkey from 'components/Hotkey';
import useHotkey from 'hooks/useHotkey';

function SearchHistory() {
  const uiStore = useUIStore();

  useHotkey(
    uiStore.hotkeys[HotkeyAction.ToggleHistory],
    () => uiStore.toggleSeachHistory()
  );

  return (
    <>
      <Hotkey
        onClick={() => uiStore.toggleSeachHistory()}
        isHighlightedText={uiStore.isSearchHistoryVisible}
        hotkey={['Tab']}
      >
        to show history
      </Hotkey>
      {uiStore.isSearchHistoryVisible &&
        <SearchHistoryModal />
      }
    </>
  );
}

export default observer(SearchHistory);
