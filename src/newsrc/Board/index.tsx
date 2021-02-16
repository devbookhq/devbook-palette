import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import Tile from 'newsrc/Tile';

const Container = styled.div`
  flex: 1;
  background: ${() => Colors.Charcoal.dark};
`;

function Board() {
  return (
    <Container>
      <Tile/>
    </Container>
  );
}

export default Board;

