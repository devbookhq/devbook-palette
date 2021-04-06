import styled from 'styled-components';
import { useSearchStore } from 'Search/search.store';
import { observer } from 'mobx-react-lite';

const Container = styled.div`
`;

const DocsetIcon = styled.img`

`;

function DocsQueryFilter() {
  const searchStore = useSearchStore();

  return (
    <Container>
      <DocsetIcon src={searchStore.filters.docs.selectedFilter?.iconURL} />
    </Container>
  );
}

export default observer(DocsQueryFilter);
