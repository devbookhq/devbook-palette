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
import RootStore, { useRootStore } from 'App/RootStore';
import LocalCacheLayer from 'newsrc/layers/cache/localCacheLayer';
import AuthenticationLayer from 'services/authenticatin.service';

import { AuthInfo } from './authInfo';
import { AuthState } from './authState';
import { AuthErrorType } from './authError';

export function useUserStore() {
  return useRootStore().userStore;
}

class UserStore {
  readonly _authenticationLayer = new AuthenticationLayer();
  readonly _localCacheLayer = new LocalCacheLayer();
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

  constructor(readonly _rootStore: RootStore) {
    makeAutoObservable(this, {
      _rootStore: false,
      _authenticationLayer: false,
      _localCacheLayer: false,
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
    else this._auth.user = undefined;
    if (auth.error) this._auth.error = auth.error;
    else this._auth.user = undefined;
  }

  signOut() {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningOutUser, user: this.user });

    const refreshToken = this._localCacheLayer.loadRefreshToken();
    this._localCacheLayer.deleteRefreshToken();
    this.updateAuthEverywhere({ state: AuthState.NoUser });

    return this._authenticationLayer.signOut(refreshToken);
  }

  cancelSignIn() {
    this.updateAuthEverywhere({ state: AuthState.NoUser });
    return this._authenticationLayer.cancelSignIn();
  }

  async signIn(email: string) {
    if (this.isLoading) return;
    this.updateAuthEverywhere({ state: AuthState.SigningInUser });
    try {
      const { refreshToken, user } = await this._authenticationLayer.signIn(email);
      this._localCacheLayer.saveRefreshToken(refreshToken);
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
      const oldRefreshToken = this._localCacheLayer.loadRefreshToken();

      if (!oldRefreshToken) {
        const { refreshToken, user } = await this._authenticationLayer.restoreUserSession();
        this._localCacheLayer.saveRefreshToken(refreshToken);
        this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
        return;
      }

      const { refreshToken, user } = await this._authenticationLayer.refreshAccessToken(oldRefreshToken);
      this._localCacheLayer.saveRefreshToken(refreshToken);
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
