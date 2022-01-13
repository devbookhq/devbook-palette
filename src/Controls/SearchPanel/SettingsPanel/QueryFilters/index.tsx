import styled from 'styled-components';

import { SearchSource } from 'services/search.service/searchSource';
import DocsFilter from './DocsFilter';
import { User } from 'user/user';

const Container = styled.div`
`;

interface QueryFiltersProps {
  source: SearchSource;
}

function QueryFilters({ source }: QueryFiltersProps) {
  return (
    <Container>
      {source === SearchSource.Docs &&
        <DocsFilter />
      }
    </Container>
  );
}

export default QueryFilters;
