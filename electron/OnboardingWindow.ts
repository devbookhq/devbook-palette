import * as electron from 'electron';
import * as path from 'path';
import * as process from 'process';
import { inspect } from 'util';

import isDev from './utils/isDev';

class OnboardingWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(PORT: number) {
    this.window = new electron.BrowserWindow({
      width: 1250,
      height: process.platform === 'win32' ? 800 : 720,
      backgroundColor: '#1C1B26',
      titleBarStyle: 'hiddenInset',
      title: 'Devbook Onboarding',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
      },
    });

    if (process.platform === 'win32' || process.platform === 'linux') {
      this.window.removeMenu();
    }
    
    this.window?.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

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
      this.window.loadURL(`file://${__dirname}/../index.html#/onboarding`);
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
