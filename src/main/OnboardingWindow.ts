import * as electron from 'electron';
import * as path from 'path';
import * as process from 'process';
import { inspect } from 'util';

import serve from './serve';
import isDev from './utils/isDev';

class OnboardingWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(PORT: number, taskBarIcon: electron.NativeImage) {
    this.window = new electron.BrowserWindow({
      width: 1250,
      height: 720,
      minWidth: 800,
      minHeight: 680,
      backgroundColor: '#1C1B26',
      titleBarStyle: 'hiddenInset',
      icon: process.platform === 'linux' || process.platform === 'win32' ? taskBarIcon : undefined,
      title: 'Devbook Onboarding',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    if (process.platform === 'linux' || process.platform === 'win32') {
      this.window.removeMenu();
    }

    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    //////// Window events ////////
    this.window.on('closed', () => {
      this.window = undefined;
    });

    this.window.webContents.on('crashed', (event, killed) => {
      console.error('onboarding window crashed', killed, inspect(event, { depth: null }));
    });

    if (isDev) {
      this.window.loadURL(`http://localhost:${PORT}/index.html#/onboarding`);
      // Hot Reloading
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
      });
      this.window.webContents.openDevTools();
    } else {
      serve(this.window);
      this.window.loadURL(`devbook://index.html#/onboarding`);
      // this.window.loadURL(`file://${__dirname}/../index.html#/onboarding`);
    }
  }

  public close() {
    this.window?.close();
  }

  public hide() {
    this.window?.hide();
  }
}

export default OnboardingWindow;
