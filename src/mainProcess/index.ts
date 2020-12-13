const electron = window.require('electron') as typeof import('electron');

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export function connectGitHub() {
  electron.ipcRenderer.send('connect-github');
}

export function removeGitHub() {
  return electron.ipcRenderer.invoke('remove-github');
}

export function notifyViewReady() {
  electron.ipcRenderer.send('view-ready');
}

export function hideMainWindow() {
  electron.ipcRenderer.send('hide-window');
}

export function trackSearch(searchInfo: {
  activeFilter: string,
  query: string,
  codeResultsLength: number,
  soResultsLength: number,
}) {
  electron.ipcRenderer.send('track-search', searchInfo);
}

export function trackModalOpened(modalInfo: {
  activeFilter: string,
  resultIndex: number,
  url: string;
  query: string;
  title?: string,
}) {
  electron.ipcRenderer.send('track-modal-opened', modalInfo);
}

export function userDidChangeShortcut(shortcut: string) {
  electron.ipcRenderer.send('user-did-change-shortcut', { shortcut });
}

export function openPreferences() {
  electron.ipcRenderer.send('open-preferences');
}

export function finishOnboarding() {
  electron.ipcRenderer.send('finish-onboarding');
}

export function getGithubAccessToken(): Promise<string | null> {
  return electron.ipcRenderer.invoke('github-access-token');
}

export function createTmpFile(options: { fileContent: string, filePath: string }): Promise<string | undefined> {
  return electron.ipcRenderer.invoke('create-tmp-file', options);
}

// So we see logs from the main process in the Chrome debug tools
electron.ipcRenderer.on('console', (event, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

export default electron;
