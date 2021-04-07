import { FocusState } from 'Search/focusState';
import { DocResult } from 'services/search.service';
import DocsItem from './DocsItem';

interface DocsSearchResultsProps {
  results: DocResult[];
  selectedIdx: number;
}

function DocsSearchResults({ results, selectedIdx }: DocsSearchResultsProps) {
  return (
    <>
      {/* {results.map((result, i) =>
        <DocsItem
          result={result}
          key={result.id}
          focusState={selectedIdx === i ? FocusState.None : FocusState.NoScroll}
        />
      )} */}
    </>
  );
}

export default DocsSearchResults;
