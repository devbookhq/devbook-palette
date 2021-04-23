import { useCallback } from 'react';
import styled from 'styled-components';
import { ReactComponent as searchImg } from 'img/search.svg';
import { observer } from 'mobx-react-lite';
import { useUIStore } from 'ui/ui.store';

const SearchWrapper = styled.div`
  padding: 10px;
  width: 100%;
  background: #25252E;

  display: flex;
  align-items: center;
  border-bottom: 1px solid #3B3A4A;
`;

const SearchImg = styled(searchImg)`
  margin-right: 8px;
  height: auto;
  width: 18px;

  path {
    stroke: #5A5A6F;
  }
`;

const SearchInput = styled.input`
  width: 100%;

  color: #fff;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Poppins';

  background: #25252E;
  border: none;
  outline: none;

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

interface FilterInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
}

function FilterInput({ inputRef }: FilterInputProps) {
  const uiStore = useUIStore();
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    uiStore.docsFilterModalQuery = q;
  }, [uiStore]);

  return (
    <SearchWrapper>
      <SearchImg />
      <SearchInput
        ref={inputRef}
        autoFocus
        placeholder="Python, JavaScript, Docker, etc"
        value={uiStore.docsFilterModalQuery}
        onKeyDown={handleInputKeyDown}
        onChange={handleQueryChange}
      />
    </SearchWrapper>
  );
}

export default observer(FilterInput);
