import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service/searchSource';
import StackOverflow from './StackOverflow';
import Docs from './Docs';
import { useSearchStore } from './search.store';
import InfoMessage from 'components/InfoMessage';
import InfoText from 'components/InfoMessage/InfoText';
import HotkeyText from 'components/HotkeyText';
import { useUserStore } from 'user/user.store';
import { useEffect } from 'react';
import DocsFilterModal from './Docs/DocsFilterModal';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 45px;
`;

const InfoTextLeft = styled(InfoText)`
  margin: 0 8px 0 0;
`;

const InfoTextRight = styled(InfoText)`
  margin: 0 0 0 8px;
`;

function Search() {
  const uiStore = useUIStore();
  const searchStore = useSearchStore();
  const userStore = useUserStore();

  useEffect(() => {
    if (userStore.auth.user) {
      uiStore.isSignInModalOpened = false;
    }
  }, [userStore.auth.user, uiStore]);

  const toggleFilterModal = useCallback(() => {
    uiStore.toggleDocsFilterModal();
  }, [uiStore]);


  return (
    <Container>
      {uiStore.searchSource === SearchSource.StackOverflow &&
        searchStore.results.StackOverflow.results.length !== 0 &&
        <StackOverflow
          results={searchStore.results.StackOverflow.results}
        />
      }

      {uiStore.searchSource === SearchSource.Docs &&
        uiStore.isDocsFilterModalOpened &&
        <DocsFilterModal
          onCloseRequest={toggleFilterModal}
        />
      }


      {uiStore.searchSource === SearchSource.Docs &&
        searchStore.results.Docs.results.length !== 0 &&
        !uiStore.isSignInModalOpened &&
        <Docs
          results={searchStore.results.Docs.results}
        />
      }

      {((searchStore.results.Docs.results.length === 0 && uiStore.searchSource === SearchSource.Docs) ||
        (searchStore.results.StackOverflow.results.length === 0 && uiStore.searchSource === SearchSource.StackOverflow)) &&
        <>
          {(searchStore.isQueryDirty || !searchStore.query) &&
            <InfoMessage>
              <InfoTextLeft>
                Type your search query and press
              </InfoTextLeft>
              <HotkeyText hotkey={['Enter']} />
              <InfoTextRight>
                to search
              </InfoTextRight>
            </InfoMessage>
          }
          {!searchStore.isQueryDirty && searchStore.query && !searchStore.isSearching &&
            <InfoMessage>
              <InfoTextLeft>
                Nothing found. Try a different query and then press
              </InfoTextLeft>
              <HotkeyText hotkey={['Enter']} />
              <InfoTextRight>
                .
              </InfoTextRight>
            </InfoMessage>
          }
        </>
      }
    </Container>
  );
}

export default observer(Search);
