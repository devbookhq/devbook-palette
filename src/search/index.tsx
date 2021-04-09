import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service/searchSource';
import StackOverflow from './StackOverflow';
import Docs from './Docs';
import { useSearchStore } from './search.store';
import InfoMessage from 'components/InfoMessage';
import InfoText from 'components/InfoMessage/InfoText';
import HotkeyText from 'components/HotkeyText';
import { useCallback } from 'react';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  margin-bottom: 50px;
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

  const toggleModal = useCallback(() => {
    uiStore.toggleModal();
  }, []);

  const toggleFilterModal = useCallback(() => {
    uiStore.toggleFilterModal();
  }, []);

  return (
    <Container>
      {uiStore.searchSource === SearchSource.StackOverflow &&
        <StackOverflow
          results={searchStore.results.stackOverflow.results}
          isModalOpened={uiStore.isModalOpened}
          toggleModal={toggleModal}
        />
      }

      {uiStore.searchSource === SearchSource.Docs &&
        <Docs
          results={searchStore.results.docs.results}
          isFilterModalOpened={uiStore.isFilterModalOpened}
          toggleFilterModal={toggleFilterModal}
        />
      }

      {((searchStore.results.docs.results.length === 0 && uiStore.searchSource === SearchSource.Docs) ||
        (searchStore.results.docs.results.length === 0 && uiStore.searchSource === SearchSource.StackOverflow)) &&
        <>
          {
            searchStore.isQueryDirty &&
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
          {!searchStore.isQueryDirty &&
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
    </Container >
  );
}

export default observer(Search);
