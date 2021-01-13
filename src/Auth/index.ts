import { createContext } from 'react';
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
  changeUserInMain,
  refreshAuthInOtherWindows,
} from 'mainProcess';
import { timeout } from 'utils';

export enum AuthError {
  // The error when the user sign out failed.
  // User is signed in and metadata may be present.
  FailedSigningOutUser = 'Failed signing out user',

  // The error when the user sign in failed.
  // User is not signed in and no metadata are present.
  FailedLoadingUser = 'Failed loading user',

  // The rror when the fetching of user's metadata failed after the user was successfuly signed in.
  // User was explicitly signed out and no metadata are present.
  FailedLoadingUserMetadata = 'Failed loading user metadata',
}

export enum AuthState {
  // The state when the app finds no signed in user during the initial check and the state when the sign in fails.
  // User is not signed in and no metadata are present. The error field may be populated by the AuthError.
  NoUser,

  // LOADING STATE
  // The initial state when the app starts and the state after user start the sign-in flow.
  // User is not signed in and no metadata are present.
  LoadingUser,

  // LOADING STATE
  // The state when the sign out was requested but was not completed yet.
  // User may be signed in and metadata may be present
  SigningOutUser,

  // LOADING STATE
  // The state when the user is signed in, but the app is still fetching user metadata.
  // User is signed in, but metadata are not fetched yet. 
  LoadingUserMetadata,

  // The state when the user is signed in and the metadata were successfuly fetched.
  // User is signed in and metadata are present.
  UserAndMetadataLoaded,
}

type FailedSignOutAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedSigningOutUser, metadata?: MagicUserMetadata };
type FailedLoadingAuthInfo = { state: AuthState.NoUser, error: AuthError };
type InitialAuthInfo = { state: AuthState.NoUser };
type SuccessfulAuthInfo = { state: AuthState.UserAndMetadataLoaded, metadata: MagicUserMetadata };
type LoadingUserAuthInfo = { state: AuthState.LoadingUser }
type LoadingUserMetadataAuthInfo = { state: AuthState.LoadingUserMetadata }
type SigningOutUserAuthInfo = { state: AuthState.SigningOutUser }

export type AuthInfo = FailedSignOutAuthInfo
  | FailedLoadingAuthInfo
  | InitialAuthInfo
  | SuccessfulAuthInfo
  | LoadingUserAuthInfo
  | LoadingUserMetadataAuthInfo
  | SigningOutUserAuthInfo;

export type { MagicUserMetadata };

export const authEmitter = new EventEmitter();

export let auth: AuthInfo = { state: AuthState.LoadingUser };
export const AuthContext = createContext<AuthInfo>(auth);

const url = isDev ? 'https://dev.usedevbook.com/auth' : 'https://api.usedevbook.com/auth';

const magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';
const magic = new Magic(magicAPIKey);

let signInCancelHandle: (() => void) | undefined = undefined;

refreshAuth();

function changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
  if (auth.state === AuthState.UserAndMetadataLoaded) {
    const email = auth?.metadata?.email || undefined;
    const userID = auth?.metadata?.publicAddress || undefined;
    changeUserInMain(userID && email ? { userID, email } : undefined);
  } if (auth.state === AuthState.NoUser) {
    changeUserInMain();
  }
}

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

function updateAuth(newAuth: AuthInfo) {
  auth = newAuth;
  authEmitter.emit('changed', auth);
  changeAnalyticsUserAndSaveEmail(auth);
}

export async function signOut() {
  const oldAuth = auth;
  updateAuth({ state: AuthState.SigningOutUser });
  try {
    await magic.user.logout();
    updateAuth({ state: AuthState.NoUser });
    refreshAuthInOtherWindows();
  } catch (error) {
    updateAuth(oldAuth);
    refreshAuthInOtherWindows();

    console.error(error.message);
  }
}

export function cancelSignIn() {
  signInCancelHandle?.();
}

async function syncUserMetadata(didToken: string) {
  updateAuth({ state: AuthState.LoadingUserMetadata });

  try {
    const metadata = await magic.user.getMetadata()

    updateAuth({ state: AuthState.UserAndMetadataLoaded, metadata });
    refreshAuthInOtherWindows();

    try {
      await axios.post(`${url}/user`, {
        didToken,
      });
    } catch (error) {
      console.error('Failed sending user metadata to the server', error.message);
    }

  } catch (error) {
    updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUserMetadata });
    refreshAuthInOtherWindows();

    console.error(error.message);

    signOut();
  }
}

export async function signIn(email: string) {
  cancelSignIn();

  updateAuth({ state: AuthState.LoadingUser });

  let rejectHandle: (reason?: any) => void;
  let isCancelled = false;

  const cancelableSignIn = new Promise<void>(async (resolve, reject) => {
    rejectHandle = reject;

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
      try {
        await axios.delete(`${url}/credential/${sessionID}`);
        updateAuth({ state: AuthState.NoUser });
        return reject({ message: 'Sign in was cancelled' });
      } catch (error) {
        console.error(error.message);
        updateAuth({ state: AuthState.NoUser });
        return reject({ message: 'Sign in could not be cancelled' });
      }
    }

    if (!credential && !isCancelled) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUser });
      return reject({ message: 'Getting credential for sign in timed out' });
    }

    try {
      const didToken = await magic.auth.loginWithCredential(credential);

      if (didToken) {
        updateAuth({ state: AuthState.LoadingUserMetadata });
        syncUserMetadata(didToken);
        return resolve();
      }

      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUser });
      return reject({ message: 'Could not complete the sign in' });
    } catch (error) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUser });
      return reject({ message: error.message });
    }
  });

  signInCancelHandle = () => {
    rejectHandle({ message: 'Sign in was cancelled' });
    isCancelled = true;
  };

  return cancelableSignIn;
}

export async function refreshAuth() {
  updateAuth({ state: AuthState.LoadingUser });

  try {
    const isUserSignedIn = await magic.user.isLoggedIn();

    if (!isUserSignedIn) {
      updateAuth({ state: AuthState.NoUser });
      return;
    }

    updateAuth({ state: AuthState.LoadingUserMetadata });

    try {
      const metadata = await magic.user.getMetadata();
      updateAuth({ state: AuthState.UserAndMetadataLoaded, metadata });

    } catch (error) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUserMetadata });
      refreshAuthInOtherWindows();

      console.error(error.message);

      signOut();
    }

  } catch (error) {
    updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLoadingUser });

    console.error(error.message);
  }
}
