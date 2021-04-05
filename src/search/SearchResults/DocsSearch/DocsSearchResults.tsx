import { DocResult } from 'services/search.service';
import DocsSearchResult from './DocsSearchResult';

interface DocsSearchResultsProps {
  results: DocResult[];
  selectedIdx: number;
}

function DocsSearchResults({ results, selectedIdx }: DocsSearchResultsProps) {
  return (
    <>
      {results.map((result, i) =>
        <DocsSearchResult
          result={result}
          key={result.id}
          isSelected={selectedIdx === i}
        />
      )}
    </>
  );
}

export default DocsSearchResults;
