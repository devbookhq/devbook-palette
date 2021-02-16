import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Resizable } from 're-resizable';

import * as Colors from 'newsrc/ui/colors';
import { useUIStore } from 'newsrc/ui/ui.store';

const FlexContainer = styled.div<{ direction?: 'row' | 'column' }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: ${props => props.direction ? props.direction : 'row'};
`;

const TabBar = styled.div`
  width: 100%;
  height: 40px;
  background: ${() => Colors.Charcoal.normal};
  -webkit-app-region: drag;
  -webkit-user-select: none;
`;

const Toolbar = styled.div`
  width: 100%;
  height: 100%;
  background: ${() => Colors.Charcoal.normal};
  border-right: 1px solid ${() => Colors.Charcoal.lighter}
`;

const Board = styled.div`
  flex: 1;
  background: ${() => Colors.Charcoal.dark};
`;

function App() {
  const uiStore = useUIStore();

  function saveToolbarWidth(width: number) {
    uiStore.toolbarWidth = width;
  }

  return (
    <FlexContainer>
      <Resizable
        defaultSize={{
          width: uiStore.toolbarWidth,
          height: "100%"
        }}
        maxWidth="50%"
        minWidth={uiStore.toolbarDefaultWidth}
        enable={{ right: true }}
        onResizeStop={(_unusedEvent, _unusedDirection, ref) => saveToolbarWidth(ref.clientWidth)}
      >
        <Toolbar>
          Toolbar
        </Toolbar>
      </Resizable>
      <FlexContainer direction="column">
        {/* We don't support multiple tabs yet. */}
        {/*
        <TabBar>
          Tab Bar
        </TabBar>
        */}
        <Board>
          Board
        </Board>
      </FlexContainer>
    </FlexContainer>
  );
}

export default observer(App);

