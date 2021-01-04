import React from 'react';
import electron from 'mainProcess';

import { Key, VisualConcat } from '../Hotkey';
import Panel from '../Panel';

const cmdModifier = electron.remote.process.platform === 'darwin' ? Key.Command : Key.Alt;

interface SearchHotkeysPanelProps {
  isDocsFilterModalOpened: boolean;
  isSearchingInDocPage: boolean;
  onOpenFilterDocsClick: (e: any) => void;
  onCloseFilterDocsClick: (e: any) => void;
  onSearchInDocPageClick: (e:  any) => void;
  onCancelSearchInDocPageClick: (e: any) => void;
}

function SearchHotkeysPanel({
  isDocsFilterModalOpened,
  isSearchingInDocPage,
  onOpenFilterDocsClick,
  onCloseFilterDocsClick,
  onSearchInDocPageClick,
  onCancelSearchInDocPageClick,
}: SearchHotkeysPanelProps) {
  return (
    <Panel
      hotkeysLeft={[
        {
          text: 'Navigate results',
          hotkey: [Key.Shift, VisualConcat.Plus, Key.ArrowUp, Key.ArrowDown],
          isSeparated: true
        },
        {
          text: isDocsFilterModalOpened ? 'Close' : 'Filter docs',
          hotkey: [cmdModifier, Key.Shift, 'F'],
          onClick: isDocsFilterModalOpened ? onCloseFilterDocsClick : onOpenFilterDocsClick,
        },
      ]}
      hotkeysRight={[
        {
          text: 'Scroll page',
          hotkey: [Key.ArrowUp, Key.ArrowDown],
          isSeparated: true
        },
        {
          text: isSearchingInDocPage ? 'Cancel search in page' : 'Search in page',
          hotkey: isSearchingInDocPage ? ['ESC'] : [cmdModifier, 'F'],
          onClick: isSearchingInDocPage ? onCancelSearchInDocPageClick : onSearchInDocPageClick,
        },
      ]}
    />
  );
}

export default SearchHotkeysPanel;

