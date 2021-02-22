import { MagicUserMetadata } from 'magic-sdk';

import { AuthError } from './authError';
import { AuthState } from './authState';
import { User } from './user';

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
