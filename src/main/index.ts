import * as path from 'path';
import * as process from 'process';
import * as electron from 'electron';
import { app } from 'electron';
import toDesktop from '@todesktop/runtime';
import contextMenu from 'electron-context-menu';
import AutoLaunch from 'auto-launch';
import { Environment } from '@renderer/services/electron.service/environment';
declare var ENVIRONMENT: Environment;

import isDev from '@main/utils/isDev';
// Set the path to the application data to the 'com.foundrylabs.devbook' instead of the 'Devbook' directory.
// Top-level property 'productName' in the package.json overwrites top-level property 'name' as an app identifier.
// At the same time, the 'productName' is required to be top-level by ToDesktop - we used 'productName' in a 'build' property before.
// It still creates a directory on the original path, but this directory only contains an empty 'Dictionaries' directory.
// This is an open electron issue https://github.com/electron/electron/issues/26039.
const appDataFolder = 'com.foundrylabs.devbook';

if (isDev) {
  app.setPath('userData', path.resolve(app.getPath('userData'), '..', `${appDataFolder}.dev`));
} else {
  app.setPath('userData', path.resolve(app.getPath('userData'), '..', appDataFolder));
}

import MainIPCService, { IPCInvokeChannel, IPCOnChannel, IPCSendChannel } from '@main/services/mainIPC.service'
import MainAnalyticsService, { AnalyticsEvent } from '@main/services/mainAnalytics.service';
import Tray from '@main/Tray';
import OnboardingWindow from '@main/OnboardingWindow';
import PreferencesWindow from '@main/PreferencesWindow';
import MainWindow from '@main/MainWindow';
import MainSyncService, { StorageKey } from '@main/services/mainSync.service';

import { UpdateLocation } from '@renderer/services/appWindow';
import { AppWindow } from '@renderer/services/appWindow';
import { PreferencesPage } from '@renderer/Preferences/preferencesPage';
import { GlobalShortcut } from '@renderer/services/globalShortcut';

const port = 3000;
let isPinModeEnabled = isDev ? true : false;

app.disableHardwareAcceleration();

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
      mainWindow = new MainWindow(hideMainWindow);
      mainWindow.isPinModeEnabled = isPinModeEnabled;
      MainIPCService.send(IPCOnChannel.OnPinModeChange, mainWindow.window, { isEnabled: isPinModeEnabled });
    }
  });
}

// Auto-updating
toDesktop.init();
let isUpdateAvailable = false;

toDesktop.autoUpdater.on('update-downloaded', () => {
  isUpdateAvailable = true;

  MainIPCService.send(IPCOnChannel.UpdateAvailable, mainWindow?.window, undefined);
  MainIPCService.send(IPCOnChannel.UpdateAvailable, preferencesWindow?.window, undefined);

  tray?.setIsUpdateAvailable(true);
});

async function restartAndUpdate(location: UpdateLocation) {
  try {
    await MainAnalyticsService.trackAndFlush(AnalyticsEvent.UpdateClicked, { location });
  } catch (error) { }
  if (isUpdateAvailable) {
    toDesktop.autoUpdater.restartAndInstall();
  }
}

// Opening at system login
const hiddenFlagName = '--hidden';

async function setOpenAtLogin(openAtLogin?: boolean) {
  if (isDev) {
    app.setLoginItemSettings({
      openAtLogin: false,
    });
  } else if (process.platform === 'win32' || process.platform === 'darwin') {
    app.setLoginItemSettings({
      openAtLogin,
      openAsHidden: true,
      args: [hiddenFlagName],
    });
  } else if (process.platform === 'linux') {
    const autoLauncher = new AutoLaunch({
      name: 'Devbook',
      // This adds the '--hidden' parameter when starting the app executable on system login.
      isHidden: true,
      // Path to the AppImage cannot be retrieved from the app.getPath('exe'), so we are using a workaround.
      path: process.env.APPIMAGE || app.getPath('exe'),
    });
    return openAtLogin ? autoLauncher.enable() : autoLauncher.disable();
  }
}

function getIsOpeningHidden() {
  if (isDev) return false;

  if (process.platform === 'darwin') {
    return app.getLoginItemSettings().wasOpenedAsHidden;
  }

  if (process.platform === 'win32' || process.platform === 'linux') {
    return process.argv.includes(hiddenFlagName);
  }
}

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

MainAnalyticsService.identify({});

function hideMainWindow() {
  mainWindow?.hide();

  if (!onboardingWindow?.window?.isVisible() && !preferencesWindow?.window?.isVisible() && process.platform === 'darwin') {
    // This action would hide the onboarding and preferences window too, but it is necessary for restoring focus when hiding mainWindow.
    electron.Menu.sendActionToFirstResponder('hide:');
  }
}

