// We are not using path aliases here, because when we import this file from the main the aliases stop working.
import { PreferencesPage } from 'Preferences/preferencesPage';
import { AuthInfo } from 'user/authInfo';

export type IPCOnHandler<T extends IPCOnChannel> = (event: Electron.IpcRendererEvent, payload: IPCOnPayload[T]) => (Promise<void> | void);

export enum IPCOnChannel {
  GetAuthFromMainWindow = 'GetAuthFromMainWindow',
  OnPinModeChange = 'OnPinModeChanged',
  UpdateAvailable = 'UpdateAvailable',
  SignOut = 'SignOut',
  SetAuthInOtherWindows = 'SetAuthInOtherWindows',
  OpenSignInModal = 'OpenSignInModal',
  DidShowMainWindow = 'DidShowMainWindow',
  GoToPreferencesPage = 'GoToPreferencesPage',
}

export type IPCOnPayload = {
  [IPCOnChannel.GetAuthFromMainWindow]: void;
  [IPCOnChannel.OnPinModeChange]: { isEnabled: boolean };
  [IPCOnChannel.UpdateAvailable]: undefined | { isReminder: boolean };
  [IPCOnChannel.SignOut]: void;
  [IPCOnChannel.SetAuthInOtherWindows]: { auth: AuthInfo };
  [IPCOnChannel.OpenSignInModal]: void;
  [IPCOnChannel.DidShowMainWindow]: void;
  [IPCOnChannel.DidShowMainWindow]: void;
  [IPCOnChannel.GoToPreferencesPage]: { page: PreferencesPage };
}
