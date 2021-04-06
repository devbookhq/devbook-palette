import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import Button from 'components/Button';
import { useUIStore } from 'ui/ui.store';
import IPCServices, { IPCSendChannel } from 'services/ipc.service';
import { PreferencesPage } from 'Preferences/preferencesPage';
import QueryFilter from './QueryFilter';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function SettingsPanel() {
  const uiStore = useUIStore();

  return (
    <Container>
      <QueryFilter />
      <ButtonsWrapper>
        <Button
          onClick={uiStore.togglePinMode.bind(uiStore)}
        >
          Toggle Pin
        </Button>
        <Button
          onClick={() => IPCServices.send(IPCSendChannel.OpenPreferences, { page: PreferencesPage.General })}
        >
          Open Preferences
      </Button>
      </ButtonsWrapper>
    </Container>
  )
}

export default observer(SettingsPanel);
