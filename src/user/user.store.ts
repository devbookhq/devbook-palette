import {
  toJS,
  makeAutoObservable,
} from 'mobx';
import axios from 'axios';

import { useRootStore } from 'App/RootStore';
import SyncService, { StorageKey } from 'services/sync.service';

import { AuthInfo } from './authInfo';
import { AuthState } from './authState';
import { AuthErrorType } from './authError';
import IPCService, { IPCOnChannel, IPCSendChannel } from 'services/ipc.service';

import timeout from 'utils/timeout';

export function useUserStore() {
  return useRootStore().userStore;
}

class UserStore {
  readonly _auth: AuthInfo = { state: AuthState.NoUser, error: undefined, user: undefined };

  get isLoading() {
    return this._auth.state === AuthState.LookingForStoredUser ||
      this._auth.state === AuthState.SigningInUser ||
      this._auth.state === AuthState.SigningOutUser;
  }

  get state() {
    return this._auth.state;
  }

  get error() {
    return this._auth.error;
  }

  get user() {
    return toJS(this._auth.user);
  }

  get auth() {
    return toJS(this._auth);
  }

  get isSignedIn() {
    return this._auth.state === AuthState.UserSignedIn;
  }

  _isConnected = true;

  get isReconnecting() {
    return !this._isConnected;
  }

  reportDisconnection() {
    if (this._isConnected) this._isConnected = false;
  }

  reportConnection() {
    if (!this._isConnected) this._isConnected = true;
  }

  constructor() {
    makeAutoObservable(this);

    // Handle unreachable server by waiting and trying the request again.
    // We may want to move this into a separate store, because if affects all axios requests.
    axios.interceptors.response.use((value) => {
      this.reportConnection();
      return Promise.resolve(value);
    }, async (error) => {
      if (error.response) {
        this.reportConnection();
        return Promise.reject(error);
      }

      if (error.request) {
        this.reportDisconnection();
        await timeout(2500);
        return await axios.request(error.config);
      }
      return Promise.reject(error);
    });

    IPCService.on(IPCOnChannel.GetAuthFromMainWindow, () =>
      IPCService.send(IPCSendChannel.SetAuthInOtherWindows, { auth: this.auth })
    );

    IPCService.on(IPCOnChannel.SetAuthInOtherWindows, (_, { auth }) =>
      this.updateAuth(auth)
    );
  }

  updateAuth(auth: AuthInfo) {
    this._auth.state = auth.state;
    this._auth.user = auth.user;
    this._auth.error = auth.error;
  }
}

export default UserStore;
