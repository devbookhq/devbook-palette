import React from 'react';
import electron from 'mainProcess';

import { Key } from '../Hotkey';
import Panel from '../Panel';

interface ModalHotkeysPanelProps {
  onOpenInBrowserClick: (e: any) => void,
  onCloseClick: (e: any) => void,
}

function ModalHotkeysPanel({
  onOpenInBrowserClick,
  onCloseClick,
}: ModalHotkeysPanelProps) {
  return (
    <Panel
      hotkeysLeft={[
        {
          text: 'Navigate',
          hotkey: [Key.ArrowUp, Key.ArrowDown],
          isSeparated: true,
        },
      ]}
      hotkeysRight={[
        {
          text: 'Open in browser',
          hotkey: electron.remote.process.platform === 'darwin' ? [Key.Command, 'O'] : ['Alt +', 'O'],
          onClick: onOpenInBrowserClick,
        },
        {
          text: 'Close',
          hotkey: ['Esc'],
          onClick: onCloseClick,
        },
      ]}
    />
  );
}

export default ModalHotkeysPanel;

