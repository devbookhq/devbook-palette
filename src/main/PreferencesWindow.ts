import * as electron from 'electron';
import * as process from 'process';
import { app } from 'electron';

import isDev from '@main/utils/isDev';
import MainIPCService from '@main/services/mainIPC.service';

import { IPCOnChannel } from '@renderer/services/ipc.service/onChannel';
import { PreferencesPage } from '@renderer/Preferences/preferencesPage';

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
      this.window.loadURL(`http://localhost:${this.port}/index.html#/preferences` + (page ? `/${page}` : ''));
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
