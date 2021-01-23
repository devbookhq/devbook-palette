export enum IPCMessage {
  GetCachedDocSources = 'GetCachedDocSources',
  SaveDocSources = 'SaveDocSources',

  GetAuthFromMainWindow = 'GetAuthFromMainWindow',
  SetAuthInOtherWindows = 'SetAuthInOtherWindows',

  ChangeUserInMain = 'ChangeUserInMain',
  OpenSignInModal = 'OpenSignInModal',
  SignOut = 'SignOut',

  GoToPreferencesPage = 'GoToPreferencesPage',

  TrackSignInModalOpened = 'TrackSignInModalOpened',
  TrackSignInModalClosed = 'TrackSignInModalClosed',
  TrackSignInButtonClicked = 'TrackSignInButtonClicked',
  TrackSignInAgainButtonClicked = 'TrackSignInAgainButtonClicked',
  TrackSignInFinished = 'TrackSignInFinished',
  TrackSignInFailed = 'TrackSignInFailed',
  TrackContinueIntoAppButtonClicked = 'TrackContinueIntoAppButtonClicked',
  TrackSignOutButtonClicked = 'TrackSignOutButtonClicked',
}
