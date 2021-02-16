import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { Resizable } from 're-resizable';

import { useUIStore } from 'newsrc/ui/ui.store';
import * as Colors from 'newsrc/ui/colors';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: ${() => Colors.Charcoal.normal};
  border-right: 1px solid ${() => Colors.Charcoal.lighter}
`;

function Toolbar() {
  const uiStore = useUIStore();

  function saveToolbarWidth(width: number) {
    uiStore.toolbarWidth = width;
  }
  return (
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
    <Container>
      Toolbar
    </Container>
    </Resizable>
  );
}

export default observer(Toolbar);

