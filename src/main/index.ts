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
import toDesktop from '@todesktop/runtime';
import contextMenu from 'electron-context-menu';

// Set the path to the application data to the 'com.foundrylabs.devbook' instead of the 'Devbook' directory.
// Top-level property 'productName' in the package.json overwrites top-level property 'name' as an app identifier.
// At the same time, the 'productName' is required to be top-level by ToDesktop - we used 'productName' in a 'build' property before.
// It still creates a directory on the original path, but this directory only contains an empty 'Dictionaries' directory.
// This is an open electron issue https://github.com/electron/electron/issues/26039.
app.setPath('userData', path.resolve(app.getPath('userData'), '..', 'com.foundrylabs.devbook'));

import isDev from './utils/isDev';
import {
  trackShowApp,
  trackOnboardingFinished,
  trackOnboardingStarted,
  trackSearchDebounced,
  trackConnectGitHubFinished,
  trackConnectGitHubStarted,
  trackModalOpened,
  trackShortcut,
  changeAnalyticsUser,
  trackSignInModalOpened,
  trackSignInModalClosed,
  trackSignInButtonClicked,
  trackSignInAgainButtonClicked,
  trackSignInFinished,
  trackSignInFailed,
  trackContinueIntoAppButtonClicked,
  trackSignOutButtonClicked,
  trackEnablePinMode,
  trackDisablePinMode,
} from './analytics';
import Tray from './Tray';
import OnboardingWindow from './OnboardingWindow';
import PreferencesWindow, { PreferencesPage } from './PreferencesWindow';
import GitHubOAuth from './GitHubOAuth';
import MainWindow from './MainWindow';
import { IPCMessage } from '../mainCommunication/ipc';
import { platform } from 'os';

toDesktop.init();

enum StoreKey {
  DocSources = 'docSources',
  Email = 'email',
  IsPinModeEnabled = 'isPinModeEnabled',
}

const PORT = 3000;
let isPinModeEnabled = false;

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

// Default right-click context menu for all Electron windows.
contextMenu();

// Disallow running multiple instances of Devbook
const isFirstInstance = app.requestSingleInstanceLock();

if (!isFirstInstance) {
  app.exit(0);
} else {
  app.on('second-instance', () => {
    if (onboardingWindow?.window) {
      onboardingWindow.window.restore();
      onboardingWindow.window.focus();
    } else if (preferencesWindow?.window) {
      preferencesWindow.window.restore();
      preferencesWindow.window.focus();
    } else if (mainWindow?.window) {
      mainWindow.window.restore();
      mainWindow.window.focus();
    } else {
      mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp());
      mainWindow.isPinModeEnabled = isPinModeEnabled;
    mainWindow?.webContents?.send(IPCMessage.OnPinModeChange, { isEnabled: isPinModeEnabled });
    }
  });
}

// Auto-updating
let isUpdateAvailable = false;

if (!isDev) {
  toDesktop.autoUpdater.on('update-downloaded', () => {
    isUpdateAvailable = true;

    mainWindow?.webContents?.send('update-available', {});
    preferencesWindow?.webContents?.send('update-available', {});

    tray?.setIsUpdateAvailable(true);
  });
}

async function restartAndUpdate() {
  if (isUpdateAvailable) {
    setImmediate(() => {
      try {
        toDesktop.autoUpdater.restartAndInstall();
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
let taskBarIcon: electron.NativeImage;

if (isDev) {
  if (process.platform === 'darwin') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', 'TrayIconTemplate.png'));
  }
  if (process.platform === 'linux' || process.platform === 'win32') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', 'TrayIconTemplateLinuxWin.png'));
    taskBarIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), 'resources', 'icons', '256x256.png'));
  }
} else {
  if (process.platform === 'darwin') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), '..', 'resources', 'TrayIconTemplate.png'));
  }
  if (process.platform === 'linux' || process.platform === 'win32') {
    trayIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), '..', 'resources', 'TrayIconTemplateLinuxWin.png'));
    taskBarIcon = electron.nativeImage.createFromPath(path.join(app.getAppPath(), '..', 'resources', 'icons', '256x256.png'));
  }
}

let tray: Tray;
let mainWindow: MainWindow | undefined = undefined;
let onboardingWindow: OnboardingWindow | undefined = undefined;
let preferencesWindow: PreferencesWindow | undefined = undefined;

