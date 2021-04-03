import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import Hotkey from 'Home/HotkeysPanel/Hotkey';

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

const Query = styled.div<{ isFocused?: boolean, isFullWidth?: boolean }>`
  width: ${props => props.isFullWidth ? '100%' : 'calc(100% - 155px)'};
  margin: 2px 0;
  padding: 8px;
  min-height: 32px;

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

function SearchHistory({
  history,
  isFocused,
  historyIdx,
  onQueryClick,
  onHideHotkeyClick,
}: SearchHistoryProps) {
  const queryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queryRef?.current?.scrollIntoView({ block: 'end' });
  }, [historyIdx]);

  return (
    <Container
      isFocused={isFocused}
    >
      <TopBar>
        <Heading>Past queries</Heading>
        <HotkeyWrapper
          onClick={onHideHotkeyClick}
        >
          <Hotkey
            hotkey={['Tab']}
          />
          <HotkeyText>
            to hide
          </HotkeyText>
        </HotkeyWrapper>
      </TopBar>

      <Content>
        {!isFocused &&
          <UnfocusedStateWrapper>
            <Query
              onClick={() => onQueryClick(history[0])}
            >
              {history[0]}
            </Query>
            <MoreQueries>...and 9 more queries</MoreQueries>
          </UnfocusedStateWrapper>
        }
        {isFocused && history.map((h, idx) => (
          <Query
            isFullWidth
            ref={historyIdx === idx ? queryRef : null}
            key={h}
            isFocused={isFocused && historyIdx === idx}
            onClick={() => onQueryClick(history[idx])}
          >
            {h}
          </Query>
        ))}
      </Content>
    </Container>
  );
}

export default SearchHistory;
