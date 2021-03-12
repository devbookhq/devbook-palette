import React, { forwardRef } from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import * as Typography from 'newsrc/ui/typography';

const Container = styled.div`
  width: 100%;
  padding: 12px 8px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background: ${Colors.Charcoal.light};
  border-radius: 4px;
  border: 1px solid ${Colors.Charcoal.lighter};

  :focus-within {
    border-color: ${Colors.Orange.normal};
  }
`;

const StyledInput = styled.input`
  width: 100%;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.regular.large.fontSize};
  font-weight: ${Typography.Body.regular.large.fontWeight};

  background: transparent;
  border: none;

  border-radius: 4px;

  ::placeholder {
    color: ${Colors.Ink.dark};
  }
`;

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  type?: string;
  autoComplete?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  value,
  placeholder,
  onChange,
  onKeyDown,
  type,
}, ref) => {
  return (
    <Container>
      <StyledInput
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        type={type}
      />
   </Container>
  );
});

export default Input;

