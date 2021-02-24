import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import * as Colors from 'newsrc/ui/colors';
import { TitleNormal } from 'newsrc/ui/Title';
import Input from 'newsrc/ui/Input';
import Shortcut, { Modifier } from 'newsrc/Shortcut';
import { useBoardStore } from 'newsrc/Board/board.store';

import StackOverflowItem from 'Home/StackOverflow/StackOverflowItem';
import FocusState from 'Home/SearchItemFocusState';
import {SplitDirection, TileNode} from 'newsrc/Board/board.store';

const Container = styled.div<{ isFocused?: boolean }>`
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-top;

  border-radius: 5px;
  background: ${Colors.Charcoal.normal};
  border: 1px solid ${props => props.isFocused ? Colors.Orange.dark : Colors.Charcoal.lighter};
  box-shadow: ${props => props.isFocused ? '0px 0px 13px 6px ' + Colors.toRGBA(Colors.Orange.normal, 0.2) : 'none'};
`;

// TODO: Move TileHeader into a separate component.
const TileHeader = styled.div`
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TileInfo = styled.div`
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TileControls = styled.div`
  display: flex;
  align-items: center;
`;

// TODO: Move TileBody into a separate component.
const TileBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: auto;
`;

interface TileProps {
  className?: string;
  isFocused?: boolean;
  results: any[];
  tileNode: TileNode;
}

// TODO: Move Tile into the Board directory.
function Tile({
  tileNode,
  className,
  isFocused,
  results
}: TileProps) {
  const boardStore = useBoardStore();

  function splitHorizontally() {
    boardStore.splitTile(SplitDirection.Horizontal, tileNode);
  }

  function splitVertically() {
    boardStore.splitTile(SplitDirection.Vertical, tileNode);
  }

  function removeTile() {
    boardStore.removeTile(tileNode);
  }

  return (
    <Container
      className={className}
      isFocused={isFocused}
    >
      <TileHeader>
        <TileInfo>
          <TileName>
            <Shortcut
              accelerator={[Modifier.Command, '2']}
            />
            <TitleNormal>
              {tileNode.key}
            </TitleNormal>
          </TileName>
          <TileControls>
            {/* If the tile is the root, we can't remove it. */}
            {tileNode.parentKey &&
              <button onClick={removeTile}>
                Remove
              </button>
            }
            <button onClick={splitHorizontally}>
              Split H
            </button>
            <button onClick={splitVertically}>
              Split V
            </button>
          </TileControls>
        </TileInfo>

        <Input
          placeholder="Search Stack Overflow"
        />
      </TileHeader>
      <TileBody>
      {/*
      {[...Array(40)].map((_, i) => (
        <p key={i}>
          Row {i}
        </p>
      ))}
      */}
      {/*
        {results.map(r => (
          <StackOverflowItem
            key={r.question.title}
            soResult={r}
            focusState={FocusState.None}
            onHeaderClick={() => {}}
            onTitleClick={() => {}}
          />
        ))}
        */}
        {/*
        {results.length > 0 &&

          <StackOverflowItem
            soResult={results[Math.ceil(Math.random() * 9)] as any}
            focusState={FocusState.None}
            onHeaderClick={() => {}}
            onTitleClick={() => {}}
          />
        }
        */}
      </TileBody>
    </Container>
  );
}

export default observer(Tile);

