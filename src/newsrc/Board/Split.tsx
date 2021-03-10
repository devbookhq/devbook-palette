import React, { useState, useCallback, useEffect }  from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import ReactSplit, { SplitDirection as ReactSplitDirection } from '@devbookhq/splitter';

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

interface SplitProps {
  splitNode: SplitNode;
}

const Split = observer(({ splitNode }: SplitProps) => {
  const [tileSizes, setTileSizes] = useState<number[]>([]);
  const direction = splitNode.direction === SplitDirection.Horizontal
    ? ReactSplitDirection.Horizontal
    : ReactSplitDirection.Vertical;

  useEffect(() => {
    const sizes = splitNode.children.map(c => c.size ?? 1/splitNode.children.length * 100);
    console.log('Initial sizes', sizes);
    setTileSizes(sizes);
  }, [splitNode.children]);

  const handleDidResizeSplit = useCallback((pairIdx, newSizes) => {
    console.log('Pair idx, new sizes', pairIdx, newSizes);
    setTileSizes(newSizes);
    splitNode.children.forEach((c, idx) => c.size = newSizes[idx]);
  }, [splitNode.children]);

  return (
    <ReactSplit
      direction={direction}
      //initialSizes={splitNode.children.flatMap(c => [c.size])}
      onDidResize={handleDidResizeSplit}
      initialSizes={tileSizes}
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


export default React.memo(Split, (prevProps, nextProps) => {
  console.log('PREV PROPS', prevProps);
  console.log('NEXT PROPS', nextProps);
  return true;
});

