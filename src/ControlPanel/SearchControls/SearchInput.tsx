import { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import Button from 'components/Button';
import { useSearchStore } from 'Search/search.store';

const Input = styled.input`
  padding: 10px 15px;
  flex: 1;
  color: white;
  font-family: 'Roboto Mono';
  font-weight: 600;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
  ::placeholder {
    color: #5A5A6F;
  }
`;

function SearchInput() {
  const [query, setQuery] = useState('');

  const searchStore = useSearchStore();

  return (
    <>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        onClick={() => searchStore.executeSearch(query)}
      />
    </>
  );
}

export default observer(SearchInput);
