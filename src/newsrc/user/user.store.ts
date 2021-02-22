import {
  autorun,
  makeAutoObservable,
} from 'mobx';
import { Magic } from 'magic-sdk';
import axios from 'axios';

import {
  crypto,
  querystring,
} from 'mainCommunication/electron';
import {
  openLink,
  isDev,
  changeUserInMain,
  setAuthInOtherWindows,
} from 'mainCommunication';
import timeout from 'utils/timeout';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';
import { AuthInfo } from './authInfo';
import { AuthState } from './authState';
import { AuthError } from './authError';
import { User } from './user';

import { ElectronStore } from './user.electron';

export function useUserStore() {
  return useRootStore().userStore;
}

const electronStore = new ElectronStore();
const refreshTokenStoreName = 'refreshToken';

function setRefreshToken(refreshToken: string) {
  return electronStore.set(refreshTokenStoreName, refreshToken);
}

function getRefreshToken(): string {
  return electronStore.get(refreshTokenStoreName);
}

function deleteRefreshToken() {
  return electronStore.delete(refreshTokenStoreName);
}

enum APIVersion {
  v1 = 'v1',
}

const apiVersion = APIVersion.v1;

class UserStore {
  // private static baseURL = isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  private static baseURL = isDev ? 'http://localhost:3002' : 'https://api.usedevbook.com';
  private static magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';

  private magic = new Magic(UserStore.magicAPIKey);

  auth: AuthInfo = { state: AuthState.LookingForStoredUser };
  private signInCancelHandle: (() => void) | undefined = undefined;

  constructor(private readonly rootStore: RootStore) {
    makeAutoObservable(this, {});
    autorun(() => {
      console.log(AuthState[this.auth.state]);
    });
  }

  private changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
    if (auth.state === AuthState.UserAndMetadataLoaded) {
      const email = auth?.user?.email || undefined;
      const userID = auth?.user?.userID || undefined;
      changeUserInMain(userID && email ? { userID, email } : undefined);
    } if (auth.state === AuthState.NoUser) {
      changeUserInMain();
    }
  }

  private generateSessionID() {
    return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
  };

  updateAuth(newAuth: AuthInfo) {
    this.auth = newAuth;
    this.changeAnalyticsUserAndSaveEmail(this.auth);
    setAuthInOtherWindows(this.auth);
  }

  async signOut() {
    this.updateAuth({ ...this.auth, state: AuthState.SigningOutUser });
    const refreshToken = getRefreshToken();
    deleteRefreshToken();
    this.updateAuth({ ...this.auth, state: AuthState.NoUser });
    try {
      await this.magic.user.logout();
      await axios.post('/auth/signOut', null, {
        baseURL: `${UserStore.baseURL}/${apiVersion}`,
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
    this.updateAuth({ state: AuthState.SigningInUser });

    let rejectHandle: (reason?: any) => void;
    let isCancelled = false;

    const cancelableSignIn = new Promise<void>(async (resolve, reject) => {
      rejectHandle = reject;

      const sessionID = this.generateSessionID();
      const params = querystring.encode({
        email,
        ...isDev && { test: 'true' },
      });

      // This route should NOT be "/auth/signIn" - "/auth/signin" is correct, because it uses the old API.
      await openLink(`${UserStore.baseURL}/auth/signin/${sessionID}?${params}`);

      let credential: string | undefined = undefined;
      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) break;
        if (credential) break;

        try {
          const result = await axios.get(`/auth/credential/${sessionID}`, {
            baseURL: `${UserStore.baseURL}/${apiVersion}`,
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
            baseURL: `${UserStore.baseURL}/${apiVersion}`,
          });
          this.updateAuth({ state: AuthState.NoUser });
          return reject({ message: 'Sign in was cancelled' });
        } catch (error) {
          console.error(error.message);
          this.updateAuth({ state: AuthState.NoUser });
          return reject({ message: 'Sign in could not be cancelled' });
        }
      }

      if (!credential && !isCancelled) {
        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: 'Getting credential for sign in timed out' });
      }

      try {
        const didToken = await this.magic.auth.loginWithCredential(credential);
        if (!didToken) {
          this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
          return reject({ message: 'Could not complete the sign in' });
        }

        const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
          baseURL: `${UserStore.baseURL}/${apiVersion}`,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${didToken}`,
          },
        }) as { data: { user: User, refreshToken: string } };

        setRefreshToken(refreshToken);
        this.updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
        return resolve();
      } catch (error) {
        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: error.message });
      }
    });

    this.signInCancelHandle = () => {
      rejectHandle({ message: 'Sign in was cancelled' });
      isCancelled = true;
    };

    return cancelableSignIn;
  }

  async refreshAuth() {
    this.updateAuth({ state: AuthState.LookingForStoredUser });
    try {
      const oldRefreshToken = getRefreshToken();
      if (!oldRefreshToken) {
        if (await this.magic.user.isLoggedIn()) {
          const didToken = await this.magic.user.getIdToken();
          const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
            baseURL: `${UserStore.baseURL}/${apiVersion}`,
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${didToken}`,
            },
          }) as { data: { user: User, refreshToken: string } };
          setRefreshToken(refreshToken);
          this.updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
          return;
        }

        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
        return;
      }
      const { data: { user, refreshToken } } = await axios.get('/auth/accessToken', {
        baseURL: `${UserStore.baseURL}/${apiVersion}`,
        params: {
          refreshToken: oldRefreshToken,
        },
      }) as { data: { user: User, refreshToken: string } };

      this.updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
      setRefreshToken(refreshToken);
    } catch (error) {
      this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
      console.error(error.message);
    }
  }
}

export default UserStore;
