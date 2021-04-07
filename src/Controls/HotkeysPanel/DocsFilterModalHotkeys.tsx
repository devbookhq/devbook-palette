import styled from 'styled-components';

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

function DocsFilterModalHotkeys() {
  const uiStore = useUIStore();

  useHotkey(uiStore.hotkeys[HotkeyAction.DocsModalFilterUp]);
  useHotkey(uiStore.hotkeys[HotkeyAction.DocsModalFilterDown]);
  const modalSelect = useHotkey(uiStore.hotkeys[HotkeyAction.DocsModalSelect]);

  const closeModal = useHotkey(uiStore.hotkeys[HotkeyAction.DocsCloseModalFilter]);

  return (
    <>
      <LeftHotkeyGroup>
        <NoClickHotkey hotkey={[Key.ArrowUp, Key.ArrowDown]} isHighlightedText={true}>Navigate</NoClickHotkey>
        <Hotkey hotkey={modalSelect.label} isHighlightedText={true} onClick={modalSelect.handler}>Select</Hotkey>
      </LeftHotkeyGroup>
      <RightHotkeyGroup>
        <Hotkey reverseContent={true} hotkey={closeModal.label} isHighlightedText={true} onClick={closeModal.handler}>Close</Hotkey>
      </RightHotkeyGroup>
    </>
  );
}

export default DocsFilterModalHotkeys;