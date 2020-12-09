import * as path from 'path';
import * as process from 'process';
import { inspect } from 'util';
import * as electron from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import {
  BrowserWindow,
  app,
  ipcMain,
} from 'electron';
import tmp from 'tmp';
import keytar from 'keytar';

import isdev from './isdev';
import Tray from './tray';
import OnboardingWindow from './OnboardingWindow';
import OAuth from './OAuth';

const PORT = 3000;

// Set up logs so logging from the main process can be seen in the browser.
function logInRendered(...args: any) {
  mainWindow?.webContents.send('console', args);
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

// Automatically delete temporary files after the application exit.
tmp.setGracefulCleanup();

// https://stackoverflow.com/questions/41664208/electron-tray-icon-change-depending-on-dark-theme
let trayIcon: electron.NativeImage;
if (isdev) {
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
let mainWindow: BrowserWindow | undefined = undefined;
let onboardingWindow: OnboardingWindow | undefined = undefined;

const oauth = new OAuth(
  () => mainWindow?.show(),
  () => electron.Menu.sendActionToFirstResponder('hide:'),
);

oauth.emitter.on('access-token', async ({ accessToken }: { accessToken: string }) => {
  mainWindow?.webContents.send('github-access-token', { accessToken });
  await keytar.setPassword('devbook-github', 'default', accessToken);
});

oauth.emitter.on('error', ({ message }: { message: string }) => {
  mainWindow?.webContents.send('github-error', { message });
});

const store = new Store();
let isAppReady = false;

const shouldOpenAtLogin = store.get('openAtLogin', true);
app.setLoginItemSettings({ openAtLogin: shouldOpenAtLogin });

let isFirstRun = store.get('firstRun', true);

if (process.platform === 'darwin' && !isFirstRun) {
  // Hide the dock icon only when the onboarding process is complete.
  app.dock.hide();
}

function createMainWindow() {
  const [mainWinWidth, mainWinHeight] = store.get('mainWinSize', [900, 500]);
  const [mainWinPosX, mainWinPosY] = store.get('mainWinPosition', [undefined, undefined]);

  mainWindow = new BrowserWindow({
    x: mainWinPosX,
    y: mainWinPosY,
    width: mainWinWidth,
    height: mainWinHeight,
    minWidth: 700,
    minHeight: 400,
    backgroundColor: '#1C1B26',
    alwaysOnTop: true,
    frame: false,
    fullscreenable: false,
    skipTaskbar: true, // This makes sure that Devbook window isn't shown on the bottom taskbar on Windows.
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
      // devTools: isdev,
      // nodeIntegrationInSubFrames: true,
      // webSecurity: false,
      // allowRunningInsecureContent: true,
    },
  });

  mainWindow.on('restore', () => {
    console.log('Window restored');
    if (!mainWindow) { return; }
  });

  mainWindow.on('resize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      store.set('mainWinSize', [width, height]);
    }
  });

  mainWindow.on('moved', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      store.set('mainWinPosition', [x, y]);
    }
  });

  mainWindow.on('close', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      store.set('mainWinSize', [width, height]);
      const [x, y] = mainWindow.getPosition();
      store.set('mainWinPosition', [x, y]);
    }
  });

  mainWindow.on('blur', () => {
    if (!isdev) {
      if (isFirstRun) mainWindow?.hide();
      else electron.Menu.sendActionToFirstResponder('hide:');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('main window crashed', killed, inspect(event, { depth: null }));
  });

  if (isdev) {
    console.log('Development');
    mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
    // Hot Reloading
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit',
    });

    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${__dirname}/../index.html#/`);
  }
}

// Checks whether the main window is already created and based on this value either creates a new instance
// or just calls .show() or .hide() on an existing instance.
function toggleVisibilityOnMainWindow() {
  if (!mainWindow) {
    createMainWindow();
    onboardingWindow?.webContents?.send('did-show-main-window');
    return;
  }

  if (mainWindow.isVisible()) {
    if (isFirstRun) mainWindow.hide();
    else electron.Menu.sendActionToFirstResponder('hide:');
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
  if (isdev) {
    // Load react dev tools.
    await electron.session.defaultSession.loadExtension(
      path.join(__dirname, '..', '..', 'react-dev-tools-4.9.0_26'),
    );
  }

  isFirstRun = store.get('firstRun', true);
  isAppReady = true;

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
    onQuitClick: () => app.quit(),
    shouldOpenAtLogin: store.get('openAtLogin', true),
  });

  if (isFirstRun) {
    onboardingWindow = new OnboardingWindow(PORT);
  } else {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!onboardingWindow?.window) {
    onboardingWindow = new OnboardingWindow(PORT);
  }
  /*
  if (isAppReady && !mainWindow) {
    createMainWindow();
  }
  */
});

app.on('will-quit', () => electron.globalShortcut.unregisterAll());

/////////// IPC events ///////////
ipcMain.on('view-ready', () => {
});

ipcMain.on('hide-window', () => {
  if (isFirstRun) mainWindow?.hide();
  else electron.Menu.sendActionToFirstResponder('hide:');
});

ipcMain.on('user-did-change-shortcut', (event, { shortcut }) => {
  trySetGlobalShortcut(shortcut);
});

ipcMain.on('finish-onboarding', () => {
  // TODO: This should be onboardingWindow?.close() but it produces a runtime error when toggling
  // a visibility on the main window.
  onboardingWindow?.hide();
  store.set('firstRun', false);
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

ipcMain.on('register-default-shortcut', () => {
  const shortcut = store.get('globalShortcut', 'Alt+Space');
  trySetGlobalShortcut(shortcut);
});

ipcMain.on('github-oauth', () => {
  oauth.requestOAuth();
});

ipcMain.handle('github-access-token', () => {
  return keytar.getPassword('devbook-github', 'default');
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
          return resolve({ name, fd })
        });
      });
    });
    return name;
  } catch (error) {
    console.error(error.message);
  }
});
