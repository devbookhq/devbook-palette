import electron, { isDev } from './electron';
import { ResultsFilter } from 'Home/SearchInput';
import { DocSource } from 'search/docs';
import { refreshAuth } from 'Auth';
import { PreferencesPage } from 'Preferences';

export enum IPCMessage {
  GetCachedDocSources = 'GetCachedDocSources',
  SaveDocSources = 'SaveDocSources',
  RefreshAuth = 'RefreshAuth',
  OpenSignInModal = 'OpenSignInModal',
  ChangeUserInMain = 'ChangeUserInMain',
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

// So we see logs from the main process in the Chrome debug tools.
electron.ipcRenderer.on('console', (_, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

electron.ipcRenderer.on(IPCMessage.RefreshAuth, () => {
  refreshAuth();
});

export function getGlobalShortcut() {
  return electron.ipcRenderer.invoke('get-global-shortcut') as Promise<string>;
}

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export function connectGitHub() {
  electron.ipcRenderer.send('connect-github');
}

export function changeUserInMain(user?: { userID: string, email: string }) {
  electron.ipcRenderer.send(IPCMessage.ChangeUserInMain, user);
}

export function removeGitHub() {
  return electron.ipcRenderer.invoke('remove-github');
}

export function getSavedSearchQuery(): Promise<string> {
  return electron.ipcRenderer.invoke('get-saved-search-query');
}

export async function getSavedSearchFilter(): Promise<ResultsFilter> {
  const filter = await (electron.ipcRenderer.invoke('get-saved-search-filter') as Promise<string>);
  return ResultsFilter[filter as ResultsFilter] || ResultsFilter.StackOverflow;
}

export function notifyViewReady() {
  electron.ipcRenderer.send('view-ready');
}

export function trackShortcut(shortcutInfo: { action: string }) {
  electron.ipcRenderer.send('track-shortcut', { shortcutInfo });
}

export function hideMainWindow() {
  electron.ipcRenderer.send('hide-window');
}

export function saveSearchQuery(query: string) {
  electron.ipcRenderer.send('save-search-query', { query });
}

export function saveSearchFilter(filter: ResultsFilter) {
  electron.ipcRenderer.send('save-search-filter', { filter: filter.toString() });
}

export function trackSearch(searchInfo: {
  activeFilter: string,
}) {
  electron.ipcRenderer.send('track-search', searchInfo);
}

export function trackModalOpened(modalInfo: {
  activeFilter: string,
  url: string;
}) {
  electron.ipcRenderer.send('track-modal-opened', modalInfo);
}

export function userDidChangeShortcut(shortcut: string) {
  electron.ipcRenderer.send('user-did-change-hortcut', { shortcut });
}

export function refreshAuthInOtherWindows() {
  electron.ipcRenderer.send(IPCMessage.RefreshAuth);
}

export function openPreferences(page?: PreferencesPage) {
  electron.ipcRenderer.send('open-preferences', { page });
}

export function openSignInModal() {
  electron.ipcRenderer.send(IPCMessage.OpenSignInModal);
}

export function postponeUpdate() {
  electron.ipcRenderer.send('postpone-update');
}

export function finishOnboarding() {
  electron.ipcRenderer.send('finish-onboarding');
}

export function restartAndUpdate() {
  electron.ipcRenderer.send('restart-and-update');
}

export function getUpdateStatus(): Promise<boolean> {
  return electron.ipcRenderer.invoke('update-status');
}

export function getGithubAccessToken(): Promise<string | null> {
  return electron.ipcRenderer.invoke('github-access-token');
}

export function createTmpFile(options: { fileContent: string, filePath: string }): Promise<string | undefined> {
  return electron.ipcRenderer.invoke('create-tmp-file', options);
}

export function saveDocSearchResultsDefaultWidth(width: number) {
  electron.ipcRenderer.send('save-doc-search-results-default-width', { width });
}

export function getDocSearchResultsDefaultWidth(): Promise<number> {
  return electron.ipcRenderer.invoke('get-doc-search-results-default-width');
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
