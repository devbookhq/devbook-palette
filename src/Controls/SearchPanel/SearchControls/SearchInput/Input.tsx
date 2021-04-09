import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';

import { useSearchStore } from 'Search/search.store';
import { useUIStore } from 'ui/ui.store';
import { SearchSource } from 'services/search.service/searchSource';

const Input = styled.input`
  padding: 10px 5px 10px 5px;
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

function handleInputKeyDown(e: any) {
  // We want to prevent cursor from moving when the up or down arrow is pressed.
  // The default behavior is that cursor moves either to the start or to the end.
  // 38 - up arrow
  // 40 - down arrow
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
    return;
  }
}

const placeholders: { [source in SearchSource]: string } = {
  [SearchSource.Docs]: 'Search documentation',
  [SearchSource.StackOverflow]: 'Search Stack Overflow',
}

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
}

function SearchInput({ inputRef }: SearchInputProps) {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    searchStore.query = e.target.value;
  }, [])

  return (
    <Input
      placeholder={placeholders[uiStore.searchSource]}
      ref={inputRef}
      value={searchStore.query}
      onChange={handleInputChange}
      onKeyDown={handleInputKeyDown}
    />
  );
}

export default observer(SearchInput);
