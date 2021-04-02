import axios from 'axios';
import {
  makeAutoObservable,
} from 'mobx';

import timeout from '../utils/timeout';

// Handle unreachable server by waiting a trying the request again.
axios.interceptors.response.use((value) => {
  ReconnectionService.signalConnected();
  return Promise.resolve(value);
}, async (error) => {
  if (error.response) {
    ReconnectionService.signalConnected();
    return Promise.reject(error);
  }

  if (error.request) {
    ReconnectionService.signalDisconnected();
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

  static signalDisconnected() {
    this._isConnected = false;
  }

  static signalConnected() {
    this._isConnected = true;
  }
}

makeAutoObservable(ReconnectionService, {
  isConnected: false,
  signalConnected: false,
  signalDisconnected: false,
});

export default ReconnectionService;
