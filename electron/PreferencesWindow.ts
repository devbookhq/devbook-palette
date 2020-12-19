import * as electron from 'electron';
import * as path from 'path';
import * as process from 'process';
import isDev from './utils/isDev';
import { inspect } from 'util';

class PreferencesWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(PORT: number, isOnboardingVisible: () => boolean | undefined, taskBarIcon: electron.NativeImage) {
    this.window = new electron.BrowserWindow({
      width: 850,
      height: 600,
      minWidth: 800,
      minHeight: 400,
      title: 'Devbook Preferencess',
      icon: taskBarIcon,
      backgroundColor: '#1C1B26',
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    if (process.platform === 'linux') {
      this.window.removeMenu();
    }

    //////// Window events ////////
    this.webContents?.on('crashed', (event, killed) => {
      console.error('main window crashed', killed, inspect(event, { depth: null }));
    });

    this.window.on('closed', () => {
      this.window = undefined;
      if (!isOnboardingVisible() && process.platform === 'darwin') {
        electron.app.dock.hide();
      }
    });

    if (isDev) {
      this.window.loadURL(`http://localhost:${PORT}/index.html#/preferences`);
      // Hot Reloading
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
      });
      this.window.webContents.openDevTools();
    } else {
      this.window.loadURL(`file://${__dirname}/../index.html#/preferences`);
    }

    if (process.platform === 'darwin') {
      electron.app.dock.show();
    }
  }

  public close() {
    this.window?.close();
  }

  public hide() {
    this.window?.hide();
  }

  public show() {
    this.window?.show();
  }
}

export default PreferencesWindow;

