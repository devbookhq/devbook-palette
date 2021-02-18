
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Resizable } from 're-resizable';

import Tile from 'newsrc/Tile';
import {
  TileNode,
  SplitNode,
  SplitDirection
} from 'newsrc/NewBoard/board.store';

import SplitHorizontal from './SplitHorizontal';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // Green
  background: rgba(0, 255, 0, 0.2);
`;

const StyledTile = styled(Tile)`
  height: 100%;
  width: 100%;
`;

interface SplitHorizontalProps {
  split: SplitNode;
}

function SplitVertical({ split }: SplitHorizontalProps) {
  useEffect(() => {
    if (split.direction !== SplitDirection.Vertical) throw new Error('Vertical split passed to the SplitHorizontal component.');
  }, [split]);

  return (
    <Container>
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

export default SplitVertical;


