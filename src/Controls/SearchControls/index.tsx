import styled from 'styled-components';

import SearchInput from './SearchInput';
import SearchButton from './SearchButton';
import SearchHistory from './SearchHistory';
import SearchSourceFilters from './SearchSourceFilters';

const Container = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid #3B3A4A;
  justify-content: space-between;
`;

const FilterMenuWrapper = styled.div`
  display: flex;
  border-right: 1px solid #3B3A4A;
`;

const SearchOptionsWrapper = styled.div`
  display: flex;
`;

function SearchControls() {
  return (
    <Container>
      <SearchInput />
      <SearchOptionsWrapper>
        <SearchButton />
        <SearchHistory />
        <FilterMenuWrapper>
          <SearchSourceFilters />
        </FilterMenuWrapper>
      </SearchOptionsWrapper >
    </Container >
  )
}

export default SearchControls;