const store = new Store();

const gitHubOAuth = new GitHubOAuth();

gitHubOAuth.emitter.on('access-token', async ({ accessToken }: { accessToken: string }) => {
  mainWindow?.webContents?.send('github-access-token', { accessToken });
  mainWindow?.show();
  preferencesWindow?.webContents?.send('github-access-token', { accessToken });
  store.set('github', accessToken);
  trackConnectGitHubFinished();
});

gitHubOAuth.emitter.on('error', ({ message }: { message: string }) => {
  mainWindow?.webContents?.send('github-error', { message });
  mainWindow?.show();
  preferencesWindow?.webContents?.send('github-error', { message });
});

function hideMainWindow() {
  mainWindow?.hide();
  
  if (!onboardingWindow?.window?.isVisible() && !preferencesWindow?.window?.isVisible() && process.platform === 'darwin') {
    // This action would hide the onboarding and preferences window too, but it is necessary for restoring focus when hiding mainWindow.
    electron.Menu.sendActionToFirstResponder('hide:');
  }
}

function openPreferences(page?: PreferencesPage) {
  if (!preferencesWindow || !preferencesWindow.window) {
    preferencesWindow = new PreferencesWindow(PORT, () => onboardingWindow?.window?.isVisible(), taskBarIcon, page);
  }
  preferencesWindow.show(page);
  hideMainWindow();
}

const shouldOpenAtLogin = store.get('openAtLogin', true);

app.setLoginItemSettings({
  openAtLogin: shouldOpenAtLogin,
  openAsHidden: true,
});

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
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    onboardingWindow?.webContents?.send('did-show-main-window');
    return;
  }

  if (mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    mainWindow?.show();
    mainWindow?.webContents?.send('did-show-main-window');
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
      app.setLoginItemSettings({
        openAtLogin: !currentVal,
        openAsHidden: true,
      });
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
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp(), true);
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    mainWindow?.webContents?.send(IPCMessage.OnPinModeChange, { isEnabled: isPinModeEnabled });

    onboardingWindow = new OnboardingWindow(PORT, taskBarIcon);
    onboardingWindow?.window?.focus();

    trackOnboardingStarted();
  } else {
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp(), app.getLoginItemSettings().wasOpenedAsHidden);
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    mainWindow?.webContents?.send(IPCMessage.OnPinModeChange, { isEnabled: isPinModeEnabled });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!isFirstRun || onboardingWindow?.window) {
    preferencesWindow?.show();
  }
});

app.on('will-quit', () => electron.globalShortcut.unregisterAll());

/////////// IPC events ///////////
ipcMain.on('hide-window', () => hideMainWindow());

ipcMain.on('user-did-change-shortcut', (_, { shortcut }) => {
  trySetGlobalShortcut(shortcut)
});

ipcMain.on('finish-onboarding', () => {
  // TODO: This should be onboardingWindow?.close() but it produces a runtime error when toggling
  // a visibility on the main window.
  onboardingWindow?.hide();
  store.set('firstRun', false);
  isFirstRun = false;
  if (!preferencesWindow?.window?.isVisible() && process.platform === 'darwin') {
    app.dock.hide();
  }
  trackOnboardingFinished();
});

ipcMain.on('track-shortcut', (_, shortcutInfo: { hotkey: string, action: string }) => {
  trackShortcut(shortcutInfo);
});

ipcMain.handle('get-global-shortcut', () => {
  return store.get('globalShortcut', 'Alt+Space');
});

ipcMain.on('connect-github', () => {
  gitHubOAuth.requestOAuth();
  hideMainWindow();
  trackConnectGitHubStarted();
});

ipcMain.on('open-preferences', (_, { page }: { page?: PreferencesPage }) => {
  openPreferences(page);
});

ipcMain.on('restart-and-update', () => {
  restartAndUpdate();
});

ipcMain.on(IPCMessage.ChangeUserInMain, async (_, user: { userID: string, email: string } | undefined) => {
  if (user) {
    changeAnalyticsUser(user);
    store.set(StoreKey.Email, user.email);
  } else {
    changeAnalyticsUser();
  }
});

ipcMain.on(IPCMessage.SignOut, (event) => {
  if (event.sender.id !== mainWindow?.window?.id) {
    mainWindow?.webContents?.send(IPCMessage.SignOut);
  }
});

