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

function StackOverflowHotkeys() {
  const uiStore = useUIStore();

  const resultsUp = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowResultsUp]);
  const resultsDown = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowResultsDown]);
  const openModal = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowOpenModal]);
  const openInBrowser = useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowOpenInBrowser]);

  useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowScrollUp]);
  useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowScrollDown]);

  return (
    <>
      <LeftHotkeyGroup>
        <Hotkey hotkey={resultsUp.label} isHighlightedText={true} onClick={resultsUp.handler}>Previous result</Hotkey>
        <Hotkey hotkey={resultsDown.label} isHighlightedText={true} onClick={resultsDown.handler}>Next result</Hotkey>
        <Hotkey hotkey={openModal.label} isHighlightedText={true} onClick={openModal.handler}>Open</Hotkey>
      </LeftHotkeyGroup>
      <RightHotkeyGroup>
        <Hotkey reverseContent={true} hotkey={openInBrowser.label} isHighlightedText={true} onClick={openInBrowser.handler}>Open in browser</Hotkey>
        <NoClickHotkey reverseContent={true} hotkey={[Key.Shift, Key.ArrowUp, Key.ArrowDown]} isHighlightedText={true}>Scroll page</NoClickHotkey>
      </RightHotkeyGroup>
    </>
  );
}

export default observer(StackOverflowHotkeys);
