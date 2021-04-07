import { useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import Hotkey from 'components/Hotkey';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import IPCServices, { IPCSendChannel } from 'services/ipc.service';
import { PreferencesPage } from 'Preferences/preferencesPage';
import QueryFilters from './QueryFilters';
import { ReactComponent as preferencesIcon } from 'img/preferences.svg';
import useHotkey from 'hooks/useHotkey';

const Container = styled.div`
  width: 100%;
  padding: 5px 15px;
  display: flex;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PreferencesIcon = styled(preferencesIcon)`
  height: auto;
  width: 20px;
  path {
    height: 1px;
    width: auto;
  }
`;

const PreferencesButton = styled.div`
  margin-left: 5px;
  display: flex;
  :hover {
    path {
      stroke: white;
    }
    cursor: pointer;
  }
`;

function SettingsPanel() {
  const uiStore = useUIStore();

  const openPreferences = useCallback(() => {
    IPCServices.send(IPCSendChannel.OpenPreferences, { page: PreferencesPage.General });
  }, []);

  const togglePinMode = useCallback(() => {
    uiStore.togglePinMode();
  }, [uiStore.togglePinMode]);

  useHotkey(uiStore.hotkeys[HotkeyAction.TogglePinMode],
    togglePinMode,
  );

  return (
    <Container>
      <QueryFilters />
      <ButtonsWrapper>
        <Hotkey
          onClick={togglePinMode}
          isHighlightedText={uiStore.isPinModeEnabled}
          hotkey={uiStore.hotkeys[HotkeyAction.TogglePinMode].label}
        >
          {uiStore.isPinModeEnabled ? 'to unpin Devbook' : 'to pin Devbook'}
        </Hotkey>

        <PreferencesButton onClick={openPreferences}>
          <PreferencesIcon />
        </PreferencesButton>

      </ButtonsWrapper>
    </Container>
  )
}

export default observer(SettingsPanel);
