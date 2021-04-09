import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { DocResult } from 'services/search.service';
import DocsBody from './DocsBody';
import DocsSidebar from './DocsSidebar';
import DocsFilterModal from './DocsFilterModal';
import { useUIStore } from 'ui/ui.store';

interface Docs {
  results: DocResult[];
}

function Docs({ results }: Docs) {
  const uiStore = useUIStore();

  const docPageSearchInputRef = useRef<HTMLInputElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const toggleFilterModal = useCallback(() => {
    uiStore.toggleFilterModal();
  }, []);

  return (
    <>
      {uiStore.isFilterModalOpened &&
        <DocsFilterModal
          onCloseRequest={toggleFilterModal}
        />
      }
      {results.length !== 0 &&
        <>
          <DocsSidebar
            results={results}
            selectedIdx={selectedIdx}
            selectIdx={setSelectedIdx}
          />
          <DocsBody
            searchInputRef={docPageSearchInputRef}
            result={results[selectedIdx]}
          />
        </>
      }
    </>
  );
}

export default observer(Docs);
