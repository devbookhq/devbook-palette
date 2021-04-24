import styled from 'styled-components';
import { useSearchStore } from 'Search/search.store';
import { observer } from 'mobx-react-lite';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service/searchSource';
import Hotkey from 'components/Hotkey';
import useHotkey from 'hooks/useHotkey';
import { useCallback } from 'react';

const Container = styled.div`
  width: 100%;
  /* margin: 0px 1px 0px; */
  display: flex;
  align-items: center;
  border-radius: 5px;
  user-select: none;
  justify-content: space-between;
  font-size: 12px;

  background: #25252E;
  :hover {
    transition: background 70ms ease-in;
    cursor: pointer;
    background: #434252;
    > div {
      color: #fff;
    }
  }
`;

const DocsetNameLogo = styled.div`
  padding: 5px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  user-select: none;
`;

const DocsetIcon = styled.img`
  margin-right: 8px;
  min-height: 24px;
  min-width: 24px;
  height: 24px;
  width: 24px;
`;

const ActiveDocsetName = styled.div`
  position: relative;
  top: 1px;
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  /* overflow: hidden; */
  white-space: nowrap;
  /* text-overflow: ellipsis; */
`;

function DocsFilter() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  const selectedFilter = searchStore.filters[SearchSource.Docs].selectedFilter;

  const toggleFilterModal = useCallback(() => {
    uiStore.toggleDocsFilterModal();
  }, [uiStore]);

  const openModalFilter = useHotkey(uiStore.hotkeys[HotkeyAction.DocsOpenModalFilter],
    toggleFilterModal,
  );

  return (
    <Container
      onClick={toggleFilterModal}
    >
      {selectedFilter &&
        <>
          <DocsetNameLogo
          >
            <DocsetIcon src={selectedFilter?.iconURL} />
            <ActiveDocsetName>
              {selectedFilter?.name}
            </ActiveDocsetName>
          </DocsetNameLogo>
        </>
      }
      <Hotkey hotkey={openModalFilter.label}> to change </Hotkey>
    </Container >
  );
}

export default observer(DocsFilter);
