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
type LookingForStoredUserAuthInfo = { state: AuthState.LookingForStoredUser }
type NoUserAuthInfo = { state: AuthState.NoUser };
type SigningInUserAuthInfo = { state: AuthState.SigningInUser }
type SigningOutUserAuthInfo = { state: AuthState.SigningOutUser, user?: User }
type UserAndMetadataLoadedAuthInfo = { state: AuthState.UserAndMetadataLoaded, user: User };

export type AuthInfo = FailedSigningOutAuthInfo
  | FailedSigningInAuthInfo
  | NoUserAuthInfo
  | FailedLookingForStoredUserAuthInfo
  | SigningInUserAuthInfo
  | UserAndMetadataLoadedAuthInfo
  | LookingForStoredUserAuthInfo
  | SigningOutUserAuthInfo;

export type { MagicUserMetadata };

export const authEmitter = new EventEmitter();

export let auth: AuthInfo = { state: AuthState.LookingForStoredUser };
export const AuthContext = createContext<AuthInfo>(auth);

const baseURL = isDev ? 'http://localhost:3002' : 'https://api.usedevbook.com';
// const baseURL = isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';

enum APIVersion {
  v1 = 'v1',
}

const apiVersion = APIVersion.v1;

const magicAPIKey = isDev ? 'pk_test_2AE829E9A03C1FA0' : 'pk_live_C99F68FD8F927F2E';
const magic = new Magic(magicAPIKey);

let signInCancelHandle: (() => void) | undefined = undefined;

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

function changeAnalyticsUserAndSaveEmail(auth: AuthInfo) {
  if (auth.state === AuthState.UserAndMetadataLoaded) {
    const email = auth?.user?.email || undefined;
    const userID = auth?.user?.userID || undefined;
    changeUserInMain(userID && email ? { userID, email } : undefined);
  } else if (auth.state === AuthState.NoUser) {
    changeUserInMain();
  }
}

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

export function updateAuth(newAuth: AuthInfo) {
  auth = newAuth;
  console.log('user', auth);
  authEmitter.emit('changed', auth);
  changeAnalyticsUserAndSaveEmail(auth);
  setAuthInOtherWindows(auth);
}

export async function signOut() {
  updateAuth({ ...auth, state: AuthState.SigningOutUser });
  const refreshToken = getRefreshToken();
  deleteRefreshToken();
  updateAuth({ ...auth, state: AuthState.NoUser });
  try {
    await magic.user.logout();
    await axios.post('/auth/signOut', null, {
      baseURL: `${baseURL}/${apiVersion}`,
      params: {
        refreshToken,
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(error.message);
  }
}

export function cancelSignIn() {
  signInCancelHandle?.();
}

export async function signIn(email: string) {
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

    // This route should NOT be "/auth/signIn" - "/auth/signin" is correct, because it uses the old API.
    await openLink(`${baseURL}/auth/signin/${sessionID}?${params}`);

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
        const result = await axios.get(`/auth/credential/${sessionID}`, {
          baseURL: `${baseURL}/${apiVersion}`,
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
          baseURL: `${baseURL}/${apiVersion}`,
        });
        updateAuth({ state: AuthState.NoUser });
        return reject({ message: 'Sign in was cancelled' });
      } catch (error) {
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

      const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
        baseURL: `${baseURL}/${apiVersion}`,
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${didToken}`,
        },
      }) as { data: { user: User, refreshToken: string } };

      setRefreshToken(refreshToken);
      updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
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
    const oldRefreshToken = getRefreshToken();
    if (!oldRefreshToken) {
      if (await magic.user.isLoggedIn()) {
        const didToken = await magic.user.getIdToken();
        const { data: { refreshToken, user } } = await axios.post('/auth/signIn', null, {
          baseURL: `${baseURL}/${apiVersion}`,
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${didToken}`,
          },
        }) as { data: { user: User, refreshToken: string } };
        setRefreshToken(refreshToken);
        updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
        return;
      }

      updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
      return;
    }
    const { data: { user, refreshToken } } = await axios.get('/auth/accessToken', {
      baseURL: `${baseURL}/${apiVersion}`,
      params: {
        refreshToken: oldRefreshToken,
      },
    }) as { data: { user: User, refreshToken: string } };

    updateAuth({ state: AuthState.UserAndMetadataLoaded, user });
    setRefreshToken(refreshToken);
  } catch (error) {
    updateAuth({ state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser });
  }
}
