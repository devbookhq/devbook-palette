import { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ isSelected?: boolean, isFullWidth?: boolean }>`
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
  background: ${props => props.isSelected ? '#3B3A4A' : 'transparent'};
  :hover {
    cursor: pointer;
    background: #3B3A4A;
  }
`;

interface SearchHistoryQueryProps {
  query: string;
  isSelected: boolean;
  onClick: (query: string) => void;
  queryRef?: React.RefObject<HTMLDivElement>;
}

function SearchHistoryQuery({ query, isSelected, onClick, queryRef }: SearchHistoryQueryProps) {
  return (
    <Container
      ref={queryRef}
      isSelected={isSelected}
      onClick={() => onClick(query)}
    >
      {query}
    </Container>
  );
}

export default memo(SearchHistoryQuery);
