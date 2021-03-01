import React, { useState } from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import Hotkey from 'Home/HotkeysPanel/Hotkey';

const Container = styled.div`
  padding: 8px;
  z-index: 1;
  position: absolute;
  left: 10px;
  top: 40px;
  width: calc(100% - 10px - 355px);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  background: rgba(37, 37, 46, 0.65);
  border-radius: 8px;
  border: 1px solid #3B3A4A;
  box-shadow: 0px 4px 6px 2px rgba(0, 0, 0, 0.5);

  backdrop-filter: blur(20px);
`;

const Heading = styled.div`
  flex: 1;
  color: #616171;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const Content = styled.div`
  margin: 4px 0 0;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Query = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  //width: calc(100% - 270px);
  padding: 8px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-family: 'Roboto Mono';
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;

  background: ${props => props.isFocused ? '#3B3A4A' : 'transparent'};

  :hover {
    cursor: pointer;
    background: #3B3A4A;
  }
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Hotkeys = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HotkeyWrapper = styled.div`
  display: flex;
  align-items: center;

  :not(:last-child) {
    margin-right: 16px;
  }
`;

const HotkeyText = styled.div`
  margin-left: 8px;
  font-size: 12px;
  color: #616171;
`;

const MoreQueries = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #616171;
`;

interface SearchHistoryProps {
  history: string[];
  isFocused?: boolean;
  onSelect: (val: string) => void;
}

function SearchHistory({
  history,
  isFocused,
  onSelect,
}: SearchHistoryProps) {
  const [historyIdx, setHistoryIdx] = useState(0);

  function selectHistory(idx: number) {
    onSelect(history[idx]);
  }

  useHotkeys('enter', () => {
    if (!isFocused) return;
    selectHistory(historyIdx);
  }, { filter: () => true }, [historyIdx, isFocused]);

  useHotkeys('down', () => {
    if (!isFocused) return;
    if (historyIdx < history.length - 1) setHistoryIdx(v => v+1);
  }, { filter: () => true }, [historyIdx, isFocused, history, setHistoryIdx]);

  useHotkeys('up', () => {
    if (!isFocused) return;
    if (historyIdx > 0) setHistoryIdx(v => v-1);
  }, { filter: () => true }, [historyIdx, isFocused, history, setHistoryIdx]);

  return (
    <Container>
      <TopBar>
        <Heading>Past queries</Heading>
        <Hotkeys>
          <HotkeyWrapper>
            <Hotkey
              hotkey={['Tab']}
            />
            <HotkeyText>
              to focus & see more
            </HotkeyText>
          </HotkeyWrapper>

          <HotkeyWrapper>
            <Hotkey
              hotkey={['Esc']}
            />
            <HotkeyText>
              to hide
            </HotkeyText>
          </HotkeyWrapper>
        </Hotkeys>
      </TopBar>

      <Content>
        {!isFocused &&
          <Query
            onClick={() => selectHistory(0)}
          >
            {history[0]}
          </Query>
        }
        {isFocused && history.map((h, idx) => (
          <Query
            key={h}
            isFocused={isFocused && historyIdx === idx}
            onClick={() => selectHistory(idx)}
          >
            {h}
          </Query>
        ))}
      </Content>

      {!isFocused &&
        <MoreQueries>...and 9 more queries</MoreQueries>
      }
    </Container>
  );
}

export default SearchHistory;
