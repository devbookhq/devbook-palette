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
  return (
    <Container
      ref={containerRef}
    >
      {results.map((result, idx) =>
        <StackOverflowItem
          result={result}
          idx={idx}
          key={result.question.title}
          focusState={selection.idx === idx ? selection.focusState : FocusState.None}
          openModalForResult={openModalForResult}
          selectResult={selectResult}
          selection={selection}
        />
      )}
    </Container>
  );
}

export default StackOverflowItems;
