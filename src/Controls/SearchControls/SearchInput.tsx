import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { useSearchStore } from 'Search/search.store';
import React from 'react';

const Input = styled.input`
  padding: 10px 5px 10px 15px;
  color: white;
  flex: 1;
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
  const searchStore = useSearchStore();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    searchStore.query = e.target.value;
  }

  return (
    <Input
      value={searchStore.query}
      onChange={handleInputChange}
    />
  );
}

export default observer(SearchInput);
