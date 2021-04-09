import styled from 'styled-components';

import { StackOverflowResult } from 'services/search.service';
import { FocusState } from 'Search/focusState';
import StackOverflowItem from './StackOverflowItem';

interface StackOverflowSeachResultsProps {
  results: StackOverflowResult[];
  selectedIdx: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

const Container = styled.div`
  padding: 10px 15px;
  width: 100%;
  overflow: hidden;
  overflow-y: overlay;
`;

function StackOverflowItems({ results, selectedIdx, containerRef }: StackOverflowSeachResultsProps) {
  return (
    <Container ref={containerRef}>
      {results.map((result, i) =>
        <StackOverflowItem
          result={result}
          key={result.question.title}
          focusState={selectedIdx === i ? FocusState.None : FocusState.NoScroll}
          onHeaderClick={() => { }}
          onTitleClick={() => { }}
        />
      )}
    </Container>
  );
}

export default StackOverflowItems;
