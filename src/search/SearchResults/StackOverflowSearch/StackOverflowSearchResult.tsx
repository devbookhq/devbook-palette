import { StackOverflowResult } from 'services/search.service';

interface StackOverflowSearchResultProps {
  result: StackOverflowResult;
  isSelected: boolean;
}

function StackOverflowSearchResult({ result, isSelected }: StackOverflowSearchResultProps) {
  return (
    <>
      Stack Overflow Item
      {result.question.title}
    </>
  );
}

export default StackOverflowSearchResult;
