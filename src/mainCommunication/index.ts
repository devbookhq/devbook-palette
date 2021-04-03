import { IPCMessage } from './ipc';
import IPCService from 'services/ipc.service';
// import { DocSource } from 'Search/docs';
import { PreferencesPage } from 'Preferences';
import { SearchMode } from 'Preferences/Pages/searchMode';

// So we see logs from the main process in the Chrome debug tools.
// IPCService.on('console', (_, args) => {
//   const [type, ...consoleArgs] = args;
//   console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
// });

// export function signOutUser() {
//   return IPCService.send(IPCMessage.SignOut);
// }

// export function getGlobalShortcut() {
//   return IPCService.invoke('get-global-shortcut') as Promise<string>;
// }

// export function getSearchMode() {
//   return IPCService.invoke(IPCMessage.GetSearchMode) as Promise<SearchMode>;
// }

// export function changeUserInMain(user?: { userID: string, email: string }) {
//   IPCService.send(IPCMessage.ChangeUserInMain, user);
// }

// export function getSavedSearchQuery(): Promise<string> {
//   return IPCService.invoke('get-saved-search-query');
// }

// export async function getSavedSearchFilter(): Promise<string> {
//   const filter = await (IPCService.invoke('get-saved-search-filter') as Promise<string>);
//   return ResultsFilter[filter as ResultsFilter] || ResultsFilter.StackOverflow;
// }

// export function trackShortcut(shortcutInfo: { action: string }) {
//   IPCService.send('track-shortcut', { shortcutInfo });
// }

// export function hideMainWindow() {
//   IPCService.send('hide-window');
// }

// export function saveSearchQuery(query: string) {
//   IPCService.send('save-search-query', { query });
// }

// export function saveSearchFilter(filter: ResultsFilter) {
//   IPCService.send('save-search-filter', { filter: filter.toString() });
// }

// export function trackSearch(searchInfo: {
//   activeFilter: string,
//   query: string,
//   searchMode: SearchMode | undefined,
//   activeDocSource?: DocSource,
// }) {
//   IPCService.send('track-search', searchInfo);
// }

// export function trackModalOpened(modalInfo: {
//   activeFilter: string,
//   url: string;
// }) {
//   IPCService.send('track-modal-opened', modalInfo);
// }

// export function userDidChangeShortcut(shortcut: string) {
//   IPCService.send('user-did-change-shortcut', { shortcut });
// }

// export function userDidChangeSearchMode(mode: SearchMode) {
//   IPCService.send(IPCMessage.UserDidChangeSearchMode, { mode });
// }

// export function getAuthFromMainWindow() {
//   IPCService.send(IPCMessage.GetAuthFromMainWindow);
// }

// export function openPreferences(page?: PreferencesPage) {
//   IPCService.send('open-preferences', { page });
// }

// export function openSignInModal() {
//   IPCService.send(IPCMessage.OpenSignInModal);
// }

// export function postponeUpdate() {
//   IPCService.send('postpone-update');
// }

// export function finishOnboarding() {
//   IPCService.send('finish-onboarding');
// }

// export function restartAndUpdate(location: 'banner' | 'preferences') {
//   IPCService.send('restart-and-update', location);
// }

// export function getUpdateStatus(): Promise<boolean> {
//   return IPCService.invoke('update-status');
// }

// export function saveDocSearchResultsDefaultWidth(width: number) {
//   IPCService.send('save-doc-search-results-default-width', { width });
// }

// export function getDocSearchResultsDefaultWidth(): Promise<number> {
//   return IPCService.invoke('get-doc-search-results-default-width');
// }

// export function getActiveDocSource(): Promise<DocSource | undefined> {
//   return IPCService.invoke(IPCMessage.GetActiveDocSource);
// }
// export function saveActiveDocSource(docSource: DocSource) {
//   return IPCService.send(IPCMessage.SaveActiveDocSource, { docSource });
// }

// export function trackSignInModalOpened() {
//   return IPCService.send(IPCMessage.TrackSignInModalOpened);
// }

// export function trackSignInModalClosed() {
//   return IPCService.send(IPCMessage.TrackSignInModalClosed);
// }

// export function trackSignInButtonClicked() {
//   return IPCService.send(IPCMessage.TrackSignInButtonClicked);
// }

// export function trackSignInAgainButtonClicked() {
//   return IPCService.send(IPCMessage.TrackSignInAgainButtonClicked);
// }

// export function trackSignInFinished() {
//   return IPCService.send(IPCMessage.TrackSignInFinished);
// }

// export function trackSignInFailed(error: string) {
//   return IPCService.send(IPCMessage.TrackSignInFailed, { error });
// }

// export function trackContinueIntoAppButtonClicked() {
//   return IPCService.send(IPCMessage.TrackContinueIntoAppButtonClicked);
// }

// export function trackSignOutButtonClicked() {
//   return IPCService.send(IPCMessage.TrackSignOutButtonClicked);
// }

// export function togglePinMode(isEnabled: boolean) {
//   return IPCService.send(IPCMessage.TogglePinMode, { isEnabled });
// }

// export function trackShowSearchHistory() {
//   return IPCService.send(IPCMessage.TrackShowSearchHistory);
// }

// export function trackHideSearchHistory() {
//   return IPCService.send(IPCMessage.TrackHideSearchHistory);
// }

// export function trackSelectHistoryQuery() {
//   return IPCService.send(IPCMessage.TrackSelectHistoryQuery);
// }

// export function trackCopyCodeSnippetStackOverflow() {
//   return IPCService.send(IPCMessage.TrackCopyCodeSnippetStackOverflow);
// }

// export function trackCopyCodeSnippetDocs() {
//   return IPCService.send(IPCMessage.TrackCopyCodeSnippetDocs);
// }

// export function reloadMainWindow() {
//   return IPCService.send(IPCMessage.ReloadMainWindow);
// }

// export function trackDismissBundleUpdate() {
//   return IPCService.send(IPCMessage.TrackDismissBundleUpdate);
// }

// export function trackPerformBundleUpdate() {
//   return IPCService.send(IPCMessage.TrackPerformBundleUpdate);
// }

/*
export function retrieveQuery() {
  dispatchMessage('Invoke', 'Store', { action: 'get', key: 'searchQuery' });
}

export function saveQuery(value: string) {
  dispatchMessage('Invoke', 'Store', { action: 'set', key: 'searchQuery', value });
}

export function dispatchMessage(ipc: 'Send' | 'Invoke', msgType: 'Store' | 'Auth' | 'Interface', data: any = undefined) {
  const payload = {
    type: msgType,
    data: {}
  };

  if (ipc === 'Send')
    return IPCService.send('renderer_message', payload);
  else
    return IPCService.invoke('renderer_message', payload);
}
*/

