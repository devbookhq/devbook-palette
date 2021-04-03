import axios from 'axios';
import {
  makeAutoObservable,
} from 'mobx';

import timeout from '../utils/timeout';

// Handle unreachable server by waiting a trying the request again.
axios.interceptors.response.use((value) => {
  ReconnectionService.reportConnection();
  return Promise.resolve(value);
}, async (error) => {
  if (error.response) {
    ReconnectionService.reportConnection();
    return Promise.reject(error);
  }

  if (error.request) {
    ReconnectionService.reportDisconnection();
    await timeout(1000);
    return await axios.request(error.config);
  }
  return Promise.reject(error);
});

class ReconnectionService {
  static _isConnected = false;

  static get isConnected() {
    return ReconnectionService._isConnected;
  }

  static reportDisconnection() {
    this._isConnected = false;
  }

  static reportConnection() {
    this._isConnected = true;
  }
}

makeAutoObservable(ReconnectionService, {
  isConnected: false,
  reportConnection: false,
  reportDisconnection: false,
});

export default ReconnectionService;
