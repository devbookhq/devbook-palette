import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { DocResult } from 'services/search.service';
import DocsBody from './DocsBody';
import DocsSidebar from './DocsSidebar';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import { ResultSelection } from 'Search/resultSelection';
import { FocusState } from 'Search/focusState';

const Container = styled.div`
  display: flex;
  overflow: hidden;
`;

interface DocsProps {
  results: DocResult[];
}

function Docs({ results }: DocsProps) {
  const uiStore = useUIStore();

  const [selection, setSelection] = useState<ResultSelection>({ idx: 0, focusState: FocusState.WithScroll });
  const docPageSearchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelection({
      idx: 0,
      focusState: FocusState.WithScroll,
    });
  }, [results]);

  const resultsUpHandler = useCallback(() => {
    setSelection(s => {
      const idx = s.idx > 0 ? s.idx - 1 : s.idx;
      return {
        idx,
        focusState: FocusState.WithScroll,
      }
    });
    docPageSearchInputRef?.current?.scrollIntoView({ block: 'start' });
  }, [docPageSearchInputRef]);

  const resultsDownHandler = useCallback(() => {
    setSelection(s => {
      const idx = s.idx < results.length - 1 ? s.idx + 1 : s.idx;
      return {
        idx,
        focusState: FocusState.WithScroll,
      };
    });
    docPageSearchInputRef?.current?.scrollIntoView({ block: 'start' });
  }, [results, docPageSearchInputRef]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsResultsUp, resultsUpHandler);
  }, [resultsUpHandler, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsResultsDown, resultsDownHandler);
  }, [resultsDownHandler, uiStore]);

  const selectResult = useCallback((idx: number) => {
    setSelection({
      idx,
      focusState: FocusState.NoScroll,
    });
  }, []);

  return (
    <>
      <Container>
        <DocsSidebar
          results={results}
          selection={selection}
          selectResult={selectResult}
        />
        <DocsBody
          result={results[selection.idx]}
        />
      </Container>
    </>
  );
}

export default observer(Docs);
