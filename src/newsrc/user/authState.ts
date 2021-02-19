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