ipcMain.on(IPCMessage.SetAuthInOtherWindows, (event, auth) => {
  if (event.sender.id === mainWindow?.window?.id) {
    preferencesWindow?.webContents?.send(IPCMessage.SetAuthInOtherWindows, auth);
  }
});

ipcMain.on(IPCMessage.GetAuthFromMainWindow, (event) => {
  if (event.sender.id !== mainWindow?.window?.id) {
    mainWindow?.webContents?.send(IPCMessage.GetAuthFromMainWindow);
  }
});

ipcMain.on(IPCMessage.OpenSignInModal, () => {
  mainWindow?.show();
  mainWindow?.webContents?.send(IPCMessage.OpenSignInModal);
});

ipcMain.on('track-modal-opened', (_, modalInfo: any) => trackModalOpened(modalInfo));

ipcMain.on('save-search-query', (_, { query }: { query: string }) => {
  store.set('lastQuery', query);
});

ipcMain.on('save-search-filter', (_, { filter }: { filter: string }) => {
  store.set('searchFilter', filter);
});

ipcMain.handle('github-access-token', () => store.get('github', null));

let postponeHandler: NodeJS.Timeout | undefined;

ipcMain.on('postpone-update', () => {
  if (isUpdateAvailable) {
    if (postponeHandler) {
      clearTimeout(postponeHandler);
    }
    postponeHandler = setTimeout(() => {
      mainWindow?.webContents?.send('update-available', { isReminder: true });
    }, 19 * 60 * 60 * 1000) as unknown as NodeJS.Timeout;
  }
});

ipcMain.handle('remove-github', async () => {
  store.delete('github');
  mainWindow?.webContents?.send('github-access-token', { accessToken: null });
  preferencesWindow?.webContents?.send('github-access-token', { accessToken: null });
});

ipcMain.handle('create-tmp-file', async (_, { filePath, fileContent }: { filePath: string, fileContent: string }) => {
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

ipcMain.handle('get-saved-search-query', () => {
  return store.get('lastQuery', '');
});

ipcMain.handle('get-saved-search-filter', async () => {
  return store.get('searchFilter', '');
});

ipcMain.handle('update-status', () => {
  return isUpdateAvailable;
});

ipcMain.on('save-doc-search-results-default-width', (_, { width }: { width: number }) => {
  store.set('docSearchResultsDefaultWidth', width);
});

ipcMain.handle('get-doc-search-results-default-width', () => {
  return store.get('docSearchResultsDefaultWidth', 200);
});

ipcMain.handle(IPCMessage.GetCachedDocSources, async () => {
  return store.get(StoreKey.DocSources, []);
});

ipcMain.on(IPCMessage.SaveDocSources, (_, { docSources }) => {
  store.set(StoreKey.DocSources, docSources);
});

ipcMain.on('track-search', (_, searchInfo: any) => trackSearchDebounced(searchInfo));

ipcMain.on(IPCMessage.TrackSignInModalOpened, () => {
  trackSignInModalOpened()
});

ipcMain.on(IPCMessage.TrackSignInModalClosed, () => {
  trackSignInModalClosed()
});

ipcMain.on(IPCMessage.TrackSignInButtonClicked, () => {
  trackSignInButtonClicked()
});

ipcMain.on(IPCMessage.TrackSignInAgainButtonClicked, () => {
  trackSignInAgainButtonClicked()
});

ipcMain.on(IPCMessage.TrackSignInFinished, () => {
  trackSignInFinished()
});

ipcMain.on(IPCMessage.TrackSignInFailed, (_, { error }: { error: string }) => {
  trackSignInFailed(error)
});

ipcMain.on(IPCMessage.TrackContinueIntoAppButtonClicked, () => {
  trackContinueIntoAppButtonClicked()
});

ipcMain.on(IPCMessage.TrackSignOutButtonClicked, () => {
  trackSignOutButtonClicked()
});

ipcMain.on(IPCMessage.TogglePinMode, (_, { isEnabled }: { isEnabled: boolean }) => {
  if (mainWindow) {
    isPinModeEnabled = isEnabled;
    mainWindow.isPinModeEnabled = isEnabled;
    if (isEnabled) {
      trackEnablePinMode();
    } else {
      trackDisablePinMode();
    }
  }
});
