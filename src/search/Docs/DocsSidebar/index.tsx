import { FocusState } from 'Search/focusState';
import { DocResult } from 'services/search.service';
import styled from 'styled-components';
import { Resizable } from 're-resizable';
import { observer } from 'mobx-react-lite';

import DocsSidebarItem from './DocsSidebarItem';
import { useUIStore } from 'ui/ui.store';
import { useRef } from 'react';
import { ResultSelection } from 'Search/resultSelection';

const Container = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  overflow: overlay;
`;

const DocsResultsWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const DocSearchResults = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px 0 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: overlay;
  border-right: 2px solid #3B3A4A;
  background: #262736;
`;

interface DocsSidebarProps {
  results: DocResult[];
  selectResult: (idx: number) => void;
  selection: ResultSelection;
}

function DocsSidebar({ results, selectResult, selection }: DocsSidebarProps) {
  const uiStore = useUIStore();

  return (
    <Resizable
      defaultSize={{
        width: uiStore.docSearchResultsDefaultWidth,
        height: "100%"
      }}
      maxWidth="50%"
      minWidth="265"
      enable={{ right: true }}
      onResizeStop={(e, dir, ref) => uiStore.docSearchResultsDefaultWidth = ref.clientWidth}
    >
      <DocsResultsWrapper>
        <DocSearchResults>
          {results.map((result, idx) => (
            <DocsSidebarItem
              key={result.id}
              idx={idx}
              result={result}
              focusState={selection.idx === idx ? selection.focusState : FocusState.None}
              selectResult={selectResult}
            />
          ))}
        </DocSearchResults>
      </DocsResultsWrapper>
    </Resizable>
  );
}

export default observer(DocsSidebar);
