import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import { notifyViewReady, } from 'mainCommunication';
import * as serviceWorker from 'serviceWorker';
import App from 'App';
import { RootStoreProvider } from './App/RootStore';
import { authEmitter, AuthContext, auth } from 'Auth';

ReactDOM.render(
  <React.StrictMode>
    <RootStoreProvider>
      <AuthContext.Provider value={auth}>
        <App />
      </AuthContext.Provider>
    </RootStoreProvider>
  </React.StrictMode>
  ,
  document.getElementById('root'),
);

authEmitter.on('changed', (authInfo) => {
  ReactDOM.render(
    <React.StrictMode>
      <RootStoreProvider>
        <AuthContext.Provider value={authInfo}>
          <App />
        </AuthContext.Provider>
      </RootStoreProvider>
    </React.StrictMode>
    ,
    document.getElementById('root'),
  );
});

notifyViewReady();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
