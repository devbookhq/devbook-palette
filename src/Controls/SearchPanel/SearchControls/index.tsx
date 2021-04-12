import styled from 'styled-components';

import SearchInput from './SearchInput';
import SearchButton from './SearchButton';
import SearchHistory from './SearchHistory';
import SearchSourceFilters from './SearchSourceFilters';
import SearchLoader from './SearchLoader';


const Container = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid #3B3A4A;
  justify-content: space-between;
  padding: 0px 10px 5px;
`;

const FilterMenuWrapper = styled.div`
  display: flex;
  border-left: 1px solid #3B3A4A;
  padding: 0px 0px 0px 5px;
`;

const SearchOptionsWrapper = styled.div`
  display: flex;
  padding: 0px 5px 0px 0px;
`;

function SearchControls() {
  return (
    <Container>
      <SearchInput />
      <SearchOptionsWrapper>
        <SearchLoader />
        <SearchButton />
        <SearchHistory />
      </SearchOptionsWrapper >
      <FilterMenuWrapper>
        <SearchSourceFilters />
      </FilterMenuWrapper>
    </Container >
  )
}

export default SearchControls;
