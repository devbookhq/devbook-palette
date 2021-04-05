import { StackOverflowResult } from 'services/search.service';
import StackOverflowSearchResult from './StackOverflowSearchResult';


interface StackOverflowSeachResultsProps {
  results: StackOverflowResult[];
  selectedIdx: number;
}

function StackOverflowSearchResults({ results, selectedIdx }: StackOverflowSeachResultsProps) {
  return (
    <>
      {results.map((result, i) =>
        <StackOverflowSearchResult
          result={result}
          key={result.question.link}
          isSelected={selectedIdx === i}
        />
      )}
    </>
  );
}

export default StackOverflowSearchResults;
