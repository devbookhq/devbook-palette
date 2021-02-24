import * as path from 'path';
import * as process from 'process';
import * as electron from 'electron';
import Store from 'electron-store';
import { kill } from 'process';
import {
  app,
  ipcMain,
} from 'electron';
import { autoUpdater } from 'electron-updater';

import isDev from './utils/isDev';
import {
  trackShowApp,
  trackOnboardingFinished,
  trackOnboardingStarted,
  trackSearchDebounced,
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
} from './analytics';
import Tray from './Tray';
import OnboardingWindow from './OnboardingWindow';
import PreferencesWindow from './PreferencesWindow';
import { PreferencesPage } from '../Preferences/PreferencesPage';
import MainWindow from './MainWindow';
import { IPCMessage } from '../mainCommunication/ipc';
import { StoreKey } from './StoreKey';

const PORT = 3000;

// Set up logs so logging from the main process can be seen in the browser.
function logInRendered(...args: any) {
  mainWindow?.webContents?.send(IPCMessage.Console, args);
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
    }
  });
}

// Auto-updating
let isUpdateAvailable = false;

if (!isDev) {
  autoUpdater.requestHeaders = null;

  app.on('ready', () => {
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 10 * 60 * 1000);
  });

  autoUpdater.on('update-downloaded', () => {
    isUpdateAvailable = true;

    mainWindow?.webContents?.send(IPCMessage.UpdateAvailable, {});
    preferencesWindow?.webContents?.send(IPCMessage.UpdateAvailable, {});

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

const extensionProcesses: { [pid: number]: true } = {};

function killAllExtensionProcesses() {
  (Object.keys(extensionProcesses) as unknown as number[]).forEach(async pid => {
    killExtensionProcess(pid);
  });
}

function killExtensionProcess(pid: number) {
  if (extensionProcesses[pid]) {
    try {
      kill(pid)
    } catch {
    } finally {
      delete extensionProcesses[pid];
    }
  }
}

const store = new Store();

let postponeHandler: NodeJS.Timeout | undefined;

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

const shouldOpenAtLogin = store.get(StoreKey.OpenAtLogin, true);

app.setLoginItemSettings({ openAtLogin: shouldOpenAtLogin });

let isFirstRun = store.get(StoreKey.FirstRun, true);

if (process.platform === 'darwin' && !isFirstRun) {
  // Hide the dock icon only when the onboarding process is complete.
  app.dock.hide();
}

// Checks whether the main window is already created and based on this value either creates a new instance
// or just calls .show() or .hide() on an existing instance.
function toggleVisibilityOnMainWindow() {
  if (!mainWindow || !mainWindow.window) {
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp());
    onboardingWindow?.webContents?.send(IPCMessage.DidShowMainWindow);
    return;
  }

  if (mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    mainWindow?.show();
    mainWindow?.webContents?.send(IPCMessage.DidShowMainWindow);
    onboardingWindow?.webContents?.send(IPCMessage.DidShowMainWindow);
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

  store.set(StoreKey.GlobalShortcut, shortcut);
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

  isFirstRun = store.get(StoreKey.FirstRun, true);

  // If user registered a global shortcut from the previos session, load it and register again.
  const savedShortcut = store.get(StoreKey.GlobalShortcut);
  if (savedShortcut) {
    // TODO: Since we still don't offer for a user to change the shortcut after onboarding
    // this might fail and user won't be able to show Devbook through a shortcut ever again.
    trySetGlobalShortcut(savedShortcut);
  }

  tray = new Tray(trayIcon, {
    onShowDevbookClick: toggleVisibilityOnMainWindow,
    // TODO: What if the main window is undefined?
    onOpenAtLoginClick: () => {
      const currentVal = store.get(StoreKey.OpenAtLogin, true);
      store.set(StoreKey.OpenAtLogin, !currentVal);
      tray.setOpenAtLogin(!currentVal);
    },
    openPreferences: () => openPreferences(),
    onQuitClick: () => app.quit(),
    shouldOpenAtLogin: store.get(StoreKey.OpenAtLogin, true),
    version: app.getVersion(),
    restartAndUpdate,
    isUpdateAvailable,
  });

  if (isFirstRun) {
    onboardingWindow = new OnboardingWindow(PORT, taskBarIcon);
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp(), true);
    onboardingWindow?.window?.focus();
    trackOnboardingStarted();
  } else {
    mainWindow = new MainWindow(PORT, store, () => hideMainWindow(), () => trackShowApp());
  }
});

app.on('window-all-closed', () => {
  killAllExtensionProcesses();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!isFirstRun || onboardingWindow?.window) {
    preferencesWindow?.show();
  }
});

