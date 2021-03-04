import React from 'react';

import electron from 'mainCommunication';
import { Key } from '../Hotkey';
import Panel from '../Panel';

interface SearchHotkeysPanelProps {
  onNavigateUpClick: (e: any) => void;
  onNavigateDownClick: (e: any) => void;
  onOpenClick: (e: any) => void;
  onOpenInBrowserClick: (e: any) => void;
}

function SearchHotkeysPanel({
  onNavigateUpClick,
  onNavigateDownClick,
  onOpenClick,
  onOpenInBrowserClick,
}: SearchHotkeysPanelProps) {
  return (
    <Panel
      hotkeysLeft={[
        { text: 'Next result', hotkey: [Key.ArrowDown], onClick: onNavigateDownClick },
        { text: 'Previous result', hotkey: [Key.ArrowUp], onClick: onNavigateUpClick },
        { text: 'Open', hotkey: [Key.Enter], onClick: onOpenClick},
      ]}
      hotkeysRight={[
        { text: 'Scroll page', hotkey: [Key.Shift, Key.ArrowUp, Key.ArrowDown] },
        {
          text: 'Open in browser',
          hotkey: electron.remote.process.platform === 'darwin' ? [Key.Command, 'O'] : ['Alt +', 'O'],
          onClick: onOpenInBrowserClick
        },
      ]}
    />
  );
}

export default SearchHotkeysPanel;
