import React  from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import ReactSplit, { SplitDirection as ReactSplitDirection } from '@devbookhq/react-split';

import Tile from 'newsrc/Board/Tile';
import {
  TileNode,
  SplitNode,
  SplitDirection,
} from 'newsrc/Board/board.store';

const StyledTile = styled(Tile)`
  height: 100%;
  width: 100%;
`;

const Hidden = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 0px;
  height: 0px;
  visibility: hidden;
`;

interface SplitProps {
  splitNode: SplitNode;
}

const Split = observer(({ splitNode }: SplitProps) => {
  const direction = splitNode.direction === SplitDirection.Horizontal
    ? ReactSplitDirection.Horizontal
    : ReactSplitDirection.Vertical;

  return (
    <ReactSplit
      direction={direction}
    >
      {splitNode.children.map(c => (
        <React.Fragment key={c.key}>
          {(c instanceof TileNode)
            ? <StyledTile key={c.key} results={[]} tileNode={c}/>
            : <Split key={c.key} splitNode={c}/>
          }
        </React.Fragment>
      ))}
    </ReactSplit>
  );
});

export default Split;

