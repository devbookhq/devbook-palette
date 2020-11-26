import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';
import Hotkey, { ModifierKey } from 'components/Hotkey';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  width: 650px;
  padding: 10px 13px;

  color: white;
  font-family: 'Source Code Pro';
  font-weight: 600;
  font-size: 14px;

  border-radius: 10px;
  background: #2B2D2F;
  border: 1px solid #404244;
  outline: none;

  :focus {
    border-color: #3897EE;
  }
`;

const FiltersWrapper = styled.div`
  display: flex;
  margin-top: 10px;
  width: 100%;
`;

const Filter = styled.div`
  margin-right: 10px;
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
}

function SearchInput({
  placeholder,
  value,
  onChange,
  activeFilter,
  onFilterSelect,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useIPCRenderer('did-show-main-window', () => {
    inputRef?.current?.focus();
  });

  function handleContentMouseDown(e: any) {
    // Prevent blur on the input element.
    if (isInputFocused) e.preventDefault();
  };

  return (
    <Content
      onMouseDown={handleContentMouseDown}
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />
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

    </Content>
  );
}

export default SearchInput;

