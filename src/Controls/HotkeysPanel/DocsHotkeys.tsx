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

function DocsHotkeys() {
  const uiStore = useUIStore();

  const resultsUp = useHotkey(uiStore.hotkeys[HotkeyAction.DocsResultsUp]);
  const resultsDown = useHotkey(uiStore.hotkeys[HotkeyAction.DocsResultsDown]);

  useHotkey(uiStore.hotkeys[HotkeyAction.DocsScrollUp]);
  useHotkey(uiStore.hotkeys[HotkeyAction.DocsScrollDown]);
  const searchInPage = useHotkey(uiStore.hotkeys[HotkeyAction.DocsOpenSearchInPage]);
  const cancelSearchInPage = useHotkey(uiStore.hotkeys[HotkeyAction.DocsCancelSearchInPage]);

  return (
    <>
      <LeftHotkeyGroup>
        <Hotkey hotkey={resultsUp.label} isHighlightedText={true} onClick={resultsUp.handler}>Previous result</Hotkey>
        <Hotkey hotkey={resultsDown.label} isHighlightedText={true} onClick={resultsDown.handler}>Next result</Hotkey>
      </LeftHotkeyGroup>
      <RightHotkeyGroup>
        {!uiStore.isSearchInPageOpened && <Hotkey reverseContent={true} hotkey={searchInPage.label} isHighlightedText={true} onClick={searchInPage.handler}>Search in page</Hotkey>}
        {uiStore.isSearchInPageOpened && <Hotkey reverseContent={true} hotkey={cancelSearchInPage.label} isHighlightedText={true} onClick={cancelSearchInPage.handler}>Cancel search in page</Hotkey>}
        <NoClickHotkey reverseContent={true} hotkey={[Key.Shift, Key.ArrowUp, Key.ArrowDown]} isHighlightedText={true}>Scroll page</NoClickHotkey>
      </RightHotkeyGroup>
    </>
  );
}

export default observer(DocsHotkeys);