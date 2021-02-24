import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';

import { SplitNode, useBoardStore } from './board.store';
import Split from './Split';
import Tile from './Tile';

// TODO: CSS-wise, this should probably be a grid?
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  overflow: auto;
  background: ${Colors.Charcoal.dark};
`;

const StyledTile = styled(Tile)`
  height: 100%;
  width: 100%;
`;

function Board() {
  const boardStore = useBoardStore();

  return (
    <Container>
      {boardStore.layoutRoot instanceof SplitNode
        ? <Split splitNode={boardStore.layoutRoot}/>
        : <StyledTile results={[]} tileNode={boardStore.layoutRoot}/>
      }
    </Container>
  );
}

export default observer(Board);

