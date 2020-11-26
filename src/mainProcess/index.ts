const electron = window.require('electron') as typeof import('electron');

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export function connectGitHub() {
  electron.ipcRenderer.send('github-oauth');
}

export function notifyViewReady() {
  electron.ipcRenderer.send('view-ready');
}

export function hideMainWindow() {
  electron.ipcRenderer.send('hide-window');
}

export function userDidChangeShortcut(shortcut: string) {
  electron.ipcRenderer.send('user-did-change-shortcut', { shortcut });
}

export function finishOnboarding() {
  electron.ipcRenderer.send('finish-onboarding');
}

export function getGithubAccessToken(): Promise<string | null> {
  return electron.ipcRenderer.invoke('github-access-token');
}

// So we see logs from the main process in the Chrome debug tools
electron.ipcRenderer.on('console', (event, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

export default electron;

