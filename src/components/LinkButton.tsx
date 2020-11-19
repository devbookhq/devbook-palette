import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import electron from 'mainProcess';

const StyledLink = styled(Link)`
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #FFF;
  font-weight: 600;
  font-size: 14px;
  user-select: none;

  background: #5C4FED;
  border-radius: 3px;
  // border: 1px solid #343434;

  :hover {
    color: #FFFFFF;
    cursor: pointer;
  }
`;

const ExternalLinkButton = styled.div`
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #FFF;
  font-weight: 600;
  font-size: 14px;
  user-select: none;

  background: #5C4FED;
  border-radius: 3px;
  // border: 1px solid #343434;

  :hover {
    color: #FFFFFF;
    cursor: pointer;
  }
`;

interface LinkButtonProps {
  className?: string;
  to: string;
  external?: boolean;
  onClick?: () => void;
  children?: React.ReactNode[] | React.ReactNode;
}

function LinkButton(props: LinkButtonProps) {
  function handleExternalClick(e: any) {
    e.preventDefault();
    electron.shell.openExternal(props.to);
    props.onClick && props.onClick();
  }

  return (
    <>
      {!props.external && (
        <StyledLink
          className={props.className}
          onClick={props.onClick}
          to={props.to}
        >
          {props.children}
        </StyledLink>
      )}

      {props.external && (
        <ExternalLinkButton
          className={props.className}
          onClick={handleExternalClick}
        >
          {props.children}
        </ExternalLinkButton>
      )}
    </>
  );
}

export default LinkButton;

