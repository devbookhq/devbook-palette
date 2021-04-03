import { AuthInfo } from 'user/authInfo';
import { User } from 'user/user';
import ElectronService from './electron.service';

// export enum IPCMessage {
//   GetActiveDocSource = 'GetActiveDocSource',
//   SaveActiveDocSource = 'SaveActiveDocSource',

//   GetAuthFromMainWindow = 'GetAuthFromMainWindow',
//   SetAuthInOtherWindows = 'SetAuthInOtherWindows',

//   ChangeUserInMain = 'ChangeUserInMain',
//   OpenSignInModal = 'OpenSignInModal',
//   SignOut = 'SignOut',

//   GoToPreferencesPage = 'GoToPreferencesPage',

//   TrackSignInModalOpened = 'TrackSignInModalOpened',
//   TrackSignInModalClosed = 'TrackSignInModalClosed',
//   TrackSignInButtonClicked = 'TrackSignInButtonClicked',
//   TrackSignInAgainButtonClicked = 'TrackSignInAgainButtonClicked',
//   TrackSignInFinished = 'TrackSignInFinished',
//   TrackSignInFailed = 'TrackSignInFailed',
//   TrackContinueIntoAppButtonClicked = 'TrackContinueIntoAppButtonClicked',
//   TrackSignOutButtonClicked = 'TrackSignOutButtonClicked',

//   TogglePinMode = 'TogglePinMode',
//   OnPinModeChange = 'OnPinModeChange',

//   TrackShowSearchHistory = 'TrackShowSearchHistory',
//   TrackHideSearchHistory = 'TrackHideSearchHistory',
//   TrackSelectHistoryQuery = 'TrackSelectHistoryQuery',

//   TrackCopyCodeSnippetStackOverflow = 'TrackCopyCodeSnippetStackOverflow',
//   TrackCopyCodeSnippetDocs = 'TrackCopyCodeSnippetDocs',

//   TrackDismissBundleUpdate = 'TrackDismissBundleUpdate',
//   TrackPerformBundleUpdate = 'TrackPerformBundleUpdate',

//   GetSearchMode = 'GetSearchMode',
//   UserDidChangeSearchMode = 'UserDidChangeSearchMode',
//   OnSearchModeChange = 'OnSearchModeChange',

//   ReloadMainWindow = 'ReloadMainWindow',
// }


// export function userDidChangeShortcut(shortcut: string) {
//   IPCService.send('user-did-change-shortcut', { shortcut });
// }

// export function finishOnboarding() {
//   IPCService.send('finish-onboarding');
// }

export enum SendIPC {
  ChangeUserInMain = 'ChangeUserInMain',
  SetAuthInOtherWindows = 'SetAuthInOtherWindows',
  TrackPerformBundleUpdate = 'TrackPerformBundleUpdate',
  TrackDismissBundleUpdate = 'TrackDismissBundleUpdate',
  ReloadMainWindow = 'ReloadMainWindow',
  UserDidChangeShortcut = 'UserDidChangeShortcut',
  FinishOnboarding = 'FinishOnboarding',
}

export enum OnIPC {
  GetAuthFromMainWindow = 'GetAuthFromMainWindow',
}

export enum InvokeIPC {
  'MockInvoke' = 'mockInvoke'
}

type IPCArgsTypings = {
  [InvokeIPC.MockInvoke]: 'mock';

  [SendIPC.ChangeUserInMain]: User | undefined;
  [SendIPC.SetAuthInOtherWindows]: AuthInfo;
  [SendIPC.TrackDismissBundleUpdate]: undefined;
  [SendIPC.TrackPerformBundleUpdate]: undefined;
  [SendIPC.ReloadMainWindow]: undefined;
  [SendIPC.UserDidChangeShortcut]: string;
  [SendIPC.FinishOnboarding]: undefined;

  [OnIPC.GetAuthFromMainWindow]: () => void;
}

type IPCReturnTypings = {
  [InvokeIPC.MockInvoke]: 'mock';
}

type IPCArgsMap = {
  [channel in SendIPC | OnIPC | InvokeIPC]: IPCArgsTypings[channel];
}

type IPCReturnMap = {
  [channel in InvokeIPC]: IPCReturnTypings[channel];
}

class IPCService {
  private constructor() { }

  static send<T extends SendIPC>(channel: T, payload: IPCArgsMap[T]) {
    ElectronService.ipcRenderer.send(channel, { payload });
  }

  static invoke<T extends InvokeIPC>(channel: T, payload: IPCArgsMap[T]): Promise<IPCReturnMap[T]> {
    return ElectronService.ipcRenderer.invoke(channel, { payload });
  }

  static on<T extends OnIPC>(channel: T, handler: IPCArgsMap[T]) {
    return ElectronService.ipcRenderer.on(channel, handler);
  }
}

export default IPCService;
