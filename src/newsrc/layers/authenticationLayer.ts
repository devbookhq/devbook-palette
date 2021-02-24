import { Magic } from 'magic-sdk';
import axios from 'axios';

import timeout from 'utils/timeout';
import {
  querystring,
  openLink,
  isDev,
} from '../electronRemote';
import randomKey from '../utils/randomKey';
import { User } from '../user/user';

enum APIVersion {
  v1 = 'v1',
}

class AuthenticationLayer {
  private static readonly baseURL = isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  private static readonly apiVersion = APIVersion.v1;
  private static readonly baseURLWithVersion = `${AuthenticationLayer.baseURL}/${AuthenticationLayer.apiVersion}`;
  private static readonly magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';

  private readonly magic = new Magic(AuthenticationLayer.magicAPIKey);
  private signInCancelHandle: (() => void) | undefined = undefined;

  async signIn(email: string): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    this.cancelSignIn();

    let rejectHandle: (reason?: any) => void;
    let isCancelled = false;

    const cancelableSignIn = new Promise<{ user: User, refreshToken: string, accessToken: string }>(async (resolve, reject) => {
      rejectHandle = reject;

      const sessionID = encodeURIComponent(randomKey());
      const params = querystring.encode({
        email,
        ...isDev && { test: 'true' },
      });

      // This route should NOT be "/auth/signIn" - "/auth/signin" is correct, because it uses the old API.
      await openLink(`${AuthenticationLayer.baseURL}/auth/signin/${sessionID}?${params}`);

      let credential: string | undefined = undefined;
      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) break;
        if (credential) break;

        try {
          const result = await axios.get(`/auth/credential/${sessionID}`, {
            baseURL: AuthenticationLayer.baseURLWithVersion,
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
            baseURL: AuthenticationLayer.baseURLWithVersion,
          });
          return reject({ message: 'Sign in was cancelled.' });
        } catch (error) {
          return reject({ message: 'Sign in could not be cancelled.' });
        }
      }

      if (!credential && !isCancelled) {
        return reject({ message: 'Getting credential for sign in timed out.' });
      }

      try {
        const didToken = await this.magic.auth.loginWithCredential(credential);
        if (!didToken) {
          return reject({ message: 'Could not complete the sign in.' });
        }

        const { data } = await axios.post('/auth/signIn', null, {
          baseURL: AuthenticationLayer.baseURLWithVersion,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${didToken}`,
          },
        });
        return resolve(data);
      } catch (error) {
        return reject({ message: error.message });
      }
    });

    this.signInCancelHandle = () => {
      rejectHandle({ message: 'Sign in was cancelled.' });
      isCancelled = true;
    };

    return cancelableSignIn;
  }

  async signOut(refreshToken?: string) {
    try {
      await this.magic.user.logout();
    } catch (error) {
      console.error(error.message);
    }

    try {
      await axios.post('/auth/signOut', null, {
        baseURL: AuthenticationLayer.baseURLWithVersion,
        params: {
          refreshToken,
        },
        withCredentials: true,
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  async cancelSignIn() {
    this.signInCancelHandle?.();
  }

  async refreshAccessToken(oldRefreshToken: string): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    const { data } = await axios.get('/auth/accessToken', {
      baseURL: AuthenticationLayer.baseURLWithVersion,
      params: {
        refreshToken: oldRefreshToken,
      },
    });
    return data;
  }

  async restoreUserSession(): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    if (await this.magic.user.isLoggedIn()) {
      const didToken = await this.magic.user.getIdToken();
      const { data } = await axios.post('/auth/signIn', null, {
        baseURL: AuthenticationLayer.baseURLWithVersion,
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${didToken}`,
        },
      });
      return data;
    }
    throw new Error('No user session found.');
  }
}

export default AuthenticationLayer;
