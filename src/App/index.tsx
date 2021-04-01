import { useState } from 'react';
import styled from 'styled-components';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import electron, {
  reloadMainWindow,
  trackDismissBundleUpdate,
  trackPerformBundleUpdate,
} from 'mainCommunication';
import Onboarding from 'Onboarding';
import Preferences from 'Preferences';
import Home from 'Home';
import useLatestBundle from 'hooks/useLatestBundle';
import { SearchSource } from 'Search';

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
  right: 10px;
  z-index: 100;

  display: flex;
  flex-direction: column;
  align-items: center;

  font-size: 13px;
  color: #fff;

  background: #25252E;
  border: 1px solid #3A41AF;
  border-radius: 4px;
  box-shadow: 0 0 16px 10px rgba(0, 0, 0, 0.3);
`;

const NotifButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotifButton = styled.button`
  padding: 6px;
  margin-top: 16px;

  font-size: 14px;

  border-radius: 4px;
  border: 1px solid #3B3A4A;
  background: transparent;

  :hover {
    cursor: pointer;
  }
`;

const DismissButton = styled(NotifButton)`
  margin-right: 16px;
  color: #9CACC5;
`;

const ReloadButton = styled(NotifButton)`
  color: #fff;
`;

function App() {
  const bundleCheckInterval = 1000 * 60 * 60 * 1 // 1 hour.
  const appVersion = electron.remote.app.getVersion();
  const clientBundle = document.getElementById('bundle')?.textContent;

  const [dismissTime, setDismissTime] = useState(0) // When user presses 'dismiss' we shouldn't display notif for some time.
  const [isNewBundleAvailable, setIsNewBundleAvailable] = useState(false);

  const [availableBundle, setAvailableBundle] = useState('');

  function handleDragHeaderClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleReloadClick() {
    trackPerformBundleUpdate();
    reloadMainWindow();
  }

  function handleDismissClick() {
    trackDismissBundleUpdate();
    setDismissTime(1000 * 60 * 60 * 4); // 4 hours.
    setIsNewBundleAvailable(false);
  }

  // We have to use window.location because React Router's location is accessible
  // from components that are children of the Router. App isn't.
  function isOnHomePath() {
    const url = new URL(window.location.href);
    return url.hash === '#/home';
  }

  useLatestBundle(({ bundle: latestBundle, error }) => {
    if (error) {
      console.error(error);
    } else if (latestBundle) {
      console.log('Current client bundle', clientBundle);
      console.log('Latest available bundle', latestBundle);
      setAvailableBundle(latestBundle)
      setIsNewBundleAvailable(clientBundle !== latestBundle);
    } else {
      console.error('Both error and bundle are undefined. This should not happen!');
    }
  }, appVersion, bundleCheckInterval + dismissTime, [clientBundle]);

  return (
    <>
      {isNewBundleAvailable && isOnHomePath() &&
        <NewBundleNotif>
          New update available (v{appVersion}-{availableBundle})
          <NotifButtons>
            <DismissButton onClick={handleDismissClick}>
             Dismiss
            </DismissButton>
            <ReloadButton onClick={handleReloadClick}>
              Reload
            </ReloadButton>
          </NotifButtons>
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
              <Redirect to={{ pathname: `/home/search/${SearchSource.Stack}` }} />
            </Route>

            <Route
              path="/home/search"
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
