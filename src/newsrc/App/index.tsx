import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import Toolbar from 'newsrc/Toolbar';
import Board from 'newsrc/Board';

const FlexContainer = styled.div<{ direction?: 'row' | 'column' }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: ${props => props.direction ? props.direction : 'row'};
`;

function App() {
  return (
    <FlexContainer>
      <Toolbar/>
      <FlexContainer direction="column">
        <Board/>
      </FlexContainer>
    </FlexContainer>
  );
}

export default observer(App);

