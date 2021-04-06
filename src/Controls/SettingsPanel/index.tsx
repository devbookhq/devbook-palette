import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import Hotkey from 'components/Hotkey';
import { HotKeyAction, useUIStore } from 'ui/ui.store';
import IPCServices, { IPCSendChannel } from 'services/ipc.service';
import { PreferencesPage } from 'Preferences/preferencesPage';
import QueryFilter from './QueryFilter';
import SearchSourceFilters from './SearchSourceFilters';
import { ReactComponent as preferencesIcon } from 'img/preferences.svg';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FilterMenuWrapper = styled.div`
  display: flex;
  border-left: 1px solid #3B3A4A;
  padding-left: 5px;
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
  margin: 0 5px 0 0;
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

  function openPreferences() {
    IPCServices.send(IPCSendChannel.OpenPreferences, { page: PreferencesPage.General });
  }

  return (
    <Container>
      <FilterMenuWrapper>
        <SearchSourceFilters />
      </FilterMenuWrapper>
      <QueryFilter />
      <ButtonsWrapper>
        <Hotkey
          onClick={() => uiStore.togglePinMode()}
          isHighlightedText={uiStore.isPinModeEnabled}
          hotkey={uiStore.hotkeys[HotKeyAction.TogglePinMode].label}
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
