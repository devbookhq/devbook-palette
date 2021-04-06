import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { SearchSource } from 'services/search.service';
import StackOverflowHotkeys from './StackOverflowHotkeys';
import DocsHotkeys from './DocsHotkeys';

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

function HotkeysPanel() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <Container>
      {searchSource === SearchSource.StackOverflow &&
        <StackOverflowHotkeys />
      }

      {searchSource === SearchSource.Docs &&
        <DocsHotkeys />
      }
    </Container>
  );
}

export default HotkeysPanel;
