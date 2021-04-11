import * as electron from 'electron';
import * as process from 'process';

import { AppWindow } from '@renderer/services/appWindow';

class OnboardingWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(taskBarIcon: electron.NativeImage) {
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

    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    //////// Window events ////////
    this.window.on('closed', () => {
      this.window = undefined;
    });

    this.window.loadURL(`file://${__dirname}/assets/loading.html?window=${AppWindow.Onboarding}`);
  }

  public close() {
    this.window?.close();
  }

  public hide() {
    this.window?.hide();
  }
}

export default OnboardingWindow;
