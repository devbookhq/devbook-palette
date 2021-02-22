import React  from 'react';
import styled from 'styled-components';

import ReactSplit, { SplitDirection as ReactSplitDirection } from '@devbookhq/react-split';

import Tile from 'newsrc/Tile';
import {
  TileNode,
  SplitNode,
  SplitDirection
} from 'newsrc/NewBoard/board.store';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  // Green
  //background: rgba(0, 255, 0, 0.2);
`;

const StyledTile = styled(Tile)`
  height: 100%;
  width: 100%;
`;

interface SplitProps {
  splitNode: SplitNode;
}

function Split({ splitNode }: SplitProps) {
  const direction = splitNode.direction === SplitDirection.Horizontal
    ? ReactSplitDirection.Horizontal
    : ReactSplitDirection.Vertical;

  return (
    <ReactSplit direction={direction}>
      {splitNode.getChildren().map(c => (
        <React.Fragment key={c.key}>
          {(c instanceof TileNode)
            ? <StyledTile key={c.key} results={[]}/>
            : <Split key={c.key} splitNode={c}/>
          }
        </React.Fragment>
      ))}
    </ReactSplit>
  );
}

export default Split;

