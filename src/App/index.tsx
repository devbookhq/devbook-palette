import React from 'react';
import styled from 'styled-components';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import Onboarding from 'Onboarding';
import Preferences from 'Preferences';
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

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  function handleDragHeaderClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <>
      <DragHeader onClick={handleDragHeaderClick} />
      <Container>
        <Router>
          <Switch>
            <Route
              path="/onboarding"
              exact
            >
              <Onboarding />
            </Route>

            <Route
              path="/preferences"
            >
              <Preferences />
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
      </Container>
    </>
  );
}

export default App;
