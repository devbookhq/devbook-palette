import React from 'react';
import electron from 'mainProcess';

import { Key } from '../Hotkey';
import Panel from '../Panel';

interface SearchHotkeysPanelProps {

}

function SearchHotkeysPanel() {
  return (
    <Panel
      hotkeysLeft={[
        { text: 'Navigate results', hotkey: [Key.ArrowUp, Key.ArrowDown], isSeparated: true },
        { text: 'Filter docs', hotkey: [Key.Command, Key.Shift, 'F'] }
      ]}
      hotkeysRight={[
        { text: 'Scroll page', hotkey: [Key.ArrowUp, Key.ArrowDown], isSeparated: true },
        { text: 'Search in page', hotkey: [Key.Command, 'F'] }
      ]}
    />
  );
}

export default SearchHotkeysPanel;

