import axios from 'axios';
import {
  makeAutoObservable,
} from 'mobx';

import timeout from 'utils/timeout';

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
  private static _instance: ReconnectionService;

  static get instance() {
    return ReconnectionService._instance || (ReconnectionService._instance = new ReconnectionService());
  }

  _isConnected = true;

  static get isConnected() {
    return ReconnectionService.instance._isConnected;
  }

  private contructor() {
    makeAutoObservable(this);
  }

  static reportDisconnection() {
    ReconnectionService.instance._isConnected = false;
  }

  static reportConnection() {
    ReconnectionService.instance._isConnected = true;
  }
}


export default ReconnectionService;
