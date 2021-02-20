import { createContext } from 'react';
import { Magic, MagicUserMetadata } from 'magic-sdk';
import axios from 'axios';
import { EventEmitter } from 'events';

import {
  crypto,
  querystring,
  ElectronStore,
} from 'mainCommunication/electron';
import {
  openLink,
  isDev,
  changeUserInMain,
  setAuthInOtherWindows,
} from 'mainCommunication';
import timeout from 'utils/timeout';

export enum AuthError {
  // The error when the looking for a valid stored user failed - probably because of the network connection.
  // User is no signed in and no metadata are present.
  FailedLookingForStoredUser = 'Failed looking for stored user',

  // The error when the user sign out failed.
  // User is signed in and metadata may be present.
  FailedSigningOutUser = 'Failed signing out user',

  // The error when the user sign in failed.
  // User is not signed in and no metadata are present.
  FailedSigningInUser = 'Failed signing in user',

  // The error when the fetching of user's metadata failed after the user was successfuly signed in.
  // User was explicitly signed out and no metadata are present.
  FailedFetchingUserMetadata = 'Failed feching user metadata',
}

export enum AuthState {
  // The state when the app finds no signed in user during the initial check and the state when the sign in fails.
  // User is not signed in and no metadata are present. The error field may be populated by the AuthError.
  NoUser,

  // LOADING STATE
  // The initial state when the app starts.
  // User is not signed in and no metadata are present.
  LookingForStoredUser,

  // LOADING STATE
  // The state after user start the sign-in flow.
  // User is not signed in and no metadata are present.
  SigningInUser,

  // LOADING STATE
  // The state when the sign out was requested but was not completed yet.
  // User may be signed in and metadata may be present
  SigningOutUser,

  // LOADING STATE
  // The state when the user is signed in, but the app is still fetching user metadata.
  // User is signed in, but metadata are not fetched yet. 
  FetchingUserMetadata,

  // The state when the user is signed in and the metadata were successfuly fetched.
  // User is signed in and metadata are present.
  UserAndMetadataLoaded,
}

interface User {
  userID: string;
  email: string;
}

type FailedLookingForStoredUserAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser };
type FailedSigningOutAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedSigningOutUser, user?: User };
type FailedSigningInAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedSigningInUser };
type FailedFetchingUserMetadataAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedFetchingUserMetadata };
type LookingForStoredUserAuthInfo = { state: AuthState.LookingForStoredUser }
type NoUserAuthInfo = { state: AuthState.NoUser };
type FetchingUserMetadataAuthInfo = { state: AuthState.FetchingUserMetadata }
type SigningInUserAuthInfo = { state: AuthState.SigningInUser }
type SigningOutUserAuthInfo = { state: AuthState.SigningOutUser, user?: User }
type UserAndMetadataLoadedAuthInfo = { state: AuthState.UserAndMetadataLoaded, user: User };

export type AuthInfo = FailedSigningOutAuthInfo
  | FailedSigningInAuthInfo
  | NoUserAuthInfo
  | FailedLookingForStoredUserAuthInfo
  | FailedFetchingUserMetadataAuthInfo
  | SigningInUserAuthInfo
  | UserAndMetadataLoadedAuthInfo
  | LookingForStoredUserAuthInfo
  | FetchingUserMetadataAuthInfo
  | SigningOutUserAuthInfo;

export type { MagicUserMetadata };

export const authEmitter = new EventEmitter();

export let auth: AuthInfo = { state: AuthState.LookingForStoredUser };
export const AuthContext = createContext<AuthInfo>(auth);

const BASE_URL = isDev ? 'http://localhost:3002' : 'https://api.usedevbook.com/v1';

const magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';
const magic = new Magic(magicAPIKey);

let signInCancelHandle: (() => void) | undefined = undefined;

const electronStore = new ElectronStore();

function setRefreshToken(refreshToken: string) {
  return electronStore.set('refreshToken', refreshToken);
}

