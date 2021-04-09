import { useRef, useState } from 'react';

import { StackOverflowResult } from 'services/search.service';
import StackOverflowResults from './StackOverflowResults';
import StackOverflowModal from './StackOverflowModal';

interface StackOverflowProps {
  isModalOpened: boolean;
  results: StackOverflowResult[];
  onCloseModalRequest: () => void;
}

function StackOverflow({ results, isModalOpened, onCloseModalRequest }: StackOverflowProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const searchResultsWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {results.length !== 0 &&
        <>
          {isModalOpened &&
            <StackOverflowModal
              onCloseRequest={onCloseModalRequest}
              result={results[selectedIdx]}
            />
          }
          <StackOverflowResults
            containerRef={searchResultsWrapperRef}
            results={results}
            selectedIdx={selectedIdx}
          />
        </>
      }
    </>
  );
}

export default StackOverflow;
