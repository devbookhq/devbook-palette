import React from 'react';

import electron from 'mainCommunication';
import { Key } from '../Hotkey';
import Panel from '../Panel';

interface SearchHotkeysPanelProps {
  onOpenClick: (e: any) => void;
  onOpenInVSCodeClick: (e: any) => void;
  onOpenInBrowserClick: (e: any) => void;
}

function SearchHotkeysPanel({
  onOpenClick,
  onOpenInVSCodeClick,
  onOpenInBrowserClick,
}: SearchHotkeysPanelProps) {
  return (
    <Panel
      hotkeysLeft={[
        { text: 'Navigate', hotkey: [Key.ArrowUp, Key.ArrowDown], isSeparated: true },
        { text: 'Open', hotkey: [Key.Enter], onClick: onOpenClick },
      ]}
      hotkeysRight={[
        {
          text: 'Open in VSCode',
          hotkey: electron.remote.process.platform === 'darwin' ? [Key.Command, 'I'] : ['Alt +', 'I'],
          onClick: onOpenInVSCodeClick,
        },
        {
          text: 'Open in browser',
          hotkey: electron.remote.process.platform === 'darwin' ? [Key.Command, 'O'] : ['Alt +', 'O'],
          onClick: onOpenInBrowserClick,
        },
      ]}
    />
  );
}

export default SearchHotkeysPanel;
