import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';

const Container = styled.div<{ isFocused?: boolean }>`
  position: relative;
  left: 16px;
  top: 16px;

  height: 430px;
  width: 280px;

  border-radius: 5px;
  background: ${() => Colors.Charcoal.normal};
  border: 1px solid ${props => props.isFocused ? Colors.Orange.dark : Colors.Charcoal.lighter};
  box-shadow: ${props => props.isFocused ? '0px 0px 13px 6px ' + Colors.toRGBA(Colors.Orange.normal, 0.2) : 'none'};
`;

function Tile() {
  return (
    <Container isFocused/>
  );
}

export default Tile;

