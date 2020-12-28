import React from 'react';
import electron from 'mainProcess';

import { Key, VisualConcat } from '../Hotkey';
import Panel from '../Panel';

interface SearchHotkeysPanelProps {
  onFilterDocsClick: (e: any) => void;
  onSearchInDocPageClick: (e:  any) => void;
}

const cmdModifier = electron.remote.process.platform === 'darwin' ? Key.Command : Key.Alt;

function SearchHotkeysPanel({
  onFilterDocsClick,
  onSearchInDocPageClick,
}: SearchHotkeysPanelProps) {
  return (
    <Panel
      hotkeysLeft={[
        {
          text: 'Navigate results',
          hotkey: [cmdModifier, VisualConcat.Plus, Key.ArrowUp, Key.ArrowDown],
          isSeparated: true
        },
        {
          text: 'Filter docs',
          hotkey: [cmdModifier, Key.Shift, 'F'],
          onClick: onFilterDocsClick,
        },
      ]}
      hotkeysRight={[
        {
          text: 'Scroll page',
          hotkey: [Key.ArrowUp, Key.ArrowDown],
          isSeparated: true
        },
        {
          text: 'Search in page',
          hotkey: [cmdModifier, 'F'],
          onClick: onSearchInDocPageClick,
        },
      ]}
    />
  );
}

export default SearchHotkeysPanel;

