import React from 'react';
import styled from 'styled-components';

const Container = styled.div<{ svg: string }>`
  width: 14px;
  height: 12px;
  background-image: url(${props => props.svg});
  background-repeat: no-repeat;
  background-position: center center;
`;

interface ModifierIconProps {
  icon: string,
}

function ModifierIcon({ icon }: ModifierIconProps) {
  return (
    <Container svg={icon}/>
  );
}

export default ModifierIcon;

