import React from 'react';
import styled from 'styled-components';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { hideMainWindow } from 'mainProcess';
import Onboarding from 'Onboarding';
import Home from 'Home';

// The electron window is set to be frameless.
// Frameless window stops being draggable - this is the solution.
const DragHeader = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 15px;
  width: 100%;
  background: transparent;
  -webkit-app-region: drag;
  -webkit-user-select: non: el.values[0],;
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AppDiv = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
`;

function App() {
  useHotkeys('esc', () => hideMainWindow());

  return (
    <AppDiv>
      <DragHeader />
      <Content>
        <Router>
          <Switch>
            <Route
              path="/onboarding"
              exact
            >
              <Onboarding />
            </Route>

            <Route
              path="/"
              exact
            >
              <Redirect to={{ pathname: "/home" }} />
            </Route>

            <Route
              path="/home"
            >
              <Home />
            </Route>
          </Switch>
        </Router>
      </Content>
    </AppDiv>
  );
}

export default App;

