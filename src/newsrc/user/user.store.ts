import {
  autorun,
  toJS,
  makeAutoObservable,
} from 'mobx';
import { Magic } from 'magic-sdk';
import axios from 'axios';

import {
  changeUserInMain,
  setAuthInOtherWindows,
  handleGetAuthFromMainWindow,
} from './user.ipc';
import timeout from 'utils/timeout';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';
import { AuthInfo } from './authInfo';
import { AuthState } from './authState';
import { AuthError } from './authError';
import { User } from './user';
import {
  ElectronStore,
  querystring,
  openLink,
  isDev,
} from '../electronRemote';
import randomKey from '../utils/randomKey';

export function useUserStore() {
  return useRootStore().userStore;
}

enum APIVersion {
  v1 = 'v1',
}

const apiVersion = APIVersion.v1;

class UserStore {
  // private static baseURL = isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  baseURL = isDev ? 'http://localhost:3002' : 'https://api.usedevbook.com';
  magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';
  refreshTokenStoreName = 'refreshToken';

  magic = new Magic(this.magicAPIKey);
  electronStore = new ElectronStore();

  readonly auth: AuthInfo = { state: AuthState.NoUser, error: undefined, user: undefined };
  private signInCancelHandle: (() => void) | undefined = undefined;

  get isLoading() {
    return this.auth.state === AuthState.LookingForStoredUser ||
      this.auth.state === AuthState.SigningInUser ||
      this.auth.state === AuthState.SigningOutUser;
  }

  get state() {
    return this.auth.state;
  }

  get error() {
    return this.auth.error;
  }

  get user() {
    return this.auth.user;
  }

  get asJSON() {
    return toJS(this.auth);
  }

  constructor(private readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      baseURL: false,
      magic: false,
      magicAPIKey: false,
      refreshTokenStoreName: false,
      electronStore: false,
    });
    autorun(() => {
      console.log('Authentication:', this.asJSON);
    });

    handleGetAuthFromMainWindow(() => this.asJSON);
    this.refreshAuth();
  }

  private setRefreshToken(refreshToken: string) {
    return this.electronStore.set(this.refreshTokenStoreName, refreshToken);
  }

  private getRefreshToken(): string {
    return this.electronStore.get(this.refreshTokenStoreName);
  }

  private deleteRefreshToken() {
    return this.electronStore.delete(this.refreshTokenStoreName);
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
    const clone = toJS(auth);
    this.changeAnalyticsUserAndSaveEmail(clone);
    setAuthInOtherWindows(clone);
  }

  updateAuth(auth: AuthInfo) {
    this.auth.state = auth.state;
    if (auth.user) this.auth.user = auth.user;
    if (auth.error) this.auth.error = auth.error;
  }

  async signOut() {
    if (!this.user) {
      return;
    }
    this.updateAuthEverywhere({ state: AuthState.SigningOutUser, user: this.user });
    const refreshToken = this.getRefreshToken();
    this.deleteRefreshToken();
    this.updateAuthEverywhere({ state: AuthState.NoUser });
    try {
      await this.magic.user.logout();
    } catch (error) {
      console.error(error.message);
    }
    try {
      await axios.post('/auth/signOut', null, {
        baseURL: `${this.baseURL}/${apiVersion}`,
        params: {
          refreshToken,
        },
        withCredentials: true,
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  cancelSignIn() {
    this.signInCancelHandle?.();
  }

  signIn(email: string) {
    this.cancelSignIn();
    this.updateAuthEverywhere({ state: AuthState.SigningInUser });

    let rejectHandle: (reason?: any) => void;
    let isCancelled = false;

    const cancelableSignIn = new Promise<void>(async (resolve, reject) => {
      rejectHandle = reject;

      const sessionID = encodeURIComponent(randomKey());
      const params = querystring.encode({
        email,
        ...isDev && { test: 'true' },
      });

      // This route should NOT be "/auth/signIn" - "/auth/signin" is correct, because it uses the old API.
      await openLink(`${this.baseURL}/auth/signin/${sessionID}?${params}`);

      let credential: string | undefined = undefined;
      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) break;
        if (credential) break;

        try {
          const result = await axios.get(`/auth/credential/${sessionID}`, {
            baseURL: `${this.baseURL}/${apiVersion}`,
            params: {
              email,
            },
          });

          credential = result.data.credential;
          break;

        } catch (error) {
          if (error.response?.status !== 404) {
            break;
          }
        }
        await timeout(800);
      }

      if (isCancelled) {
        try {
          await axios.delete(`/auth/credential/${sessionID}`, {
            baseURL: `${this.baseURL}/${apiVersion}`,
          });
          return reject({ message: 'Sign in was cancelled' });
        } catch (error) {
          console.error(error.message);
          return reject({ message: 'Sign in could not be cancelled' });
        } finally {
          this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        }
      }

      if (!credential && !isCancelled) {
        this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: 'Getting credential for sign in timed out' });
      }

      try {
        const didToken = await this.magic.auth.loginWithCredential(credential);
        if (!didToken) {
          this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
          return reject({ message: 'Could not complete the sign in' });
        }

        const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
          baseURL: `${this.baseURL}/${apiVersion}`,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${didToken}`,
          },
        }) as { data: { user: User, refreshToken: string } };

        this.setRefreshToken(refreshToken);
        this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
        return resolve();
      } catch (error) {
        this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: error.message });
      }
    });

    this.signInCancelHandle = () => {
      rejectHandle({ message: 'Sign in was cancelled' });
      isCancelled = true;
    };

    return cancelableSignIn;
  }

  private async refreshAuth() {
    this.updateAuthEverywhere({ state: AuthState.LookingForStoredUser });
    try {
      const oldRefreshToken = this.getRefreshToken();
      if (!oldRefreshToken) {
        if (await this.magic.user.isLoggedIn()) {
          const didToken = await this.magic.user.getIdToken();
          const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
            baseURL: `${this.baseURL}/${apiVersion}`,
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${didToken}`,
            },
          }) as { data: { user: User, refreshToken: string } };
          this.setRefreshToken(refreshToken);
          this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
          return;
        }

        this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
        return;
      }
      const { data: { user, refreshToken } } = await axios.get('/auth/accessToken', {
        baseURL: `${this.baseURL}/${apiVersion}`,
        params: {
          refreshToken: oldRefreshToken,
        },
      }) as { data: { user: User, refreshToken: string } };

      this.updateAuthEverywhere({ state: AuthState.UserSignedIn, user });
      this.setRefreshToken(refreshToken);
    } catch (error) {
      this.updateAuthEverywhere({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
      console.error(error.message);
    }
  }
}

export default UserStore;
