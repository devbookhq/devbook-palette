import React, {
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

import { connectGitHub } from 'mainProcess';
import useIPCRenderer from 'hooks/useIPCRenderer';
import Hotkey, { ModifierKey } from 'components/Hotkey';
import Loader from 'components/Loader';

const Content = styled.div`
  width: 100%;
  padding: 20px 10px 10px;
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid #373738;
`;

const InputWrapper = styled.div<{ isFocused?: boolean }>`
  min-height: 42px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-radius: 10px;
  background: #2B2D2F;
  border: 1px solid ${props => props.isFocused ? '#5d9bd4' : '#404244'};
`;

const Input = styled.input`
  padding: 10px 13px;
  flex: 1;

  color: white;
  font-family: 'Source Code Pro';
  font-weight: 600;
  font-size: 14px;

  border: none;
  outline: none;
  background: transparent;
`;

const StyledLoader = styled(Loader)`
  position: relative;
  right: 2px;
`;

const Menu = styled.div`
  width: 100%;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FiltersWrapper = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
`;

const Filter = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const FilterButton = styled.button<{ selected?: boolean }>`
  color: ${props => props.selected ? 'white' : '#909090'};
  font-size: 14px;
  font-weight: 600;

  background: none;
  border: none;

  :hover {
    cursor: pointer;
    color: white;
  }

  :not(:last-child) {
    margin-right: 2px;
  }
`;

const ConnectGitHubButton = styled.button`
  color: #3897EE;
  font-size: 14px;
  font-weight: 600;

  border: none;
  background: none;
  outline: none;
  :hover {
    cursor: pointer;
  }
`;

export enum FilterType {
  All = 'All',
  StackOverflow = 'StackOverflow',
  GitHubCode = 'Code',
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: any) => void;

  activeFilter: FilterType;
  onFilterSelect: (f: FilterType) => void;

  isLoading?: boolean;
}

function SearchInput({
  placeholder,
  value,
  onChange,
  activeFilter,
  onFilterSelect,
  isLoading,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useIPCRenderer('did-show-main-window', () => {
    inputRef?.current?.focus();
  });

  function handleContentMouseDown(e: any) {
    // Prevent blur when user is clicking on the filter buttons under the input element.
    // This also makes sure that user can select text in the input field using their mouse.
    if (!e.target.contains(inputRef?.current)) {
      if (isInputFocused) e.preventDefault();
    }
  };

  function handleInputKeyDown(e: any) {
    // We want to prevent cursor from moving when the up or down arrow is pressed.
    // The default behavior is that cursor moves either to the start or to the end.
    // 38 - up arrow
    // 40 - down arrow
    if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault();
  }

  return (
    <Content
      onMouseDown={handleContentMouseDown}
    >
      <InputWrapper
        isFocused={isInputFocused}
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={handleInputKeyDown}
        />
        {isLoading && <StyledLoader/>}
      </InputWrapper>
      <Menu>
        <FiltersWrapper>
          {Object.values(FilterType).map((f, idx) => (
            <Filter
              key={f}
            >
              <FilterButton
                selected={activeFilter === f}
                onClick={() => onFilterSelect(f)}
              >{f}
              </FilterButton>
              <Hotkey
                hotkey={[ModifierKey.Shift, ModifierKey.Alt, `${idx+1}`]}
              />
            </Filter>
          ))}
        </FiltersWrapper>
        <ConnectGitHubButton onClick={() => connectGitHub()}>
          Connect your GitHub account
        </ConnectGitHubButton>
      </Menu>
    </Content>
  );
}

export default SearchInput;

