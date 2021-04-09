// We are not using path aliases here, because when we import this file from the main the aliases stop working.
import { AuthInfo } from 'user/authInfo';
import { User } from 'user/user';
import { AppWindow, UpdateLocation } from 'services/appWindow';
import { GlobalShortcut } from 'services/globalShortcut';
import { PreferencesPage } from 'Preferences/preferencesPage';
import { StorageKey, StorageValue } from 'services/sync.service/storage';
import { AnalyticsEvent, AnalyticsPayload } from 'services/analytics.service/analyticsEvent';

export type IPCSendHandler<T extends IPCSendChannel> = (event: Electron.IpcMainInvokeEvent, payload: IPCSendPayload[T]) => (Promise<void> | void);

export enum IPCSendChannel {
  ChangeUserInMain = 'ChangeUserInMain',
  SetAuthInOtherWindows = 'SetAuthInOtherWindows',
  ReloadMainWindow = 'ReloadMainWindow',
  UserDidChangeShortcut = 'UserDidChangeShortcut',
  FinishOnboarding = 'FinishOnboarding',
  OpenSignInModal = 'OpenSignInModal',
  SignOut = 'SignOut',
  LoadAppClient = 'LoadAppClient',
  HideWindow = 'HideWindow',
  OpenPreferences = 'OpenPreferences',
  RestartAndUpdate = 'RestartAndUpdate',
  GetAuthFromMainWindow = 'GetAuthFromMainWindow',
  PostponeUpdate = 'PostponeUpdate',
  TogglePinMode = 'TogglePinMode',

  StorageSet = 'StorageSet',
  AnalyticsTrack = 'AnalyticsTrack',
}

export type IPCSendPayload<T extends StorageKey = StorageKey, U extends AnalyticsEvent = AnalyticsEvent> = {
  [IPCSendChannel.ChangeUserInMain]: { user: User | undefined };
  [IPCSendChannel.SetAuthInOtherWindows]: { auth: AuthInfo };
  [IPCSendChannel.ReloadMainWindow]: void;
  [IPCSendChannel.UserDidChangeShortcut]: { shortcut: GlobalShortcut };
  [IPCSendChannel.FinishOnboarding]: void;
  [IPCSendChannel.OpenSignInModal]: void;
  [IPCSendChannel.SignOut]: void;
  [IPCSendChannel.LoadAppClient]: { window: AppWindow };
  [IPCSendChannel.HideWindow]: void;
  [IPCSendChannel.OpenPreferences]: { page: PreferencesPage };
  [IPCSendChannel.RestartAndUpdate]: { location: UpdateLocation };
  [IPCSendChannel.GetAuthFromMainWindow]: void;
  [IPCSendChannel.PostponeUpdate]: void;
  [IPCSendChannel.TogglePinMode]: { isEnabled: boolean };

  [IPCSendChannel.StorageSet]: { key: T, value: StorageValue[T] };
  [IPCSendChannel.AnalyticsTrack]: { event: U, payload: AnalyticsPayload[U] };
}
