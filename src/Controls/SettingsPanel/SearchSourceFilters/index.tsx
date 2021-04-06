import {
  useHistory,
  useParams,
} from 'react-router-dom'; 

import { SearchSource } from 'services/search.service';
import SearchSourceFilter from './SearchSourceFilter';

function SearchSourceFilters() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();
  const history = useHistory();

  function changeFilter(source: SearchSource) {
    if (searchSource === source) return;
    history.push(`/home/search/${source}`);
  }

  return (
    <>
      <SearchSourceFilter
        source={SearchSource.StackOverflow}
        onSelect={() => changeFilter(SearchSource.StackOverflow)}
        isSelected={searchSource === SearchSource.StackOverflow}
      />
      <SearchSourceFilter
        source={SearchSource.Docs}
        onSelect={() => changeFilter(SearchSource.Docs)}
        isSelected={searchSource === SearchSource.Docs}
      />
    </>
  );
}

export default SearchSourceFilters;
