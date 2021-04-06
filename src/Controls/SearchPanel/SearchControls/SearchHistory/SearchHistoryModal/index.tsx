import { useRef, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchStore } from 'Search/search.store';
import styled from 'styled-components';
import SearchHistoryQueries from './SearchHistoryQueries';
import { HotKeyAction, useUIStore } from 'ui/ui.store';
import useHotkey from 'hooks/useHotkey';

const Container = styled.div<{ isFocused?: boolean }>`
  padding: 8px;
  z-index: 1;
  position: absolute;
  left: 10px;
  top: 40px;
  width: calc(100% - 10px - 355px);
  max-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(37, 37, 46, 0.75);
  border-radius: 8px;
  border: 1px solid ${props => props.isFocused ? '#3A41AF' : '#3B3A4A'};
  box-shadow: 0px 4px 6px 2px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
`;

const Heading = styled.div`
  margin-right: 8px;
  color: #616171;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const Content = styled.div`
  margin: 8px 0 0;
  padding: 8px 0;
  width: 100%;
  max-height: 300px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;



const TopBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const HotkeyWrapper = styled.div`
  padding: 5px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  user-select: none;
  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    background: #434252;
    > div {
      color: #fff;
    }
  }
  :not(:last-child) {
    margin-right: 16px;
  }
`;

const HotkeyText = styled.div`
  margin-left: 8px;
  font-size: 12px;
  color: #616171;
  transition: color 170ms ease-in;
`;

const MoreQueries = styled.div`
  // margin-top: 8px;
  font-family: 'Roboto Mono';
  font-size: 12px;
  color: #616171;
`;

const UnfocusedStateWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface SearchHistoryProps {
  history: string[];
  isFocused?: boolean;
  historyIdx: number;
  onQueryClick: (q: string) => void;
  onHideHotkeyClick: (e: any) => void;
}

function SearchHistoryModal() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();
  
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);

  const changeHistoryResultUp = useCallback(() => {
    if (selectedQueryIdx > 0) setSelectedQueryIdx(selectedQueryIdx - 1);
  }, [selectedQueryIdx]);

  const changeHistoryResultDown = useCallback(() => {
    if (selectedQueryIdx < searchStore.history.length - 1) setSelectedQueryIdx(selectedQueryIdx + 1);
  }, [selectedQueryIdx, searchStore.history]);

  const searchHistory = useCallback(() => {
    if (searchStore.history.length - 1 < selectedQueryIdx) return;
    searchStore.executeSearch(searchStore.history[selectedQueryIdx].query);
    uiStore.toggleSeachHistory();
  }, [
    selectedQueryIdx,
    searchStore.history,
    uiStore.isSearchHistoryVisible,
    searchStore.history,
  ]);

  useHotkey(
    uiStore.hotkeys[HotKeyAction.HistoryUp],
    changeHistoryResultUp,
  );

  useHotkey(
    uiStore.hotkeys[HotKeyAction.HistoryDown],
    changeHistoryResultDown,
  );

  useHotkey(
    uiStore.hotkeys[HotKeyAction.SearchHistory],
    searchHistory,
  );

  return (
    <Container
    >
      <TopBar>
        <Heading>Past queries</Heading>
        <HotkeyWrapper
        >

          <HotkeyText>
            to hide
          </HotkeyText>
        </HotkeyWrapper>
      </TopBar>

      <Content>
        <SearchHistoryQueries
          selectedQueryIdx={selectedQueryIdx}
          onQueryClick={(query: string) => searchStore.executeSearch(query)}
          history={searchStore.history}
        />
      </Content>
    </Container>
  );
}

export default observer(SearchHistoryModal);
