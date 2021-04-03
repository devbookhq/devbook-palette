export enum AuthState {
  // The state when the app finds no signed in user during the initial check and the state when the sign in fails.
  // User is not signed in and user property is present. The error field may be populated by the AuthError.
  NoUser = 'NoUser',

  // LOADING STATE
  // The initial state when the app starts.
  // User is not signed in and the user property is not present.
  LookingForStoredUser = 'LookingForStoredUser',

  // LOADING STATE
  // The state after user start the sign-in flow.
  // User is not signed in and the user property is not present.
  SigningInUser = 'SigningInUser',

  // LOADING STATE
  // The state when the sign out was requested but was not completed yet.
  // User may be signed in and the user property may be present
  SigningOutUser = 'SigningOutUser',

  // The state when the user is signed in.
  // User is signed in and user property is present.
  UserSignedIn = 'UserSignedIn',
}
