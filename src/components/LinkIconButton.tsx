import React from 'react';
import styled from 'styled-components';
import { Link, useRouteMatch } from 'react-router-dom';

interface LinkIconButtonProps {
  className?: string;
  isActive?: boolean;
  to: string;
  icon: any;
}

const Icon = styled.div`
  margin: 3px;
  opacity: ${({ isActive }: { isActive: boolean }) => isActive ? '100%' : '50%'};
  :hover {
    opacity: 100%;
    cursor: pointer;
  }
`;

function LinkIconButton(props: LinkIconButtonProps) {
  const match = useRouteMatch({
    path: props.to,
  });

  return (
    <Link
      className={props.className}
      to={props.to}
    >
      <Icon
        isActive={!!match}
      >
        {props.icon}
      </Icon>
    </Link >
  )
}


export default LinkIconButton;
