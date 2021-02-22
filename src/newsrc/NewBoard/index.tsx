import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import ReactSplit, { SplitDirection as ReactSplitDirection } from '@devbookhq/react-split';

import * as Colors from 'newsrc/ui/colors';
import Tile from 'newsrc/Tile';


import BoardStore, { LayoutNode, SplitDirection, SplitNode, TileNode, useBoardStore } from 'newsrc/NewBoard/board.store';
import Split from './Split';

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
      {boardStore.layout.root instanceof SplitNode
        ? <Split splitNode={boardStore.layout.root}/>
        : <StyledTile results={[]}/>
      }
    </Container>
  );
}

export default observer(Board);

