import styled from 'styled-components';

import Controls from 'Controls';
import SearchResults from './SearchResults';
import Shortcuts from 'Shortcuts';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

function Search() {
  return (
    <Container>
      <Controls />
      <SearchResults />
      <Shortcuts />
    </Container>
  );
}

export default Search;
