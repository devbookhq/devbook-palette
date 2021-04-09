import { SearchSource } from 'services/search.service/searchSource';
import SearchSourceFilter from './SearchSourceFilter';

function SearchSourceFilters() {
  return (
    <>
      <SearchSourceFilter
        source={SearchSource.StackOverflow}
      />
      <SearchSourceFilter
        source={SearchSource.Docs}
      />
    </>
  );
}

export default SearchSourceFilters;