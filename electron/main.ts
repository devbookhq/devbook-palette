import * as path from 'path';
import * as process from 'process';
import * as electron from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import {
  app,
  ipcMain,
} from 'electron';
import tmp from 'tmp';
import { autoUpdater } from 'electron-updater';

import isDev from './utils/isDev';
import {
  trackShowApp,
  trackOnboardingFinished,
  trackOnboardingStarted,
  trackSearchDebounced,
  trackConnectGitHubFinished,
  trackConnectGitHubStarted,
  trackModalOpened,
} from './analytics';
import Tray from './Tray';
import OnboardingWindow from './OnboardingWindow';
import PreferencesWindow from './PreferencesWindow';
import OAuth from './OAuth';
import MainWindow from './MainWindow';

const PORT = 3000;

// Set up logs so logging from the main process can be seen in the browser.
function logInRendered(...args: any) {
  mainWindow?.webContents?.send('console', args);
}

const oldLog = console.log;
console.log = (...args: any) => {
  oldLog(...args);
  logInRendered('log', ...args);
}

const oldError = console.error;
console.error = (...args: any) => {
  oldError(...args);
  logInRendered('error', ...args);
}

// Auto-updating
let isUpdateAvailable = false;

if (!isDev) {
  autoUpdater.requestHeaders = null;

  app.on('ready', () => {
    // TODO: Switch setInterval for a cron job - https://github.com/kelektiv/node-cron
    setInterval(() => {
      console.log('updates checked');
      autoUpdater.checkForUpdates();
    }, 20 * 60 * 1000);
  });

  autoUpdater.on('update-downloaded', () => {
    isUpdateAvailable = true;

    mainWindow?.webContents?.send('update-available', {});
    preferencesWindow?.webContents?.send('update-available', {});

    tray?.setIsUpdateAvailable(true);
  });

  autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
  });
}

async function restartAndUpdate() {
  if (isUpdateAvailable) {
    setImmediate(() => {
      try {
        autoUpdater.quitAndInstall();
      } catch (error) {
        console.error(error.message);
      }
    });
  }
}

// Automatically delete temporary files after the application exit.
tmp.setGracefulCleanup();

// https://stackoverflow.com/questions/41664208/electron-tray-icon-change-depending-on-dark-theme
let trayIcon: electron.NativeImage;

if (isDev) {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', 'TrayIconTemplate.png'));
  } else if (process.platform === 'win32') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', 'TrayIconWindowsTemplate.png'));
  }
} else {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), '..', 'resources', 'TrayIconTemplate.png'));
  } else if (process.platform === 'win32') {
    // We have a different tray icon for Windows.
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), '..', 'resources', 'TrayIconWindowsTemplate.png'));
  }
}

let tray: Tray;
let mainWindow: MainWindow | undefined = undefined;
let onboardingWindow: OnboardingWindow | undefined = undefined;
let preferencesWindow: PreferencesWindow | undefined = undefined;

const store = new Store();

const oauth = new OAuth(
  () => mainWindow?.show(),
  () => hideMainWindow(),
);

oauth.emitter.on('access-token', async ({ accessToken }: { accessToken: string }) => {
  mainWindow?.webContents?.send('github-access-token', { accessToken });
  preferencesWindow?.webContents?.send('github-access-token', { accessToken });
  store.set('github', accessToken);
  trackConnectGitHubFinished();
});

oauth.emitter.on('error', ({ message }: { message: string }) => {
  mainWindow?.webContents?.send('github-error', { message });
  preferencesWindow?.webContents?.send('github-error', { message });
});

function hideMainWindow() {
  mainWindow?.hide();

  if (!onboardingWindow?.window?.closable && !preferencesWindow?.window?.closable) {
    // This action would hide the oboarding and preferences window too, but it is necessary for restoring focus when hiding mainWindow.
    electron.Menu.sendActionToFirstResponder('hide:');
  }
}

function openPreferences() {
  if (!preferencesWindow || !preferencesWindow.window) {
    preferencesWindow = new PreferencesWindow(PORT);
  }
  preferencesWindow.show();
  hideMainWindow();
}

const shouldOpenAtLogin = store.get('openAtLogin', true);

app.setLoginItemSettings({ openAtLogin: shouldOpenAtLogin });

let isFirstRun = store.get('firstRun', true);

if (process.platform === 'darwin' && !isFirstRun) {
  // Hide the dock icon only when the onboarding process is complete.
  app.dock.hide();
}

// Checks whether the main window is already created and based on this value either creates a new instance
// or just calls .show() or .hide() on an existing instance.
function toggleVisibilityOnMainWindow() {
  if (!mainWindow || !mainWindow.window) {
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp());
    onboardingWindow?.webContents?.send('did-show-main-window');
    return;
  }

  if (mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    mainWindow.show();
    mainWindow.webContents?.send('did-show-main-window');
    onboardingWindow?.webContents?.send('did-show-main-window');
  }
}

