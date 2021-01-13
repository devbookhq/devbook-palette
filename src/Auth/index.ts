import { Magic, MagicUserMetadata } from 'magic-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';

import {
  crypto,
  querystring,
} from 'mainProcess/electron';
import {
  openLink,
  refreshAuthInOtherWindows,
} from 'mainProcess';

export const authState = new EventEmitter();

export type AuthInfo = { user?: MagicUserMetadata, isLoading?: boolean };

export type { MagicUserMetadata };

export let authInfo: AuthInfo = { isLoading: true };

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const magic = new Magic('pk_test_2AE829E9A03C1FA0');

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

export async function signIn(email: string) {
  const url = 'https://dev.usedevbook.com/auth';
  // const url = 'http://localhost:3002/auth';

  const sessionID = generateSessionID();

  const params = querystring.encode({
    email,
  });

  await openLink(`${url}/signin/${sessionID}?${params}`);

  let credential: string | undefined = undefined;

  while (!credential) {
    try {
      const result = await axios.get(`${url}/credential/${sessionID}`, {
        params: {
          email,
        },
      });

      credential = result.data.credential;
      break;
    } catch (error) {
      if (error.response?.status === 500) {
        throw new Error('Sign-in session expired');
      }

      if (error.response?.status !== 404) {
        // console.error(error);
        break;
      }

    }
    await timeout(1200);
  }

  if (!credential) {
    return;
  }

  try {
    const didToken = await magic.auth.loginWithCredential(credential);
    const userMetadata = await magic.user.getMetadata()
    console.log('public address', userMetadata.publicAddress);

    await axios.post(`${url}/signin`, {
      didToken,
    });

    // await aliasAnalyticsUser(userMetadata.publicAddress);

    authInfo = { user: userMetadata, isLoading: false };
    authState.emit('changed', authInfo);
    refreshAuthInOtherWindows();

  } catch (error) {
    console.error(error);
  }
}

export async function refreshAuth() {
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

refreshAuth();
