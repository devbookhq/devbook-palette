import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
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
            path="/"
            exact
          >
            <Redirect to="/app"/>
          </Route>
          <Route
            path="/app"
          >
            <App />
          </Route>
          <Route
            path="/preferences"
          >
          </Route>
        </Switch>
      </Router>
    </RootStoreProvider>
  </React.StrictMode>
  ,
  document.getElementById('root'),
);
