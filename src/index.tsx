import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import { notifyViewReady, } from './mainProcess';
import * as serviceWorker from './serviceWorker';
import App from './App';
import { authState } from 'Auth';

authState.on('changed', (user) => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
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
