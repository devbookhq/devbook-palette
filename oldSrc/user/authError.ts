export enum AuthErrorType {
  // The error when the looking for a valid stored user failed - probably because of the network connection.
  // User is not signed in and no metadata are present.
  FailedLookingForStoredUser,

  // The error when the sign out failed.
  // User is signed in and metadata may be present.
  FailedSigningOutUser,

  // The error when the sign in failed.
  // User is not signed in and no metadata are present.
  FailedSigningInUser,
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}
