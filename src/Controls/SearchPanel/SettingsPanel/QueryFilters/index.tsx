import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { SearchSource } from 'services/search.service'
import DocsFilter from './DocsFilter';
import { useUIStore } from 'ui/ui.store';

const Container = styled.div`
`;

function QueryFilters() {
  const uiStore = useUIStore();

  return (
    <Container>
      {uiStore.searchSource === SearchSource.Docs &&
        <DocsFilter />
      }
    </Container>
  );
}

export default observer(QueryFilters);
