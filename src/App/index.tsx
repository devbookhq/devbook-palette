import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import electron, { isDev, reloadMainWindow } from 'mainCommunication';
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

const NewBundleNotif = styled.div`
  padding: 8px;
  position: absolute;
  bottom: 56px;
  right: 16px;
  z-index: 100;

  display: flex;
  flex-direction: column;
  align-items: center;

  font-size: 13px;

  box-shadow: 0 0 16px rgba(0, 0, 0, 0.2);
  background: black;
`;

const DismissNotif = styled.div`
  font-size: 13px;
  :hover {
    cursor: pointer;
  }
`;

const ReloadApp = styled.div`
  font-size: 13px;
  :hover {
    cursor: pointer;
  }
`;

function App() {
  //const bundleCheckInterval = 1000 * 60 * 10 // 10 minutes.
  const bundleCheckInterval = 1000 * 10
  const appVersion = electron.remote.app.getVersion();
  const clientBundle = document.getElementById('bundle')?.textContent;

  const [isNewBundleAvailable, setIsNewBundleAvailable] = useState(false);
  const [didUserDismissNotif, setDidUserDismissNotif] = useState(false);

  const [availableBundle, setAvailableBundle] = useState('');

  function handleDragHeaderClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleReloadClick() {
    // TODO: Track analytics.
    reloadMainWindow();
  }

  function handleDismissClick() {
    // TODO: Track analytics.
    setDidUserDismissNotif(true);
  }

  useLatestBundle(({ bundle: latestBundle, error }) => {
    if (error) {
      // TODO: Handle.
      console.error(error);
    } else if (latestBundle) {
      console.log('Client bundle', clientBundle);
      console.log('Latest available bundle', latestBundle);
      setAvailableBundle(latestBundle)
      setIsNewBundleAvailable(clientBundle !== latestBundle);
    } else {
      // TODO: Handle.
      console.error('Both error and bundle are undefined. Should not happen.');
    }
  }, appVersion, bundleCheckInterval, [clientBundle]);

  return (
    <>
      <h3>Hello {clientBundle}</h3>
      {isNewBundleAvailable && !didUserDismissNotif &&
        <NewBundleNotif>
          New Bundle Available ({availableBundle}). Reload.
          <DismissNotif onClick={handleDismissClick}>
           Dismiss
          </DismissNotif>
          <ReloadApp onClick={handleReloadClick}>
            Relaod
          </ReloadApp>
        </NewBundleNotif>
      }
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
