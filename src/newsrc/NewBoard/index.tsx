import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import Tile from 'newsrc/Tile';
import { NumberSize, Resizable, ResizeCallback } from 're-resizable';


import BoardStore, { SplitDirection, TileNode, useBoardStore } from 'newsrc/NewBoard/board.store';

import SplitVertical from './SplitVertical';
import SplitHorizontal from './SplitHorizontal';

// TODO: CSS-wise, this should probably be a grid?
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // flex: 1;
  // display: flex;
  // flex-wrap: wrap;
  // overflow-y: auto;
  overflow: auto;
  background: ${Colors.Charcoal.dark};
`;

const StyledTile = styled(Tile)`
  // margin: 8px;
  height: 100%;
  width: 100%;
`;


function Board() {
  const boardStore = useBoardStore();

  React.useEffect(() => {
    boardStore.layout.print();

    for (let el of document.getElementsByClassName("vertical-resizable")) {
      (el as HTMLElement).style.height = '50%';
    }
  }, []);

  return (
    <Container>
      {boardStore.layout.root instanceof TileNode
        ? <StyledTile results={[]}/>
        : (boardStore.layout.root.direction === SplitDirection.Vertical
            ? <SplitVertical split={boardStore.layout.root}/>
            : <SplitHorizontal split={boardStore.layout.root}/>
          )
      }
    </Container>
  );
}

export default observer(Board);

