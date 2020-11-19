import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: white;
`;

const Description = styled.span`
  margin-top: 3px;
  font-weight: 400;
  font-size: 14px;
  color: #919396;
`;

const StyledSelect = styled.select`
  height: 37px;
  margin-top: ${({makeMargin}: {makeMargin?: boolean}) => makeMargin ? '10px' : 0};
  padding: 8px 10px;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 400;
  color: white;
  background: #1E2025;
  border: 1px solid #3A3D43;
  border-radius: 5px;

  :focus {
    border-color: #F28360;
  }

  :hover {
    cursor: pointer;
  }
`;

interface SelectValue {
  value: string;
  displayValue: string;
}

interface SelectProps {
  className?: string;

  name?: string;
  description?: string;

  selectedValue: string;
  values: SelectValue[];
  onChange: (e: any) => void;
}

function Select({
  className,
  name,
  description,
  ...rest
}: SelectProps) {
  const select = ({className, makeMargin}: {className?: string, makeMargin?: boolean}) => (
    <StyledSelect
      className={className}
      makeMargin={makeMargin}
      value={rest.selectedValue}
      onChange={rest.onChange}
    >
      {rest.values.map(v => (
        <option key={v.value} value={v.value}>{v.value || v.displayValue}</option>
      ))}
    </StyledSelect>
  );


  if (name || description) {
    return (
      <Container className={className}>
        <Name>{name}</Name>
        <Description>{description}</Description>
        {select({makeMargin: true})}
      </Container>
    );
  }
  return select({className});
}

export default Select;