function getRefreshToken() {
  return electronStore.get('refreshToken');
}

function deleteRefreshToken() {
  return electronStore.delete('refreshToken');
}

function changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
  if (auth.state === AuthState.UserAndMetadataLoaded) {
    const email = auth?.user?.email || undefined;
    const userID = auth?.user?.userID || undefined;
    changeUserInMain(userID && email ? { userID, email } : undefined);
  } if (auth.state === AuthState.NoUser) {
    changeUserInMain();
  }
}

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

export function updateAuth(newAuth: AuthInfo) {
  auth = newAuth;
  authEmitter.emit('changed', auth);
  changeAnalyticsUserAndSaveEmail(auth);
  setAuthInOtherWindows(auth);
}

export async function signOut() {
  const oldAuth = auth;
  updateAuth({ ...auth, state: AuthState.SigningOutUser });
  try {
    await magic.user.logout();
    const refreshToken = await getRefreshToken();
    deleteRefreshToken();
    await axios.post(`${BASE_URL}/v1/auth/signout`, {
      refreshToken,
    }, {
      withCredentials: true,
    });
  } catch (error) {
    console.error(error.message);
  }
  updateAuth({ ...auth, state: AuthState.NoUser });
}

export function cancelSignIn() {
  signInCancelHandle?.();
}

export async function signIn(email: string) {
  try {
    const oldRefreshToken = await getRefreshToken();
    if (oldRefreshToken) {
      const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, {
        refreshToken: oldRefreshToken,
      });

      const user = data.user as User;
      updateAuth({ state: AuthState.UserAndMetadataLoaded, user });

      const refreshToken = data.refreshToken as string;
      return setRefreshToken(refreshToken);
    }
  } catch (error) { }

  cancelSignIn();
  updateAuth({ state: AuthState.SigningInUser });

  let rejectHandle: (reason?: any) => void;
  let isCancelled = false;

  const cancelableSignIn = new Promise<void>(async (resolve, reject) => {
    rejectHandle = reject;

    const sessionID = generateSessionID();
    const params = querystring.encode({
      email,
      ...isDev && { test: 'true' },
    });

    await openLink(`${BASE_URL}/auth/signin/${sessionID}?${params}`);

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
        const result = await axios.get(`${BASE_URL}/auth/credential/${sessionID}`, {
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
        await axios.delete(`${BASE_URL}/auth/credential/${sessionID}`);
        updateAuth({ state: AuthState.NoUser });
        return reject({ message: 'Sign in was cancelled' });
      } catch (error) {
        console.error(error.message);
        updateAuth({ state: AuthState.NoUser });
        return reject({ message: 'Sign in could not be cancelled' });
      }
    }

    if (!credential && !isCancelled) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
      return reject({ message: 'Getting credential for sign in timed out' });
    }

    try {
      const didToken = await magic.auth.loginWithCredential(credential);
      if (!didToken) {
        updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
        return reject({ message: 'Could not complete the sign in' });
      }

      const { data } = await axios.post(`${BASE_URL}/v1/auth/signin`, {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${didToken}`,
        },
      });
      const user = data.user as User;
      updateAuth({ state: AuthState.UserAndMetadataLoaded, user });

      const refreshToken = data.refreshToken as string;
      setRefreshToken(refreshToken);

      return resolve();
    } catch (error) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedSigningInUser });
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
  updateAuth({ state: AuthState.LookingForStoredUser });
  try {
    const oldRefreshToken = await getRefreshToken();
    console.log('refresh', oldRefreshToken);
    if (!oldRefreshToken) {
      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
      return;
    }
    const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, {
      refreshToken: oldRefreshToken,
    });

    const user = data.user as User;
    updateAuth({ state: AuthState.UserAndMetadataLoaded, user });

    const refreshToken = data.refreshToken as string;
    setRefreshToken(refreshToken);

  } catch (error) {
    updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
    console.error(error.message);
  }
}
