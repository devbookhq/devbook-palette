import { DocResult } from 'services/search.service';

interface DocsSearchResultProps {
  result: DocResult;
  isSelected: boolean;
}

function DocsSearchResult({ result, isSelected }: DocsSearchResultProps) {
  return (
    <>
      Docs Result
      {result.id}
    </>
  );
}

export default DocsSearchResult;
