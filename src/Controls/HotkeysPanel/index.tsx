import styled from 'styled-components';

import { HotkeyType } from 'components/HotkeyText';
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

export interface HotkeyWithText {
  text: string;
  hotkey: HotkeyType;
  isSeparated?: boolean; // Separates hotkey's symbols that are listed in the 'hotkey' property.
  onClick?: (e: any) => void;
}

function HotkeysPanel() {
  const uiStore = useUIStore();

  return (
    <Container>
      {uiStore.searchSource === SearchSource.StackOverflow &&
        <>
          {!uiStore.isModalOpened &&
            <StackOverflowHotkeys />
          }
          {uiStore.isModalOpened &&
            <StackOverflowModalHotkeys />
          }
        </>
      }
      {uiStore.searchSource === SearchSource.Docs &&
        <>
          {!uiStore.isFilterModalOpened &&
            <DocsHotkeys />
          }
          {uiStore.isFilterModalOpened &&
            <DocsFilterModalHotkeys />
          }
        </>
      }
    </Container>
  );
}

export default observer(HotkeysPanel);
