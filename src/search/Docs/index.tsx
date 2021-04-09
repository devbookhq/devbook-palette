import { useState } from 'react';

import DocsSearchResults from './DocsResults';
import DocsFilterModal from './DocsFilterModal';
import { DocResult } from 'services/search.service';

interface DocsProps {
  results: DocResult[];
  isFilterModalOpened: boolean;
  onCloseFilterModalRequest: () => void;
}

function Docs({ results, isFilterModalOpened, onCloseFilterModalRequest }: DocsProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  return (
    <>
      {isFilterModalOpened &&
        <DocsFilterModal
          onCloseRequest={onCloseFilterModalRequest}
        />
      }
      {results.length !== 0 &&
        <>
          <DocsSearchResults
            results={results}
            selectedIdx={selectedIdx}
          />
        </>
      }
    </>
  );
}

export default Docs;
