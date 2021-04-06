import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service';
import Hotkey from 'components/Hotkey';
import useHotkey from 'hooks/useHotkey';
import { useUIStore, HotKeyAction } from 'ui/ui.store';

interface SearchSourceFilterProps {
  source: SearchSource;
  onSelect: () => void;
  isSelected: boolean;
}

const searchSourceNames: { [source in SearchSource]: string } = {
  [SearchSource.Docs]: 'Docs',
  [SearchSource.StackOverflow]: 'Stack Overflow',
}

const searchSourceHotkeyActions = {
  [SearchSource.StackOverflow]: HotKeyAction.SelectStackOverflowSource,
  [SearchSource.Docs]: HotKeyAction.SelectDocsSource,
}

function SearchSourceFilter({ source, onSelect, isSelected }: SearchSourceFilterProps) {
  const uiStore = useUIStore();

  const hotkeyOptions = uiStore.hotkeys[searchSourceHotkeyActions[source]];

  useHotkey(hotkeyOptions,
    onSelect,
  );

  return (
    <Hotkey
      onClick={onSelect}
      isHighlightedText={isSelected}
      hotkey={hotkeyOptions.label!}
    >
      {searchSourceNames[source]}
    </Hotkey>
  );
}

export default observer(SearchSourceFilter);
