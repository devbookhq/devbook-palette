import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service';
import Hotkey from 'components/Hotkey';
import useHotkey from 'hooks/useHotkey';
import { useUIStore, HotkeyAction } from 'ui/ui.store';

interface SearchSourceFilterProps {
  source: SearchSource;
  onSelect: (source: SearchSource) => void;
  isSelected: boolean;
}

const searchSourceNames: { [source in SearchSource]: string } = {
  [SearchSource.Docs]: 'Docs',
  [SearchSource.StackOverflow]: 'Stack Overflow',
}

const searchSourceHotkeyActions = {
  [SearchSource.StackOverflow]: HotkeyAction.SelectStackOverflowSource,
  [SearchSource.Docs]: HotkeyAction.SelectDocsSource,
}

function SearchSourceFilter({ source, onSelect, isSelected }: SearchSourceFilterProps) {
  const uiStore = useUIStore();

  const hotkeyOptions = uiStore.hotkeys[searchSourceHotkeyActions[source]];

  const changeFilter = useCallback(() => {
    onSelect(source);
  }, [source, onSelect]);

  useHotkey(hotkeyOptions,
    changeFilter,
  );

  return (
    <Hotkey
      onClick={changeFilter}
      reverseContent={true}
      isHighlightedText={isSelected}
      hotkey={hotkeyOptions.label!}
    >
      {searchSourceNames[source]}
    </Hotkey>
  );
}

export default observer(SearchSourceFilter);
