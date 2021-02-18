import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Resizable } from 're-resizable';

import Tile from 'newsrc/Tile';
import {
  TileNode,
  SplitNode,
  SplitDirection
} from 'newsrc/NewBoard/board.store';
import SplitVertical from './SplitVertical';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  // Yellow
  background: rgba(255, 0, 0, 0.2);
`;

const StyledTile = styled(Tile)`
  height: 100%;
  width: 100%;
`;

interface SplitHorizontalProps {
  split: SplitNode;
}

// TODO: SplitVertical and SplitHorizontal components are almost identical.
function SplitHorizontal({ split }: SplitHorizontalProps) {
  useEffect(() => {
    if (split.direction !== SplitDirection.Horizontal) throw new Error('Vertical split passed to the SplitHorizontal component.');
  }, [split]);

  return (
    <Container>
      {/* TODO: This code is same in the SplitVertical component. */}
      {split.getChildren().map(c => (
        <React.Fragment key={c.key}>
          {(c instanceof TileNode)
            ? <StyledTile key={c.key} results={[]}/>
            : (c.direction === SplitDirection.Vertical
                ? <SplitVertical key={c.key} split={c}/>
                : <SplitHorizontal key={c.key} split={c}/>
              )
          }
        </React.Fragment>
      ))}
    </Container>
  );
}

export default SplitHorizontal;