function openPreferences(page?: PreferencesPage) {
  if (!preferencesWindow || !preferencesWindow.window) {
    preferencesWindow = new PreferencesWindow(port, () => onboardingWindow?.window?.isVisible(), taskBarIcon, page);
  }
  preferencesWindow.show(page);
  hideMainWindow();
}

const shouldOpenAtLogin = MainSyncService.get(StorageKey.OpenAtLogin);

setOpenAtLogin(shouldOpenAtLogin);

let isFirstRun = MainSyncService.get(StorageKey.FirstRun);

if (process.platform === 'darwin' && !isFirstRun) {
  // Hide the dock icon only when the onboarding process is complete.
  app.dock.hide();
}

// Checks whether the main window is already created and based on this value either creates a new instance
// or just calls .show() or .hide() on an existing instance.
function toggleVisibilityOnMainWindow() {
  if (!mainWindow || !mainWindow.window) {
    mainWindow = new MainWindow(hideMainWindow);
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    MainIPCService.send(IPCOnChannel.DidShowMainWindow, onboardingWindow?.window, undefined);
    return;
  }

  if (mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    mainWindow?.show();
    MainIPCService.send(IPCOnChannel.DidShowMainWindow, mainWindow?.window, undefined);
    MainIPCService.send(IPCOnChannel.DidShowMainWindow, onboardingWindow?.window, undefined);
  }
}

function trySetGlobalShortcut(shortcut: GlobalShortcut) {
  electron.globalShortcut.unregisterAll();

  const success = electron.globalShortcut.register(shortcut, toggleVisibilityOnMainWindow);
  if (!success) {
    // TODO: Instead of quiting app, show users a window where they can choose a new global shortcut.
    electron.dialog.showMessageBox({ message: `We couldn't register shortuct '${shortcut}'. It might be already registered by another app. Please choose another shortcut.` });
    return;
  }

  MainSyncService.set(StorageKey.GlobalShortcut, shortcut);
}

