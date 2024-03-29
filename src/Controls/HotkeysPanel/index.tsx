import styled from 'styled-components';

import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service/searchSource';
import { useUIStore } from 'ui/ui.store';
import StackOverflowHotkeys from './StackOverflowHotkeys';
import StackOverflowModalHotkeys from './StackOverflowModalHotkeys';
import DocsHotkeys from './DocsHotkeys';
import DocsFilterModalHotkeys from './DocsFilterModalHotkeys';

const Container = styled.div`
  width: 100%;
  padding: 5px 10px 5px;
  z-index: 10;
  display: flex;
  position: absolute;
  bottom: 0;
  align-items: center;
  justify-content: space-between;
  background: #2E303D;
  border-top: 1px solid #3B3A4A;
`;

function HotkeysPanel() {
  const uiStore = useUIStore();

  return (
    <>
      {uiStore.searchSource === SearchSource.StackOverflow &&
        <Container>
          {!uiStore.isStackOverflowModalOpened &&
            <StackOverflowHotkeys />
          }
          {uiStore.isStackOverflowModalOpened &&
            <StackOverflowModalHotkeys />
          }
        </Container>
      }
      {uiStore.searchSource === SearchSource.Docs &&
        <Container>
          {!uiStore.isDocsFilterModalOpened &&
            <DocsHotkeys />
          }
          {uiStore.isDocsFilterModalOpened &&
            <DocsFilterModalHotkeys />
          }
        </Container>
      }
    </>
  );
}

export default observer(HotkeysPanel);
