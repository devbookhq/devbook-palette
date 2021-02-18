import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import { TitleNormal } from 'newsrc/ui/Title';
import Input from 'newsrc/ui/Input';
import Shortcut, { Modifier } from 'newsrc/Shortcut';

import StackOverflowItem from 'Home/StackOverflow/StackOverflowItem';
import FocusState from 'Home/SearchItemFocusState';

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

// TODO: Move TileBode into a separate component.
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
}

function Tile({ className, isFocused, results }: TileProps) {
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
              Stack Overflow
            </TitleNormal>
          </TileName>
          <TileControls>
          </TileControls>
        </TileInfo>

        <Input
          placeholder="Search Stack Overflow"
        />
      </TileHeader>
      <TileBody>
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

export default Tile;

