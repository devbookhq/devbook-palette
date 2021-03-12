import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';

import TabBar from 'newsrc/TabBar';
import Board from 'newsrc/Board';
import SignIn from 'newsrc/SignIn';


// The electron window is set to be frameless.
// Frameless window stops being draggable - this is the solution.
const DragHeader = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 25px;
  width: 100%;
  background: transparent;
  -webkit-app-region: drag;
  -webkit-user-select: none;
`;

const FlexContainer = styled.div<{ direction?: 'row' | 'column' }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: ${props => props.direction ? props.direction : 'row'};
`;

function App() {
  const { path } = useRouteMatch();

  return (
    <>
      <DragHeader/>
      <Switch>
        <Route
          path={path}
          exact
        >
          <FlexContainer direction="column">
            <TabBar/>
            <Board/>
          </FlexContainer>
        </Route>
        <Route
          path={`${path}/sign-in`}
        >
          <SignIn/>
        </Route>
      </Switch>
   </>
  );
}

export default App;

