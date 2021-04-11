import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import SearchPanel from 'Controls/SearchPanel';
import SearchResults from 'Search';
import HotkeysPanel from 'Controls/HotkeysPanel';
import { useUserStore } from 'user/user.store';
import InfoMessage from 'components/InfoMessage';
import InfoText from 'components/InfoMessage/InfoText';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const VerticalInfoMessage = styled(InfoMessage)`
  flex-direction: column;
`;

function Home() {
  const userStore = useUserStore();

  return (
    <>
      {userStore.isReconnecting &&
        <VerticalInfoMessage>
          <InfoText>Contacting Devbook servers failed.</InfoText>
          <InfoText>Reconnecting...</InfoText>
        </VerticalInfoMessage>
      }
      {!userStore.isReconnecting &&
        <>
          < Container >
            <SearchPanel />
            <SearchResults />
            <HotkeysPanel />
          </Container >
        </>
      }
    </>
  );
}

export default observer(Home);
