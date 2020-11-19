const electron = window.require('electron') as typeof import('electron');

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

// So we see logs from the main process in the Chrome debug tools
electron.ipcRenderer.on('console', (event, args) => {
  const [type, ...consoleArgs] = args;
  console[type as 'log' | 'error']?.('[main]:', ...consoleArgs);
});

export default electron;
