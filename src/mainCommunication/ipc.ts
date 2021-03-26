export enum IPCMessage {
  GetActiveDocSource = 'GetActiveDocSource',
  SaveActiveDocSource = 'SaveActiveDocSource',

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

  TogglePinMode = 'TogglePinMode',
  OnPinModeChange = 'OnPinModeChange',

  TrackShowSearchHistory = 'TrackShowSearchHistory',
  TrackHideSearchHistory = 'TrackHideSearchHistory',
  TrackSelectHistoryQuery = 'TrackSelectHistoryQuery',

  TrackCopyCodeSnippetStackOverflow = 'TrackCopyCodeSnippetStackOverflow',
  TrackCopyCodeSnippetDocs = 'TrackCopyCodeSnippetDocs',

  GetSearchMode = 'GetSearchMode',
  UserDidChangeSearchMode = 'UserDidChangeSearchMode',
  OnSearchModeChange = 'OnSearchModeChange',

  ReloadMainWindow = 'ReloadMainWindow',
}
