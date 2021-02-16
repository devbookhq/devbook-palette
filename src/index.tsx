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

ReactDOM.render(
  <React.StrictMode>
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
  </React.StrictMode>
  ,
  document.getElementById('root'),
);

