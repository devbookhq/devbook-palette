import * as electron from 'electron';
import * as path from 'path';
import * as process from 'process';
import { app } from 'electron';

import isDev from './utils/isDev';
import MainIPCService from './services/mainIPC.service';
import { IPCOnChannel } from '../services/ipc.service/onChannel';
import { PreferencesPage } from '../Preferences/preferencesPage';

class PreferencesWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(
    private port: number,
    isOnboardingVisible: () => boolean | undefined,
    taskBarIcon: electron.NativeImage,
    page?: PreferencesPage,
  ) {
    this.window = new electron.BrowserWindow({
      width: 850,
      height: 600,
      minWidth: 800,
      minHeight: 400,
      title: 'Devbook Preferences',
      backgroundColor: '#1C1B26',
      icon: process.platform === 'linux' || process.platform === 'win32' ? taskBarIcon : undefined,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        spellcheck: false,
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    if (process.platform === 'linux' || process.platform === 'win32') {
      this.window.removeMenu();
    }

    //////// Window events ////////
    this.window.on('closed', () => {
      this.window = undefined;
      if (!isOnboardingVisible() && process.platform === 'darwin') {
        electron.app.dock.hide();
      }
    });

    if (isDev) {
      const url = `http://localhost:${this.port}/index.html#/preferences` + (page ? `/${page}` : '');
      this.window.loadURL(url);

      // Hot Reloading
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
      });
      this.window.webContents.openDevTools();
    } else {
      this.window.webContents.loadURL(
        `https://client.usedevbook.com/${app.getVersion()}#/preferences` + (page ? `/${page}` : ''),
        { extraHeaders: 'pragma: no-cache\n' },
      );
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

  public show(page?: PreferencesPage) {
    this.window?.show();
    if (page) {
      MainIPCService.send(IPCOnChannel.GoToPreferencesPage, this.window, { page });
    }
  }
}

export default PreferencesWindow;
