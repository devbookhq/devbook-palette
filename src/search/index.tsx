import styled from 'styled-components';

import SearchPanel from 'Controls/SearchPanel';
import SearchResults from './SearchResults';
import HotkeysPanel from 'Controls/HotkeysPanel';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

function Search() {
  return (
    <Container>
      <SearchPanel />
      <SearchResults />
      <HotkeysPanel />
    </Container>
  );
}

export default Search;
