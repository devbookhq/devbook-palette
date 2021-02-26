import {
  autorun,
  toJS,
  makeAutoObservable,
} from 'mobx';

import {
  changeUserInMain,
  setAuthInOtherWindows,
  handleGetAuthFromMainWindow,
} from './user.ipc';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';
import { AuthInfo } from './authInfo';
import { AuthState } from './authState';
import { AuthError } from './authError';
import LocalStorageLayer from '../layers/localStorageLayer';
import AuthenticationLayer from '../layers/authenticationLayer';

export function useUserStore() {
  return useRootStore().userStore;
}

class UserStore {
  readonly _authenticationLayer = new AuthenticationLayer();
  readonly _localStorageLayer = new LocalStorageLayer();
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

  constructor(readonly _rootStore: RootStore) {
    makeAutoObservable(this, {
      _rootStore: false,
      _authenticationLayer: false,
      _localStorageLayer: false,
    });

    autorun(() => {
      console.log('Authentication:', this.auth);
    });

    handleGetAuthFromMainWindow(() => this.auth);

    this.refreshAuth();
  }

  private changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
    switch (auth.state) {
      case AuthState.UserSignedIn:
        return changeUserInMain(auth.user);
      case AuthState.NoUser:
        return changeUserInMain();
      default:
        break;
    }
  }

  private updateAuthEverywhere(auth: AuthInfo) {
    this.updateAuth(auth);
    this.changeAnalyticsUserAndSaveEmail(this.auth);
    setAuthInOtherWindows(this.auth);
  }

  updateAuth(auth: AuthInfo) {
    this._auth.state = auth.state;
    if (auth.user) this._auth.user = auth.user;
    if (auth.error) this._auth.error = auth.error;
  }

  async signOut() {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningOutUser, user: this.user });
    const refreshToken = await this._localStorageLayer.loadRefreshToken();
    await this._localStorageLayer.deleteRefreshToken();
    this.updateAuthEverywhere({ state: AuthState.NoUser });
    return this._authenticationLayer.signOut(refreshToken);
  }

  async cancelSignIn() {
    this.updateAuthEverywhere({ state: AuthState.NoUser });
    return this._authenticationLayer.cancelSignIn();
  }

  async signIn(email: string) {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningInUser });
    try {
      const { refreshToken, user } = await this._authenticationLayer.signIn(email);
      await this._localStorageLayer.saveRefreshToken(refreshToken);
      this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
    } catch (error) {
      this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
    }
  }

  private async refreshAuth() {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.LookingForStoredUser });
    try {
      const oldRefreshToken = await this._localStorageLayer.loadRefreshToken();

      if (!oldRefreshToken) {
        const { refreshToken, user } = await this._authenticationLayer.restoreUserSession();
        await this._localStorageLayer.saveRefreshToken(refreshToken);
        this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
        return;
      }

      const { refreshToken, user } = await this._authenticationLayer.refreshAccessToken(oldRefreshToken);
      await this._localStorageLayer.saveRefreshToken(refreshToken);
      this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
    } catch (error) {
      this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
    }
  }
}

export default UserStore;
