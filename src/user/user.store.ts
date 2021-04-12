import {
  toJS,
  makeAutoObservable,
} from 'mobx';
import axios from 'axios';

import { useRootStore } from 'App/RootStore';
import SyncService, { StorageKey } from 'services/sync.service';
import AuthenticationService from 'services/authentication.service';

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
    this._isConnected = false;
  }

  reportConnection() {
    this._isConnected = true;
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
        await timeout(1000);
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

    IPCService.on(IPCOnChannel.SignOut, () =>
      this.signOut()
    );

    this.refreshAuth();
  }

  private changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
    switch (auth.state) {
      case AuthState.UserSignedIn:
        return IPCService.send(IPCSendChannel.ChangeUserInMain, { user: auth.user });
      case AuthState.NoUser:
        return IPCService.send(IPCSendChannel.ChangeUserInMain, { user: undefined });
      default:
        break;
    }
  }

  private updateAuthEverywhere(auth: AuthInfo) {
    this.updateAuth(auth);
    this.changeAnalyticsUserAndSaveEmail(auth);
    IPCService.send(IPCSendChannel.SetAuthInOtherWindows, { auth });
  }

  updateAuth(auth: AuthInfo) {
    this._auth.state = auth.state;
    this._auth.user = auth.user;
    this._auth.error = auth.error;
  }

  async signOut() {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningOutUser, user: this.user });

    const refreshToken = await SyncService.get(StorageKey.RefreshToken);
    SyncService.set(StorageKey.RefreshToken, '');
    this.updateAuthEverywhere({ state: AuthState.NoUser });

    return AuthenticationService.signOut(refreshToken);
  }

  cancelSignIn() {
    this.updateAuthEverywhere({ state: AuthState.NoUser });
    return AuthenticationService.cancelSignIn();
  }

  async signIn(email: string) {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningInUser });
    try {
      const { refreshToken, user } = await AuthenticationService.signIn(email);
      SyncService.set(StorageKey.RefreshToken, refreshToken);
      this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
    } catch (error) {
      this.updateAuthEverywhere({
        state: AuthState.NoUser,
        error: {
          type: AuthErrorType.FailedSigningInUser,
          message: error.message,
        },
      });
    }
  }

  private async refreshAuth() {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.LookingForStoredUser });

    try {
      const oldRefreshToken = await SyncService.get(StorageKey.RefreshToken);

      if (!oldRefreshToken) {
        const { refreshToken, user } = await AuthenticationService.restoreUserSession();
        SyncService.set(StorageKey.RefreshToken, refreshToken);
        this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
        return;
      }

      const { refreshToken, user } = await AuthenticationService.refreshAccessToken(oldRefreshToken);
      SyncService.set(StorageKey.RefreshToken, refreshToken);
      this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
    } catch (error) {
      this.updateAuthEverywhere({
        state: AuthState.NoUser,
        error: {
          type: AuthErrorType.FailedLookingForStoredUser,
          message: error.message,
        },
      });
    }
  }
}

export default UserStore;
