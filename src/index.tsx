import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import './index.css';
import App from './newsrc/App';
import { RootStoreProvider } from './newsrc/App/RootStore';
import { extensionsEmitter, ExtensionsContext } from 'Extensions';


extensionsEmitter.on('changed', (extensionsManager) => {
  ReactDOM.render(
    <React.StrictMode>
      <ExtensionsContext.Provider value={extensionsManager}>
        <RootStoreProvider>
          <Router>
            <Switch>
              <Route
                path="/preferences"
                exact
              >
              </Route>
              <Route
                path="/"
                exact
              >
                <App/>
              </Route>
            </Switch>
          </Router>
        </RootStoreProvider>
      </ExtensionsContext.Provider>
    </React.StrictMode>
    ,
    document.getElementById('root'),
  );
});

