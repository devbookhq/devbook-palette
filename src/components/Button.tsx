import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ disabled?: boolean }>`
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #F28360;
  font-weight: 500;
  font-size: 14px;
  user-select: none;

  background: rgba(242, 131, 96, 0.1);
  border-radius: 3px;
  border: 1px solid #F28360;

  :hover {
    cursor: pointer;
    background: rgba(242, 131, 96, 0.25);
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
