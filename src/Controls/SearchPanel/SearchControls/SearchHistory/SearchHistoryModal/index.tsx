import { useRef, useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchStore } from 'Search/search.store';
import styled from 'styled-components';
import SearchHistoryQuery from './SearchHistoryQuery';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import useHotkey from 'hooks/useHotkey';
import Hotkey from 'components/Hotkey';

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

function SearchHistoryModal() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  const queryRef = useRef<HTMLDivElement>(null);
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);

  useEffect(() => {
    queryRef?.current?.scrollIntoView({ block: 'end' });
  }, [selectedQueryIdx]);

  const changeHistoryResultUp = useCallback(() => {
    if (selectedQueryIdx > 0) setSelectedQueryIdx(selectedQueryIdx - 1);
  }, [selectedQueryIdx]);

  const changeHistoryResultDown = useCallback(() => {
    if (selectedQueryIdx < searchStore.history.length - 1) setSelectedQueryIdx(selectedQueryIdx + 1);
  }, [selectedQueryIdx, searchStore.history]);

  const searchHistory = useCallback((query?: string) => {
    if (searchStore.history.length - 1 < selectedQueryIdx) return;
    searchStore.executeSearch(query || searchStore.history[selectedQueryIdx].query);
    uiStore.toggleSeachHistory();
  }, [
    selectedQueryIdx,
    searchStore.history,
    uiStore.isSearchHistoryVisible,
    searchStore.history,
    uiStore.isSearchHistoryVisible,
  ]);

  useHotkey(
    uiStore.hotkeys[HotkeyAction.HistoryUp],
    changeHistoryResultUp,
  );

  useHotkey(
    uiStore.hotkeys[HotkeyAction.HistoryDown],
    changeHistoryResultDown,
  );

  useHotkey(
    uiStore.hotkeys[HotkeyAction.SearchHistory],
    searchHistory,
  );

  return (
    <Container
    >
      <TopBar>
        <Heading>Past queries</Heading>
        <Hotkey hotkey={['Tab']} onClick={uiStore.toggleSeachHistory.bind(uiStore)}>to hide</Hotkey>
      </TopBar>

      <Content>
        {searchStore.history.map((h, i) => (
          <SearchHistoryQuery
            key={h.query}
            query={h.query}
            isSelected={selectedQueryIdx === i}
            onClick={() => searchHistory(h.query)}
          />
        ))}
      </Content>
    </Container>
  );
}

export default observer(SearchHistoryModal);
