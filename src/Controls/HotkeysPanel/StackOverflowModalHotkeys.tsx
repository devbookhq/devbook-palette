import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { Key } from 'components/HotkeyText';
import Hotkey from 'components/Hotkey';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import useHotkey from 'hooks/useHotkey';

const LeftHotkeyGroup = styled.div`
  justify-content: flex-start;
  display: flex;
`;

const RightHotkeyGroup = styled.div`
  justify-content: flex-end;
  display: flex;
`;

const NoClickHotkey = styled(Hotkey)`
  pointer-events: none;
`;

function StackOverflowModalHotkeys() {
  const uiStore = useUIStore();

  const closeModal = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowCloseModal]);
  const openInBrowser = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowModalOpenInBrowser]);

  useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowModalScrollUp]);
  useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowModalScrollDown]);

  return (
    <>
      <LeftHotkeyGroup>
        <NoClickHotkey reverseContent={true} hotkey={[Key.ArrowUp, Key.ArrowDown]} isHighlightedText={true}>Scroll page</NoClickHotkey>
      </LeftHotkeyGroup>
      <RightHotkeyGroup>
        <Hotkey hotkey={openInBrowser.label} onClick={openInBrowser.handler} isHighlightedText={true}>Open in browser</Hotkey>
        <Hotkey reverseContent={true} hotkey={closeModal.label} onClick={closeModal.handler} isHighlightedText={true}>Close</Hotkey>
      </RightHotkeyGroup>
    </>
  );
}

export default observer(StackOverflowModalHotkeys);
