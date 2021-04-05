import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { SearchSource } from 'services/search.service';
import StackOverflowShortcuts from './StackOverflowShortcuts';
import DocsShortcuts from './DocsShortcuts';

const Container = styled.div`
  width: 100%;
  padding: 4px 5px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2E303D;
  border-top: 1px solid #3B3A4A;
`;

function Shortcuts() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <Container>
      {searchSource === SearchSource.StackOverflow &&
        <StackOverflowShortcuts />
      }

      {searchSource === SearchSource.Docs &&
        <DocsShortcuts />
      }
    </Container>
  );
}

export default Shortcuts;
