import { Magic, MagicUserMetadata } from 'magic-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';

import {
  crypto,
  querystring,
} from 'mainProcess/electron';
import {
  openLink,
  isDev,
  changeAnalyticsUser,
  refreshAuthInOtherWindows,
} from 'mainProcess';
import { timeout } from 'utils';

export type AuthInfo = { user?: MagicUserMetadata, isLoading?: boolean };
export type { MagicUserMetadata };

export const authState = new EventEmitter();
export let authInfo: AuthInfo = { isLoading: true };

const magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';
const magic = new Magic(magicAPIKey);

let signInCancelHandle: (() => void) | undefined = undefined;

authState.on('changed', (auth: AuthInfo) => {
  const userID = auth?.user?.publicAddress || undefined;
  // TODO: Test segment usedID aliasing again, with the whole sign-in flow
  // changeAnalyticsUser(userID);
});

refreshAuth();

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

export async function signOut() {
  try {
    await magic.user.logout();
    authInfo = { isLoading: false };
    authState.emit('changed', authInfo);
    refreshAuthInOtherWindows();

  } catch (error) {
    console.error(error);
  }
}

export function cancelSignIn() {
  signInCancelHandle?.();
}

export async function signIn(email: string) {
  cancelSignIn();

  let rejectHandle: (reason?: any) => void;
  let isCancelled = false;

  const cancelableSignIn = new Promise<void>(async (resolve, reject) => {
    rejectHandle = reject;

    const url = isDev ? 'https://dev.usedevbook.com/auth' : 'https://api.usedevbook.com/auth';

    const sessionID = generateSessionID();

    const params = querystring.encode({
      email,
      ...isDev && { test: 'true' },
    });

    await openLink(`${url}/signin/${sessionID}?${params}`);

    let credential: string | undefined = undefined;

    const requestLimit = 15 * 60;

    for (let i = 0; i < requestLimit; i++) {
      if (isCancelled) {
        break;
      }

      if (credential) {
        break;
      }

      try {
        const result = await axios.get(`${url}/credential/${sessionID}`, {
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
      return reject({ message: 'Sign in was cancelled' });
    }

    if (!credential && !isCancelled) {
      return reject({ message: 'Getting credential for sign in timed out' });
    }

    try {
      const didToken = await magic.auth.loginWithCredential(credential);
      const userMetadata = await magic.user.getMetadata()

      await axios.post(`${url}/signin`, {
        didToken,
      });

      authInfo = { user: userMetadata, isLoading: false };
      authState.emit('changed', authInfo);
      refreshAuthInOtherWindows();

    } catch (error) {
      console.error(error);
    }

    return resolve();
  });

  signInCancelHandle = () => {
    rejectHandle({ message: 'Sign in was cancelled' });
    isCancelled = true;
  };

  return cancelableSignIn;
}

export async function refreshAuth() {
  authInfo = { isLoading: true };
  authState.emit('changed', authInfo);

  try {
    const isUserSignedIn = await magic.user.isLoggedIn();
    if (isUserSignedIn) {
      authInfo = { user: await magic.user.getMetadata(), isLoading: false };
    } else {
      authInfo = { isLoading: false };
    }
  } catch (error) {
    authInfo = { isLoading: false };
  }
  authState.emit('changed', authInfo);
}
