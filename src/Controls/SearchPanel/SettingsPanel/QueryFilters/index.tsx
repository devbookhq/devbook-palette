import styled from 'styled-components';

import { SearchSource } from 'services/search.service/searchSource';
import DocsFilter from './DocsFilter';
import { User } from 'user/user';

const Container = styled.div`
`;

interface QueryFiltersProps {
  source: SearchSource;
  user: User | undefined;
}

function QueryFilters({ source, user }: QueryFiltersProps) {
  return (
    <Container>
      {source === SearchSource.Docs &&
        user &&
        <DocsFilter />
      }
    </Container>
  );
}

export default QueryFilters;
