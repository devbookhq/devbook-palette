import styled from 'styled-components';

import { StackOverflowResult } from 'services/search.service';
import { FocusState } from 'Search/focusState';
import StackOverflowItem from './StackOverflowItem';

const Container = styled.div`
  height: 100%;
  width: 100%;
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  overflow: overlay;
`;

interface StackOverflowSeachResultsProps {
  results: StackOverflowResult[];
  selectedIdx: number;
  containerRef: React.RefObject<HTMLDivElement>;
  openModalForResult: (i: number) => void;
}

function StackOverflowItems({ results, selectedIdx, openModalForResult, containerRef }: StackOverflowSeachResultsProps) {

  return (
    <Container>
      {results.map((result, i) =>
        <StackOverflowItem
          result={result}
          key={result.question.title}
          focusState={selectedIdx === i ? FocusState.None : FocusState.NoScroll}
          openModalForResult={openModalForResult}
          idx={i}
        />
      )}
    </Container>
  );
}

export default StackOverflowItems;