app.on('will-quit', () => electron.globalShortcut.unregisterAll());

/////////// IPC events ///////////
ipcMain.handle(IPCMessage.GetSavedSearchQuery, () => store.get(StoreKey.LastQuery, ''));
ipcMain.handle(IPCMessage.GetSavedSearchFilter, () => store.get(StoreKey.SearchFilter, ''));
ipcMain.handle(IPCMessage.UpdateStatus, () => isUpdateAvailable);
ipcMain.handle(IPCMessage.GetDocSearchResultsDefaultWidth, () => store.get(StoreKey.DocSearchResultsDefaultWidth, 200));
ipcMain.handle(IPCMessage.GetGlobalShortcut, () => store.get(StoreKey.GlobalShortcut, 'Alt+Space'));
ipcMain.handle(IPCMessage.GetCachedDocSources, () => store.get(StoreKey.DocSources, []));

ipcMain.on(IPCMessage.FinishedOnboarding, () => {
  // TODO: This should be onboardingWindow?.close() but it produces a runtime error when toggling
  // a visibility on the main window.
  onboardingWindow?.hide();
  store.set(StoreKey.FirstRun, false);
  isFirstRun = false;
  if (!preferencesWindow?.window?.isVisible() && process.platform === 'darwin') {
    app.dock.hide();
  }
  trackOnboardingFinished();
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

ipcMain.on(IPCMessage.PostponeUpdate,
  () => {
    if (isUpdateAvailable) {
      if (postponeHandler) {
        clearTimeout(postponeHandler);
      }
      postponeHandler = setTimeout(() => {
        mainWindow?.webContents?.send(IPCMessage.UpdateAvailable, { isReminder: true });
      }, 19 * 60 * 60 * 1000) as unknown as NodeJS.Timeout;
    }
  });

ipcMain.on(IPCMessage.UsedDidChangeShortcut, (_, { shortcut }) => trySetGlobalShortcut(shortcut));
ipcMain.on(IPCMessage.HideWindow, () => hideMainWindow());
ipcMain.on(IPCMessage.OpenPreferences, (_, { page }: { page?: PreferencesPage }) => openPreferences(page));
ipcMain.on(IPCMessage.RestartAndUpdate, () => restartAndUpdate());
ipcMain.on(IPCMessage.SaveSearchQuery, (_, { query }: { query: string }) => store.set(StoreKey.LastQuery, query));
ipcMain.on(IPCMessage.SaveSearchFilter, (_, { filter }: { filter: string }) => store.set(StoreKey.SearchFilter, filter));
ipcMain.on(IPCMessage.SaveDocSearchResultsDefaultWidth, (_, { width }: { width: number }) => store.set(StoreKey.DocSearchResultsDefaultWidth, width));
ipcMain.on(IPCMessage.TrackModalOpened, (_, modalInfo: any) => trackModalOpened(modalInfo));
ipcMain.on(IPCMessage.TrackShortcut, (_, shortcutInfo: { hotkey: string, action: string }) => trackShortcut(shortcutInfo));
ipcMain.on(IPCMessage.TrackSearch, (_, searchInfo: any) => trackSearchDebounced(searchInfo));
ipcMain.on(IPCMessage.SaveDocSources, (_, { docSources }) => store.set(StoreKey.DocSources, docSources));
ipcMain.on(IPCMessage.TrackSignInModalOpened, () => trackSignInModalOpened());
ipcMain.on(IPCMessage.TrackSignInModalClosed, () => trackSignInModalClosed());
ipcMain.on(IPCMessage.TrackSignInButtonClicked, () => trackSignInButtonClicked());
ipcMain.on(IPCMessage.TrackSignInAgainButtonClicked, () => trackSignInAgainButtonClicked());
ipcMain.on(IPCMessage.TrackSignInFinished, () => trackSignInFinished());
ipcMain.on(IPCMessage.TrackSignInFailed, (_, { error }: { error: string }) => trackSignInFailed(error));
ipcMain.on(IPCMessage.TrackContinueIntoAppButtonClicked, () => trackContinueIntoAppButtonClicked());
ipcMain.on(IPCMessage.TrackSignOutButtonClicked, () => trackSignOutButtonClicked());
ipcMain.on(IPCMessage.RegisterExtensionProcess, (_, pid: number) => extensionProcesses[pid] = true);
ipcMain.on(IPCMessage.UnregisterExtensionProcess, (_, pid: number) => delete extensionProcesses[pid]);
ipcMain.on(IPCMessage.KillAllExtensionProcesses, () => killAllExtensionProcesses());
ipcMain.on(IPCMessage.KillExtensionProcess, (_, pid: number) => killExtensionProcess(pid));
