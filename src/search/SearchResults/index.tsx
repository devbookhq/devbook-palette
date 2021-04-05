import { useParams } from 'react-router-dom';

import { SearchSource } from 'services/search.service'
import StackOverflowSearch from './StackOverflowSearch';
import DocsSearch from './DocsSearch';

function SearchResults() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <>
      {searchSource === SearchSource.StackOverflow &&
        <StackOverflowSearch />
      }

      {searchSource === SearchSource.Docs &&
        <DocsSearch />
      }
    </>
  );
}

export default SearchResults;
