import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ disabled?: boolean }>`
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;
  font-weight: 500;
  font-size: 14px;
  user-select: none;

  background: #535BD7;
  border-radius: 3px;

  :hover {
    cursor: pointer;
    background: #646CEA;
  }
`;

interface ButtonProps {
  className?: string;
  onClick: any;
  disabled?: boolean;
  onClickDisabled?: () => void;
}

const Button: FunctionComponent<ButtonProps> = ({
  className, children, onClick, disabled, onClickDisabled
}) => {
  return (
    <Container className={className} onClick={disabled ? (onClickDisabled || (() => { })) : onClick} disabled={disabled} >
      {children}
    </Container >
  );
}

export default Button;
