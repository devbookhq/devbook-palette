import {
  useParams,
} from 'react-router-dom';

import { SearchSource } from 'services/search.service'
import StackOverflowSearch from './StackOverflowSearch';
import DocsSearch from './DocsSearch';

function Search() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <>
      {/* <ControlPanel /> */}
      {searchSource === SearchSource.StackOverflow &&
        <StackOverflowSearch />
      }

      {searchSource === SearchSource.Docs &&
        <DocsSearch />
      }
      {/* <ShortcutPanel /> */}
    </>
  );
}

export default Search;
