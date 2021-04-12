import styled from 'styled-components';

import { StackOverflowResult } from 'services/search.service';
import { FocusState } from 'Search/focusState';
import { ResultSelection } from 'Search/resultSelection';
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
  containerRef: React.RefObject<HTMLDivElement>;
  selection: ResultSelection;
  openModalForResult: (idx: number) => void;
  selectResult: (idx: number) => void;
}

function StackOverflowItems({ results, openModalForResult, selectResult, containerRef, selection }: StackOverflowSeachResultsProps) {
  console.log('selection', selection);

  return (
    <Container
      ref={containerRef}
    >
      {results.map((result, idx) =>
        <StackOverflowItem
          result={result}
          key={result.question.title}
          focusState={selection.idx === idx ? selection.focusState : FocusState.None}
          openModalForResult={openModalForResult}
          selectResult={selectResult}
          idx={idx}
        />
      )}
    </Container>
  );
}

export default StackOverflowItems;
