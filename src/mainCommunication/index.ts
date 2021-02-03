import { IPCMessage } from './ipc';
import electron, { isDev } from './electron';
import { ResultsFilter } from 'Home/SearchHeaderPanel';
import { DocSource } from 'Home/Docs';
import {
  AuthInfo,
  updateAuth,
  signOut,
  auth,
} from 'Auth';
import { PreferencesPage } from 'Preferences/PreferencesPage';

// So we see logs from the main process in the Chrome debug tools.
electron.ipcRenderer.on(IPCMessage.Console, (_, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

// This event can be only send TO mainWindow
electron.ipcRenderer.on(IPCMessage.GetAuthFromMainWindow, () => {
  setAuthInOtherWindows(auth);
});

electron.ipcRenderer.on(IPCMessage.SetAuthInOtherWindows, (_, auth: AuthInfo) => {
  updateAuth(auth);
});

electron.ipcRenderer.on(IPCMessage.SignOut, () => {
  signOut();
});

export function setAuthInOtherWindows(auth: AuthInfo) {
  electron.ipcRenderer.send(IPCMessage.SetAuthInOtherWindows, auth);
}

export function signOutUser() {
  return electron.ipcRenderer.send(IPCMessage.SignOut);
}

export function getGlobalShortcut() {
  return electron.ipcRenderer.invoke(IPCMessage.GetGlobalShortcut) as Promise<string>;
}

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export function changeUserInMain(user?: { userID: string, email: string }) {
  electron.ipcRenderer.send(IPCMessage.ChangeUserInMain, user);
}

export function getSavedSearchQuery(): Promise<string> {
  return electron.ipcRenderer.invoke(IPCMessage.GetSavedSearchQuery);
}

export async function getSavedSearchFilter(): Promise<ResultsFilter> {
  const filter = await (electron.ipcRenderer.invoke(IPCMessage.GetSavedSearchFilter) as Promise<string>);
  return ResultsFilter[filter as ResultsFilter] || ResultsFilter.StackOverflow;
}

export function trackShortcut(shortcutInfo: { action: string }) {
  electron.ipcRenderer.send(IPCMessage.TrackShortcut, { shortcutInfo });
}

export function hideMainWindow() {
  electron.ipcRenderer.send(IPCMessage.HideWindow);
}

export function saveSearchQuery(query: string) {
  electron.ipcRenderer.send(IPCMessage.SaveSearchQuery, { query });
}

export function saveSearchFilter(filter: ResultsFilter) {
  electron.ipcRenderer.send(IPCMessage.SaveSearchFilter, { filter: filter.toString() });
}

export function trackSearch(searchInfo: {
  activeFilter: string,
}) {
  electron.ipcRenderer.send(IPCMessage.TrackSearch, searchInfo);
}

export function trackModalOpened(modalInfo: {
  activeFilter: string,
  url: string;
}) {
  electron.ipcRenderer.send(IPCMessage.TrackModalOpened, modalInfo);
}

export function userDidChangeShortcut(shortcut: string) {
  electron.ipcRenderer.send(IPCMessage.UsedDidChangeShortcut, { shortcut });
}

export function getAuthFromMainWindow() {
  electron.ipcRenderer.send(IPCMessage.GetAuthFromMainWindow);
}

export function openPreferences(page?: PreferencesPage) {
  electron.ipcRenderer.send(IPCMessage.OpenPreferences, { page });
}

export function openSignInModal() {
  electron.ipcRenderer.send(IPCMessage.OpenSignInModal);
}

export function postponeUpdate() {
  electron.ipcRenderer.send(IPCMessage.PostponeUpdate);
}

export function finishOnboarding() {
  electron.ipcRenderer.send(IPCMessage.FinishedOnboarding);
}

export function restartAndUpdate() {
  electron.ipcRenderer.send(IPCMessage.RestartAndUpdate);
}

export function getUpdateStatus(): Promise<boolean> {
  return electron.ipcRenderer.invoke(IPCMessage.UpdateStatus);
}

export function saveDocSearchResultsDefaultWidth(width: number) {
  electron.ipcRenderer.send(IPCMessage.SaveDocSearchResultsDefaultWidth, { width });
}

export function getDocSearchResultsDefaultWidth(): Promise<number> {
  return electron.ipcRenderer.invoke(IPCMessage.GetDocSearchResultsDefaultWidth);
}

export function getCachedDocSources(): Promise<DocSource[]> {
  return electron.ipcRenderer.invoke(IPCMessage.GetCachedDocSources);
}

export function saveDocSources(docSources: DocSource[]) {
  return electron.ipcRenderer.send(IPCMessage.SaveDocSources, { docSources });
}

export function trackSignInModalOpened() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInModalOpened);
}

export function trackSignInModalClosed() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInModalClosed);
}

export function trackSignInButtonClicked() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInButtonClicked);
}

export function trackSignInAgainButtonClicked() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInAgainButtonClicked);
}

export function trackSignInFinished() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInFinished);
}

export function trackSignInFailed(error: string) {
  return electron.ipcRenderer.send(IPCMessage.TrackSignInFailed, { error });
}

export function trackContinueIntoAppButtonClicked() {
  return electron.ipcRenderer.send(IPCMessage.TrackContinueIntoAppButtonClicked);
}

export function trackSignOutButtonClicked() {
  return electron.ipcRenderer.send(IPCMessage.TrackSignOutButtonClicked);
}

export { isDev };

export default electron;
