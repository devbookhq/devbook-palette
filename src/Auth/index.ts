import { Magic, MagicUserMetadata } from 'magic-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';

import {
  crypto,
  querystring,
} from 'mainProcess/electron';
import {
  openLink,
} from 'mainProcess';

export const authState = new EventEmitter();

type UserState = { isUserLoading?: boolean, isUserSignedIn?: boolean };
type UserInfo = (MagicUserMetadata & UserState) | (Partial<MagicUserMetadata> & UserState);

export let user: UserInfo = { isUserLoading: true, isUserSignedIn: false };

authState.emit('changed', user);

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const magic = new Magic('pk_test_2AE829E9A03C1FA0');

const cancelSignInToken = axios.CancelToken.source();

let signInCanceled = false;

export async function cancelSignIn() {
  signInCanceled = true;
  cancelSignInToken.cancel();
}

export async function signOut() {
  await magic.user.logout();
  await checkUser();
}

export async function signIn(email: string = 'tomas@usedevbook.com') {
  signInCanceled = false;
  const url = 'https://dev.usedevbook.com/auth';
  // const url = 'http://localhost:3002/auth';

  const sessionID = generateSessionID();

  const params = querystring.encode({
    email,
  });

  openLink(`${url}/signin/${sessionID}?${params}`);

  let credential: string | undefined = undefined;

  while (!signInCanceled && !credential) {
    try {
      const result = await axios.get(`${url}/credential/${sessionID}`, {
        params: {
          email,
        },
        cancelToken: cancelSignInToken.token,
      });

      credential = result.data.credential;
      break;
    } catch (error) {
      if (error.response?.status !== 404) {
        signInCanceled = true;
        console.error(error);
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
    await checkUser();
  } catch (error) {
    console.error(error);
  }
}

async function checkUser() {
  const isUserSignedIn = await magic.user.isLoggedIn();
  user = {
    isUserSignedIn,
    ...isUserSignedIn && await magic.user.getMetadata(),
  };
  authState.emit('changed', user);
}

checkUser();
