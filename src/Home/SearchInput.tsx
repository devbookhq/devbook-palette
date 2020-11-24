import React, {
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  width: 400px;
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
  margin-top: 10px;
  width: 100%;
`;

const FilterButton = styled.button<{ selected?: boolean }>`
  color: ${props => props.selected ? 'white' : '#BCBCBD'};
  font-size: 14px;
  font-weight: 600;

  background: none;
  border: none;

  :hover {
    cursor: pointer;
    color: white;
  }

  :not(:last-child) {
    margin-right: 5px;
  }
`;

enum Filter {
  All,
  StackOverflow,
  GitHubCode,
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: any) => void;
}

function SearchInput({
  placeholder,
  value,
  onChange,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useIPCRenderer('did-show-main-window', () => {
    inputRef?.current?.focus();
  });

  return (
    <Content>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <FiltersWrapper>
        <FilterButton selected>All</FilterButton>
        <FilterButton>StackOverflow</FilterButton>
        <FilterButton>GitHub Code</FilterButton>
      </FiltersWrapper>
    </Content>
  );
}

export default SearchInput;

