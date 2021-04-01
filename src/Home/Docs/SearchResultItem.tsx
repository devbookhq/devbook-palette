import React, {
  useRef,
  useMemo,
  useEffect,
} from 'react';
import styled from 'styled-components';

import { DocResult } from 'Search/docs';
import FocusState from '../SearchItemFocusState';

const maxSummaryLength = 180;

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  padding: 10px;

  font-size: 14px;
  font-weight: 400;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  background: ${props => props.isFocused ? '#3A41AF' : 'transparent'};
  border-bottom: 1px solid #3B3A4A;

  :hover {
    background: ${props => props.isFocused ? '#3A41AF' : '#2C2F5A'};
    cursor: pointer;
  }
`;

const EllipsisText = styled.span`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentationName = styled(EllipsisText)`
  margin-bottom: 3px;
  font-size: 14px;
  font-weight: 500;
  color: #a2a1a1;
`;

const PageName = styled(EllipsisText)`
  margin-bottom: 5px;
  color: #e6e6e6;
  font-family: 'Roboto Mono';
  font-size: 16px;
  font-weight: 600;
`;

const Summary = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #A2A1A1;


  color: #c1c9d2;
  font-size: 14px;
  line-height: 1.65em;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif;
`;

interface SearchResultItemProps {
  docResult: DocResult;
  focusState: FocusState;
  onClick: (e: any) => void;
}

function SearchResultItem({
  docResult,
  focusState,
  onClick,
}: SearchResultItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const truncatedSummary = useMemo(() => {
    const summary = docResult.page.summary;
    if (summary.length <= maxSummaryLength) return summary;
    return summary.slice(0, 177) + ' ...';
  }, [docResult]);

  useEffect(() => {
    if (focusState === FocusState.WithScroll) containerRef?.current?.scrollIntoView({ block: 'nearest' });
  }, [focusState]);

  return (
    <Container
      ref={containerRef}
      isFocused={focusState !== FocusState.None}
      onClick={onClick}
    >
      <DocumentationName>{docResult.page.breadcrumbs.join(' / ')}</DocumentationName>
      <PageName>{docResult.page.name}</PageName>
      <Summary>{truncatedSummary}</Summary>
    </Container>
  );
}

export default React.memo(SearchResultItem);
