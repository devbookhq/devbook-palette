import React from 'react';
import styled from 'styled-components';
import * as Colors from 'newsrc/ui/colors';

const Container = styled.div`
  flex: 1;
  background: ${() => Colors.Charcoal.dark};
`;

function Board() {
  return (
    <Container>
      Board
    </Container>
  );
}

export default Board;

