import { autorun, makeAutoObservable, runInAction } from 'mobx';
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

export function useUserStore() {
  return useRootStore().userStore;
}

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
      const email = auth?.metadata?.email || undefined;
      const userID = auth?.metadata?.publicAddress || undefined;
      changeUserInMain(userID && email ? { userID, email } : undefined);
    } if (auth.state === AuthState.NoUser) {
      changeUserInMain();
    }
  }

  private generateSessionID() {
    return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
  };

  updateAuth(newAuth: AuthInfo) {
    runInAction(() => {
      this.auth = newAuth;
    });
    // this.changeAnalyticsUserAndSaveEmail({ ...this.auth });
    // setAuthInOtherWindows({ ...this.auth });
  }

  private async signOut() {
    const oldAuth = this.auth;
    this.updateAuth({ ...this.auth, state: AuthState.SigningOutUser });
    try {
      await this.magic.user.logout();
      this.updateAuth({ ...this.auth, state: AuthState.NoUser });
    } catch (error) {
      this.updateAuth(oldAuth);
      console.error(error.message);
    }
  }

  cancelSignIn() {
    this.signInCancelHandle?.();
  }

  private async syncUserMetadata(didToken: string) {
    this.updateAuth({ state: AuthState.FetchingUserMetadata });

    try {
      const metadata = await this.magic.user.getMetadata()
      this.updateAuth({
        state: AuthState.UserAndMetadataLoaded, metadata: {
          publicAddress: metadata.publicAddress,
          email: metadata.email,
          issuer: metadata.issuer,
        },
      });
      try {
        await axios.post(`${UserStore.baseURL}/auth/user`, {
          didToken,
        });
      } catch (error) {
        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        console.error('Failed sending user metadata to the server', error.message);
        this.signOut();
        return;
      }
    } catch (error) {
      this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedFetchingUserMetadata });
      this.signOut();
      console.error(error.message);
    }
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

      await openLink(`${UserStore.baseURL}/auth/signin/${sessionID}?${params}`);
      let credential: string | undefined = undefined;
      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) break;
        if (credential) break;

        try {
          const result = await axios.get(`${UserStore.baseURL}/auth/credential/${sessionID}`, {
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
        await timeout(1000);
      }

      if (isCancelled) {
        try {
          await axios.delete(`${UserStore.baseURL}/auth/credential/${sessionID}`);
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

        if (didToken) {
          this.updateAuth({ state: AuthState.FetchingUserMetadata });
          this.syncUserMetadata(didToken);
          return resolve();
        }

        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: 'Could not complete the sign in' });
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
      const isUserSignedIn = await this.magic.user.isLoggedIn();
      if (!isUserSignedIn) {
        this.updateAuth({ state: AuthState.NoUser });
        return;
      }

      this.updateAuth({ state: AuthState.FetchingUserMetadata });

      try {
        const metadata = await this.magic.user.getMetadata();
        this.updateAuth({ state: AuthState.UserAndMetadataLoaded, metadata });
      } catch (error) {
        this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedFetchingUserMetadata });
        this.signOut();
        console.error(error.message);
      }

    } catch (error) {
      this.updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
      console.error(error.message);
    }
  }
}

export default UserStore;
