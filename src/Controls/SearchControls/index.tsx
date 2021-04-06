import styled from 'styled-components';

import SearchInput from './SearchInputWrapper';
import SearchButton from './SearchButton';
import SearchHistory from './SearchHistory';
import SearchSourceFilters from '../SettingsPanel/SearchSourceFilters';

const Container = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid #3B3A4A;
  justify-content: space-between;
  padding: 5px;
  padding-top: 3px;
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
      </SearchOptionsWrapper >
    </Container >
  )
}

export default SearchControls;
