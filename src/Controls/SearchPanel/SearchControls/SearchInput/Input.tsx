import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import React, { KeyboardEventHandler } from 'react';

import { useSearchStore } from 'Search/search.store';

const Input = styled.input`
  padding: 10px 5px 10px 12px;
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

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputKeyDown: KeyboardEventHandler<HTMLInputElement>;
}

function SearchInput({ inputRef, handleInputKeyDown }: SearchInputProps) {
  const searchStore = useSearchStore();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    searchStore.query = e.target.value;
  }

  return (
    <Input
      ref={inputRef}
      value={searchStore.query}
      onChange={handleInputChange}
      onKeyDown={handleInputKeyDown}
    />
  );
}

export default observer(SearchInput);
