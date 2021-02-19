import { MagicUserMetadata } from 'magic-sdk';
import { AuthError } from './authError';
import { AuthState } from './authState';

type FailedLookingForStoredUserAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedLookingForStoredUser };
type FailedSigningOutAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedSigningOutUser, metadata?: MagicUserMetadata };
type FailedSigningInAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedSigningInUser };
type FailedFetchingUserMetadataAuthInfo = { state: AuthState.NoUser, error: AuthError.FailedFetchingUserMetadata };
type LookingForStoredUserAuthInfo = { state: AuthState.LookingForStoredUser }
type NoUserAuthInfo = { state: AuthState.NoUser };
type FetchingUserMetadataAuthInfo = { state: AuthState.FetchingUserMetadata }
type SigningInUserAuthInfo = { state: AuthState.SigningInUser }
type SigningOutUserAuthInfo = { state: AuthState.SigningOutUser, metadata?: MagicUserMetadata }
type UserAndMetadataLoadedAuthInfo = { state: AuthState.UserAndMetadataLoaded, metadata: MagicUserMetadata };

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