function trySetGlobalShortcut(shortcut: string) {
  electron.globalShortcut.unregisterAll();

  const success = electron.globalShortcut.register(shortcut, toggleVisibilityOnMainWindow);
  if (!success) {
    // TODO: Instead of quiting app, show users a window where they can choose a new global shortcut.
    electron.dialog.showMessageBox({ message: `We couldn't register shortuct '${shortcut}'. It might be already registered by another app. Please choose another shortcut.` });
    return;
  }

  store.set('globalShortcut', shortcut);
}

/////////// App Events ///////////
app.once('ready', async () => {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  if (isDev) {
    // Load react dev tools.
    await electron.session.defaultSession.loadExtension(
      path.join(__dirname, '..', '..', 'react-dev-tools-4.9.0_26'),
    );
  }

  isFirstRun = store.get('firstRun', true);

  // If user registered a global shortcut from the previos session, load it and register again.
  const savedShortcut = store.get('globalShortcut');
  if (savedShortcut) {
    // TODO: Since we still don't offer for a user to change the shortcut after onboarding
    // this might fail and user won't be able to show Devbook through a shortcut ever again.
    trySetGlobalShortcut(savedShortcut);
  }

  tray = new Tray(trayIcon, {
    onShowDevbookClick: toggleVisibilityOnMainWindow,
    // TODO: What if the main window is undefined?
    onOpenAtLoginClick: () => {
      const currentVal = store.get('openAtLogin', true);
      store.set('openAtLogin', !currentVal);
      tray.setOpenAtLogin(!currentVal);
    },
    openPreferences: () => openPreferences(),
    onQuitClick: () => app.quit(),
    shouldOpenAtLogin: store.get('openAtLogin', true),
    version: app.getVersion(),
    restartAndUpdate,
    isUpdateAvailable,
  });

  if (isFirstRun) {
    onboardingWindow = new OnboardingWindow(PORT);
    trackOnboardingStarted();
  } else {
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp());
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!onboardingWindow?.window && isFirstRun) onboardingWindow = new OnboardingWindow(PORT);
  else preferencesWindow?.show();
});

app.on('will-quit', () => electron.globalShortcut.unregisterAll());

/////////// IPC events ///////////
ipcMain.on('hide-window', () => hideMainWindow());

ipcMain.on('user-did-change-shortcut', (event, { shortcut }) => trySetGlobalShortcut(shortcut));

ipcMain.on('finish-onboarding', () => {
  // TODO: This should be onboardingWindow?.close() but it produces a runtime error when toggling
  // a visibility on the main window.
  onboardingWindow?.hide();
  store.set('firstRun', false);
  if (process.platform === 'darwin') app.dock.hide();
  trackOnboardingFinished();
});

ipcMain.on('register-default-shortcut', () => {
  const shortcut = store.get('globalShortcut', 'Alt+Space');
  trySetGlobalShortcut(shortcut);
});

ipcMain.handle('get-global-shortcut', () => {
  return store.get('globalShortcut', 'Alt+Space');
});

ipcMain.on('connect-github', () => {
  oauth.requestOAuth();
  trackConnectGitHubStarted();
});

ipcMain.on('open-preferences', () => openPreferences());

ipcMain.on('restart-and-update', () => {
  restartAndUpdate();
});

ipcMain.on('track-search', (event, searchInfo: any) => trackSearchDebounced(searchInfo));

ipcMain.on('track-modal-opened', (event, modalInfo: any) => trackModalOpened(modalInfo));

ipcMain.handle('github-access-token', () => store.get('github', null));

let postponeHandler: NodeJS.Timeout | undefined;

ipcMain.on('postpone-update', () => {
  if (isUpdateAvailable) {
    if (postponeHandler) {
      clearTimeout(postponeHandler);
    }
    // TODO: Switch setTimeout for a cron job - https://github.com/kelektiv/node-cron
    postponeHandler = setTimeout(() => {
      mainWindow?.webContents?.send('update-available', { isReminder: true });
    }, 19 * 60 * 60 * 1000);
  }
});

ipcMain.handle('remove-github', async () => {
  store.delete('github');
  mainWindow?.webContents?.send('github-access-token', { accessToken: null });
  preferencesWindow?.webContents?.send('github-access-token', { accessToken: null });
});

ipcMain.handle('create-tmp-file', async (event, { filePath, fileContent }: { filePath: string, fileContent: string }) => {
  const basename = path.basename(filePath);
  try {
    const { name } = await new Promise<{ name: string, fd: number }>((resolve, reject) => {
      tmp.file({
        template: `tmp-XXXXXX-${basename}`,
      }, (error, name, fd) => {
        if (error) {
          return reject(error);
        }

        fs.write(fd, fileContent, (error) => {
          if (error) {
            return reject(error);
          }
          return resolve({ name, fd });
        });
      });
    });
    return name;
  } catch (error) {
    console.error(error.message);
  }
});

ipcMain.handle('is-dev', () => {
  return isDev;
});

ipcMain.handle('update-status', () => {
  return isUpdateAvailable;
});
