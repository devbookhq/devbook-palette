import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import electron from 'mainProcess';

const StyledLink = styled(Link)`
  color: #4FA9ED;
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  user-select: none;
`;

const ExternalLink = styled.a`
  color: #4FA9ED;
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  user-select: none;
`;

interface LinkTextProps {
  to: string;
  external?: boolean;
  onClick?: () => void;
  children?: React.ReactNode[] | React.ReactNode;
}

function LinkText(props: LinkTextProps) {
  function handleExternalLinkClick(e: any) {
    e.preventDefault();
    electron.shell.openExternal(props.to);
    props.onClick && props.onClick();
  }

  return (
    <>
      {!props.external && (
        <StyledLink
          onClick={props.onClick}
          to={props.to}
        >
          {props.children}
        </StyledLink>
      )}
      {props.external && (
        <ExternalLink href={props.to} onClick={handleExternalLinkClick}>
          {props.children}
        </ExternalLink>
      )}
    </>
  );
}

export default LinkText;

