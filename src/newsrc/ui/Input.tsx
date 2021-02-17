import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import * as Typography from 'newsrc/ui/typography';

import { ReactComponent as searchIcon } from 'newsrc/img/search.svg';

const Container = styled.div`
  width: 100%;
  padding: 6px 4px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background: ${Colors.Charcoal.light};
  border-radius: 4px;
  border: 1px solid ${Colors.Charcoal.lighter};
`;

const StyledInput = styled.input`
  width: 100%;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.regular.large.fontSize};
  font-weight: ${Typography.Body.regular.large.fontWeight};


  background: transparent;
  border: none;

  border-radius: 5px;

  ::placeholder {
    color: ${Colors.Ink.dark};
  }
`;

const SearchIcon = styled(searchIcon)`
  height: auto;
  width: 18px;
`;

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange?: (e: any) => void;
}

function Input({
  value,
  placeholder,
  onChange,
}: InputProps) {
  return (
    <Container>
      <StyledInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <SearchIcon/>
   </Container>
  );
}

export default Input;

