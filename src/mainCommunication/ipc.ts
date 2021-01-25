export enum IPCMessage {
  GetCachedDocSources = 'GetCachedDocSources',
  SaveDocSources = 'SaveDocSources',

  GetAuthFromMainWindow = 'GetAuthFromMainWindow',
  SetAuthInOtherWindows = 'SetAuthInOtherWindows',

  UsedDidChangeShortcut = 'UserDidChangeShortcut',
  GetGlobalShortcut = 'GetGlobalShortcut',

  GetSavedSearchQuery = 'GetSavedSearchQuery',
  SaveSearchQuery = 'SaveSearchQuery',

  GetSavedSearchFilter = 'GetSavedSearchFilter',
  SaveSearchFilter = 'SaveSearchFilter',

  SaveDocSearchResultsDefaultWidth = 'SaveDocSearchResultsDefaultWidth',
  GetDocSearchResultsDefaultWidth = 'GetDocSearchResultsDefaultWidth',

  ChangeUserInMain = 'ChangeUserInMain',
  OpenSignInModal = 'OpenSignInModal',

  SignOut = 'SignOut',

  GoToPreferencesPage = 'GoToPreferencesPage',
  OpenPreferences = 'OpenPreferences',

  FinishedOnboarding = 'FinishedOnboarding',

  DidShowMainWindow = 'DidShowMainWindow',
  HideWindow = 'HideWindow',

  PostponeUpdate = 'PostponeUpdate',
  UpdateStatus = 'UpdateStatus',
  UpdateAvailable = 'UpdateAvailable',
  RestartAndUpdate = 'RestartAndUpdate',

  TrackSignInModalOpened = 'TrackSignInModalOpened',
  TrackSignInModalClosed = 'TrackSignInModalClosed',
  TrackSignInButtonClicked = 'TrackSignInButtonClicked',
  TrackSignInAgainButtonClicked = 'TrackSignInAgainButtonClicked',
  TrackSignInFinished = 'TrackSignInFinished',
  TrackSignInFailed = 'TrackSignInFailed',
  TrackContinueIntoAppButtonClicked = 'TrackContinueIntoAppButtonClicked',
  TrackSignOutButtonClicked = 'TrackSignOutButtonClicked',
  TrackShortcut = 'TrackShortcut',
  TrackSearch = 'TrackSearch',
  TrackModalOpened = 'TrackModalOpened',

  Console = 'Console',
}
