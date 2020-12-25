import { ResultsFilter } from 'Home/SearchInput';

const electron = window.require('electron') as typeof import('electron');

const app = electron.app || electron.remote.app;
const isEnvSet = 'ELECTRON_IS_DEV' in electron.remote.process.env;
const getFromEnv = parseInt(electron.remote.process.env.ELECTRON_IS_DEV || '0', 10) === 1;
export const isDev = isEnvSet ? getFromEnv : !app.isPackaged;

export function getGlobalShortcut() {
  return electron.ipcRenderer.invoke('get-global-shortcut') as Promise<string>;
}

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export function connectGitHub() {
  electron.ipcRenderer.send('connect-github');
}

export function removeGitHub() {
  return electron.ipcRenderer.invoke('remove-github');
}

export function getSavedSearchQuery() {
  return electron.ipcRenderer.invoke('get-saved-search-query') as Promise<string>;
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
  electron.ipcRenderer.send('save-search-query', query)
}

export function saveSearchFilter(filter: ResultsFilter) {
  electron.ipcRenderer.send('save-search-filter', filter.toString());
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
  electron.ipcRenderer.send('user-did-change-shortcut', { shortcut });
}

export function openPreferences() {
  electron.ipcRenderer.send('open-preferences');
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

// So we see logs from the main process in the Chrome debug tools.
electron.ipcRenderer.on('console', (event, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

export default electron;

