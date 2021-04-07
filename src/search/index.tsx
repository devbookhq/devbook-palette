import styled from 'styled-components';

import { useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service'
import StackOverflow from './StackOverflow';
import Docs from './Docs';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Search() {
  const uiStore = useUIStore();
  return (
    <Container>
      {uiStore.searchSource === SearchSource.StackOverflow &&
        <StackOverflow />
      }

      {uiStore.searchSource === SearchSource.Docs &&
        <Docs />
      }
    </Container>
  );
}

export default Search;
