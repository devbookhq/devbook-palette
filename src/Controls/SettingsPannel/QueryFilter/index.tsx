import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { SearchSource } from 'services/search.service'
import DocsQueryFilter from './DocsQueryFilter';

const Container = styled.div`
`;

function QueryFilter() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <Container>
      {searchSource === SearchSource.Docs &&
        <DocsQueryFilter />
      }
    </Container>
  );
}

export default QueryFilter;
