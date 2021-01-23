import React from 'react';

import electron from 'mainCommunication';
import { Key, VisualConcat } from '../Hotkey';
import Panel from '../Panel';

const cmdModifier = electron.remote.process.platform === 'darwin' ? Key.Command : 'Ctrl';

interface SearchHotkeysPanelProps {
  isDocsFilterModalOpened: boolean;
  isSearchingInDocPage: boolean;
  onOpenFilterDocsClick: (e: any) => void;
  onCloseFilterDocsClick: (e: any) => void;
  onSearchInDocPageClick: (e: any) => void;
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
      hotkeysLeft={isDocsFilterModalOpened ? [
        {
          text: 'Select documentation',
          hotkey: [Key.ArrowUp, Key.ArrowDown],
          isSeparated: true
        },
        // TODO: Change functionality based on whether the currently select
        // documentation is included or removed from the search.
        {
          text: 'Include in search',
          hotkey: [Key.Enter],
        },
      ] : [
          {
            text: 'Navigate results',
            hotkey: [Key.Shift, VisualConcat.Plus, Key.ArrowUp, Key.ArrowDown],
            isSeparated: true
          },
          {
            text: 'Filter docs',
            hotkey: [cmdModifier, Key.Shift, 'F'],
            onClick: onOpenFilterDocsClick,
          },
        ]}
      hotkeysRight={isDocsFilterModalOpened ? [
        {
          text: 'Close',
          hotkey: ['ESC'],
          onClick: onCloseFilterDocsClick,
        }
      ] : [
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
