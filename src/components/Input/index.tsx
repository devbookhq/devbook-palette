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

const StyledInput = styled.input`
  width: 100%;
  margin-top: ${({makeMargin}: {makeMargin?: boolean}) => makeMargin ? '10px' : 0};
  padding: 8px 10px;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 400;
  color: white;
  background: #1E2025;
  border: 1px solid #3A3D43;
  border-radius: 5px;

  ::placeholder {
    color: #747578;
  }

  :focus {
    border-color: #F28360;
  }
`;

interface InputProps {
  className?: string;

  name?: string;
  description?: string;

  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: any) => void;
}

function Input(props: InputProps) {
  const {
    className,
    name,
    description,
    ...rest
  } = props;

  if (name || description) {
    return (
      <Container className={className}>
        <Name>{name}</Name>
        <Description>{description}</Description>
        <StyledInput makeMargin {...rest}/>
      </Container>
    );
  }
  return <StyledInput className={className} {...rest}/>
}

export default Input;
