import React, { useState, useEffect } from 'react';
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
import useLatestBundle from 'hooks/useLatestBundle';

// The electron window is set to be frameless.
// Frameless window stops being draggable - this is the solution.
const DragHeader = styled.div`
  position: absolute;
  left: 5px;
  top: 2px;
  height: 25px;
  width: calc(100% - 10px);
  background: transparent;
  -webkit-app-region: drag;
  -webkit-user-select: none;
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

  useLatestBundle(({ bundle, error }) => {
    console.log('Bundle', bundle);
    console.log('Error', error);
  }, '0.1.14', 1000);

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
