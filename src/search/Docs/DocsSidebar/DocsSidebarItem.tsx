import {
  useRef,
  useMemo,
  memo,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';

import { DocResult } from 'services/search.service';
import { FocusState } from 'Search/focusState';

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

interface DocsItemProps {
  result: DocResult;
  focusState: FocusState;
  idx: number;
  selectIdx: (i: number) => void;
}

function DocsItem({
  result,
  focusState,
  idx,
  selectIdx,
}: DocsItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const truncatedSummary = useMemo(() => {
    const summary = result.page.summary;
    if (summary.length <= maxSummaryLength) return summary;
    return summary.slice(0, 177) + ' ...';
  }, [result]);

  useEffect(() => {
    if (focusState === FocusState.WithScroll) containerRef?.current?.scrollIntoView({ block: 'nearest' });
  }, [focusState]);

  const handleOnClick = useCallback(() => {
    selectIdx(idx);
  }, [selectIdx, idx]);

  return (
    <Container
      ref={containerRef}
      isFocused={focusState !== FocusState.None}
      onClick={handleOnClick}
    >
      <DocumentationName>{result.page.breadcrumbs.join(' / ')}</DocumentationName>
      <PageName>{result.page.name}</PageName>
      <Summary>{truncatedSummary}</Summary>
    </Container>
  );
}

export default memo(DocsItem);
