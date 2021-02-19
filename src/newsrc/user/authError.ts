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