/////////// App Events ///////////
app.once('ready', async () => {
  if (isDev) {
    // Load react dev tools.
    // await electron.session.defaultSession.loadExtension(
    //   path.join(__dirname, '..', '..', '..', 'react-dev-tools-4.9.0_26'),
    // );

    // Enable Electron hot reloading
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit',
    });
  }

  isFirstRun = MainSyncService.get(StorageKey.FirstRun);

  // If user registered a global shortcut from the previos session, load it and register again.
  const savedShortcut = MainSyncService.get(StorageKey.GlobalShortcut);
  if (savedShortcut) {
    trySetGlobalShortcut(savedShortcut);
  }

  tray = new Tray(trayIcon, {
    onShowDevbookClick: toggleVisibilityOnMainWindow,
    // TODO: What if the main window is undefined?
    onOpenAtLoginClick: () => {
      const currentVal = MainSyncService.get(StorageKey.OpenAtLogin);
      MainSyncService.set(StorageKey.OpenAtLogin, !currentVal);
      setOpenAtLogin(!currentVal);
      tray.setOpenAtLogin(!currentVal);
    },
    openPreferences: () => openPreferences(),
    onQuitClick: () => app.quit(),
    shouldOpenAtLogin: MainSyncService.get(StorageKey.OpenAtLogin),
    version: app.getVersion(),
    restartAndUpdate: () => restartAndUpdate(UpdateLocation.Tray),
    isUpdateAvailable,
  });

  if (isFirstRun) {
    mainWindow = new MainWindow(hideMainWindow, true);
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    MainIPCService.send(IPCOnChannel.OnPinModeChange, mainWindow?.window, { isEnabled: isPinModeEnabled });

    onboardingWindow = new OnboardingWindow(taskBarIcon);
    onboardingWindow?.window?.focus();

    MainAnalyticsService.track(AnalyticsEvent.OnboardingStarted, undefined, { searchWindow: mainWindow?.window });
  } else {
    mainWindow = new MainWindow(hideMainWindow, getIsOpeningHidden());
    mainWindow.isPinModeEnabled = isPinModeEnabled;
    MainIPCService.send(IPCOnChannel.OnPinModeChange, mainWindow?.window, { isEnabled: isPinModeEnabled });
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
MainIPCService.handle(IPCInvokeChannel.UpdateStatus, () => isUpdateAvailable);

MainIPCService.on(IPCSendChannel.HideWindow, () => hideMainWindow());
MainIPCService.on(IPCSendChannel.UserDidChangeShortcut, (_, { shortcut }) => trySetGlobalShortcut(shortcut));
MainIPCService.on(IPCSendChannel.ReloadMainWindow, () => mainWindow?.webContents?.reload());
MainIPCService.on(IPCSendChannel.OpenPreferences, (_, { page }) => openPreferences(page));
MainIPCService.on(IPCSendChannel.RestartAndUpdate, (_, { location }) => restartAndUpdate(location));

MainIPCService.on(IPCSendChannel.LoadAppClient, (_, { window }) => {
  if (isDev) {
    if (window === AppWindow.Main) {
      mainWindow?.window?.webContents.loadURL(
        `http://localhost:${port}/index.html`,
        { extraHeaders: 'pragma: no-cache\n' },
      );
    }

    if (window === AppWindow.Onboarding) {
      onboardingWindow?.window?.webContents.loadURL(
        `http://localhost:${port}/index.html#/onboarding`,
        { extraHeaders: 'pragma: no-cache\n' },
      );
    }
  } else {
    if (window === AppWindow.Main) {
      mainWindow?.window?.webContents.loadURL(
        `https://client.usedevbook.com/${app.getVersion()}`,
        { extraHeaders: 'pragma: no-cache\n' },
      );
    }

    if (window === AppWindow.Onboarding) {
      onboardingWindow?.window?.webContents.loadURL(
        `https://client.usedevbook.com/${app.getVersion()}#/onboarding`,
        { extraHeaders: 'pragma: no-cache\n' },
      );
    }
  }
});

MainIPCService.on(IPCSendChannel.FinishOnboarding, () => {
  // TODO: This should be onboardingWindow?.close() but it produces a runtime error when toggling
  // a visibility on the main window.
  onboardingWindow?.hide();
  MainSyncService.set(StorageKey.FirstRun, false);
  isFirstRun = false;
  if (!preferencesWindow?.window?.isVisible() && process.platform === 'darwin') {
    app.dock.hide();
  }
  MainAnalyticsService.track(AnalyticsEvent.OnboardingFinished, undefined, { searchWindow: mainWindow?.window });
  MainAnalyticsService.identify({
    finishedOnboardingAt: new Date()
  }, {
    searchWindow: mainWindow?.window
  });
});

MainIPCService.on(IPCSendChannel.ChangeUserInMain, async (_, { user }: { user: { userID: string, email: string } | undefined }) => {
  if (user) {
    MainAnalyticsService.changeUser(user, { searchWindow: mainWindow?.window });
    MainSyncService.set(StorageKey.Email, user.email);
  } else {
    MainAnalyticsService.changeUser(undefined, { searchWindow: mainWindow?.window });
  }
});

MainIPCService.on(IPCSendChannel.SignOut, (event) => {
  if (event.sender.id !== mainWindow?.window?.id) {
    MainIPCService.send(IPCOnChannel.SignOut, mainWindow?.window, undefined);
  }
});

MainIPCService.on(IPCSendChannel.SetAuthInOtherWindows, (event, { auth }) => {
  if (event.sender.id === mainWindow?.window?.id) {
    MainIPCService.send(IPCOnChannel.SetAuthInOtherWindows, preferencesWindow?.window, { auth });
  }
});

MainIPCService.on(IPCSendChannel.GetAuthFromMainWindow, (event) => {
  if (event.sender.id !== mainWindow?.window?.id) {
    MainIPCService.send(IPCOnChannel.GetAuthFromMainWindow, mainWindow?.window, undefined);
  }
});

MainIPCService.on(IPCSendChannel.OpenSignInModal, () => {
  mainWindow?.show();
  MainIPCService.send(IPCOnChannel.OpenSignInModal, mainWindow?.window, undefined);
});

let postponeHandler: NodeJS.Timeout | undefined;
MainIPCService.on(IPCSendChannel.PostponeUpdate, () => {
  if (isUpdateAvailable) {
    MainAnalyticsService.track(AnalyticsEvent.UpdateCancelClicked, {
      location: UpdateLocation.Banner,
    }, {
      searchWindow: mainWindow?.window,
    });

    if (postponeHandler) {
      clearTimeout(postponeHandler);
    }
    postponeHandler = setTimeout(() => {
      MainIPCService.send(IPCOnChannel.UpdateAvailable, mainWindow?.window, { isReminder: true });
    }, 19 * 60 * 60 * 1000) as unknown as NodeJS.Timeout;
  }
});

MainIPCService.on(IPCSendChannel.TogglePinMode, (_, { isEnabled }: { isEnabled: boolean }) => {
  if (mainWindow) {
    isPinModeEnabled = isEnabled;
    mainWindow.isPinModeEnabled = isEnabled;
    if (isEnabled) {
      MainAnalyticsService.track(AnalyticsEvent.EnablePinMode, undefined, {
        searchWindow: mainWindow?.window,
      });
    } else {
      MainAnalyticsService.track(AnalyticsEvent.DisablePinMode, undefined, {
        searchWindow: mainWindow?.window,
      });
    }
  }
});
