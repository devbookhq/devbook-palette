import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import * as serviceWorker from 'serviceWorker';
import App from 'App';
import { authEmitter, AuthContext, auth } from 'Auth';
import { extensionsEmitter, ExtensionsContext, extensionsManager } from 'Extensions';

ReactDOM.render(
  <React.StrictMode>
    <AuthContext.Provider value={auth}>
      <ExtensionsContext.Provider value={extensionsManager}>
        <App />
      </ExtensionsContext.Provider>
    </AuthContext.Provider>
  </React.StrictMode>
  ,
  document.getElementById('root'),
);

extensionsEmitter.on('changed', (extensionsManager) => {
  ReactDOM.render(
    <React.StrictMode>
      <AuthContext.Provider value={auth}>
        <ExtensionsContext.Provider value={extensionsManager}>
          <App />
        </ExtensionsContext.Provider>
      </AuthContext.Provider>
    </React.StrictMode>
    ,
    document.getElementById('root'),
  );
});

authEmitter.on('changed', (authInfo) => {
  ReactDOM.render(
    <React.StrictMode>
      <AuthContext.Provider value={authInfo}>
        <ExtensionsContext.Provider value={extensionsManager}>
          <App />
        </ExtensionsContext.Provider>
      </AuthContext.Provider>
    </React.StrictMode>
    ,
    document.getElementById('root'),
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
