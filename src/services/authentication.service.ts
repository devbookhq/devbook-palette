import { Magic } from 'magic-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import timeout from 'utils/timeout';
import ElectronService from './electron.service';
import { APIVersion } from 'services/api.service';
import { User } from 'user/user';

const CredentialPingPeriod = 100; // In ms. We ping server every N ms.

class AuthenticationService {
  private constructor() { }
  private static readonly baseURL = ElectronService.isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';
  private static readonly apiVersion = APIVersion.v1;
  private static readonly baseURLWithVersion = `${AuthenticationService.baseURL}/${AuthenticationService.apiVersion}`;
  private static readonly magicAPIKey = ElectronService.isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';

  private static readonly magic = new Magic(AuthenticationService.magicAPIKey);
  private static signInCancelHandle: (() => void) | undefined = undefined;

  private static randomKey() {
    const key = uuidv4();
  }

  static async signIn(email: string): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    AuthenticationService.cancelSignIn();

    let rejectHandle: (reason?: any) => void;
    let isCancelled = false;

    const cancelableSignIn = new Promise<{ user: User, refreshToken: string, accessToken: string }>(async (resolve, reject) => {
      rejectHandle = reject;

      const sessionID = encodeURIComponent(uuidv4());

      const params = new URLSearchParams({
        email,
        ...ElectronService.isDev && { test: 'true' },
      }).toString();

      // This route should NOT be "/auth/signIn" - "/auth/signin" is correct because it uses the old API.
      await ElectronService.openLink(`${AuthenticationService.baseURL}/auth/signin/${sessionID}?${params}`);

      let credential: string | undefined = undefined;
      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) break;
        if (credential) break;

        try {
          const result = await axios.get(`/auth/credential/${sessionID}`, {
            baseURL: AuthenticationService.baseURLWithVersion,
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
        await timeout(CredentialPingPeriod);
      }

      if (isCancelled) {
        try {
          await axios.delete(`/auth/credential/${sessionID}`, {
            baseURL: AuthenticationService.baseURLWithVersion,
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
          return reject({ message: 'Could not complete the sign in. Returned token was undefined.' });
        }

        const { data } = await axios.post('/auth/signIn', null, {
          baseURL: AuthenticationService.baseURLWithVersion,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${didToken}`,
          },
        });
        return resolve(data);
      } catch (error) {
        return reject({ message: error.response.data.error.message });
      }
    });

    AuthenticationService.signInCancelHandle = () => {
      rejectHandle({ message: 'Sign in was cancelled.' });
      isCancelled = true;
    };

    return cancelableSignIn;
  }

  static async signOut(refreshToken?: string) {
    try {
      await this.magic.user.logout();
    } catch (error) {
      console.error(error.message);
    }

    try {
      await axios.post('/auth/signOut', null, {
        baseURL: AuthenticationService.baseURLWithVersion,
        params: {
          refreshToken,
        },
        withCredentials: true,
      });
    } catch (error) {
      console.error(error.response.data.error.message);
    }
  }

  static async cancelSignIn() {
    this.signInCancelHandle?.();
  }

  static async refreshAccessToken(oldRefreshToken: string): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    try {
      const { data } = await axios.get('/auth/accessToken', {
        baseURL: AuthenticationService.baseURLWithVersion,
        params: {
          refreshToken: oldRefreshToken,
        },
      });
      return data;
    } catch (error) {
      throw new Error(error.response.data.error.message);
    }
  }

  static async restoreUserSession(): Promise<{ user: User, refreshToken: string, accessToken: string }> {
    if (await this.magic.user.isLoggedIn()) {
      const didToken = await this.magic.user.getIdToken();
      const { data } = await axios.post('/auth/signIn', null, {
        baseURL: AuthenticationService.baseURLWithVersion,
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${didToken}`,
        },
      });
      return data;
    }
    throw new Error(`Couldn't restore a previous user session. No user session found.`);
  }
}

export default AuthenticationService;
