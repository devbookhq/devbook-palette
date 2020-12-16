import * as electron from 'electron';
import ElectronStore from 'electron-store';
import * as path from 'path';
import { inspect } from 'util';

import isDev from './utils/isDev';

class MainWindow {
  public window: electron.BrowserWindow | undefined;

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(PORT: number, store: ElectronStore, hideWindow: () => void, private trackShowApp: () => void) {
    const [mainWinWidth, mainWinHeight] = store.get('mainWinSize', [900, 500]);
    const [mainWinPosX, mainWinPosY] = store.get('mainWinPosition', [undefined, undefined]);

    this.window = new electron.BrowserWindow({
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
      title: 'Devbook',
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
        // devTools: isDev,
        // nodeIntegrationInSubFrames: true,
        // webSecurity: false,
        // allowRunningInsecureContent: true,
      },
    });

    this?.window?.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this.window.on('restore', () => {
      console.log('Window restored');
      if (!this.window) { return; }
    });

    this.window.on('resize', () => {
      if (this.window) {
        const [width, height] = this.window.getSize();
        store.set('mainWinSize', [width, height]);
      }
    });

    this.window.on('moved', () => {
      if (this.window) {
        const [x, y] = this.window.getPosition();
        store.set('mainWinPosition', [x, y]);
      }
    });

    this.window.on('close', () => {
      if (this.window) {
        const [width, height] = this.window.getSize();
        store.set('mainWinSize', [width, height]);
        const [x, y] = this.window.getPosition();
        store.set('mainWinPosition', [x, y]);
      }
    });

    this.window.on('blur', () => {
      if (!isDev) {
        hideWindow();
      }
    });

    this.window.on('closed', () => {
      this.window = undefined;
    });

    this.webContents?.on('crashed', (event, killed) => {
      console.error('main window crashed', killed, inspect(event, { depth: null }));
    });

    if (isDev) {
      this.window.loadURL(`http://localhost:${PORT}/index.html`);
      // Hot Reloading
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
      });

      this.webContents?.openDevTools();
    } else {
      this.window.loadURL(`file://${__dirname}/../index.html#/`);
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
    this.trackShowApp();
  }

  public isVisible() {
    return this.window?.isVisible();
  }
}

export default MainWindow;
