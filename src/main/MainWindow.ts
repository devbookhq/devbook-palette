import * as electron from 'electron';
import * as process from 'process';
import ElectronStore from 'electron-store';
import * as path from 'path';
import { inspect } from 'util';

import isDev from './utils/isDev';
import { IPCMessage } from '../mainCommunication/ipc';

class MainWindow {
  public window: electron.BrowserWindow | undefined;
  private _isPinModeEnabled = false;
  private didJustDisablePinMode = false;

  public set isPinModeEnabled(value: boolean) {
    if (!this.window) return;

    this._isPinModeEnabled = value;
    if (!value) {
      this.didJustDisablePinMode = true;
    }
    if (process.platform === 'darwin') {
      if (value) {
        electron.app.dock.show()
      } else {
        electron.app.dock.hide()
      }
    } else {
      if (value) {
        this.window.setSkipTaskbar(false);
      } else {
        this.window.setSkipTaskbar(true);
      }
    }
  }

  public get webContents() {
    return this.window?.webContents;
  }

  public constructor(PORT: number, store: ElectronStore, hideWindow: () => void, private trackShowApp: () => void, startHidden?: boolean) {
    const [mainWinWidth, mainWinHeight] = store.get('mainWinSize', [900, 500]);
    const [mainWinPosX, mainWinPosY] = store.get('mainWinPosition', [undefined, undefined]);

    this.window = new electron.BrowserWindow({
      x: mainWinPosX,
      y: mainWinPosY,
      width: mainWinWidth,
      height: mainWinHeight,
      minWidth: 860,
      minHeight: 400,
      show: !startHidden,
      backgroundColor: '#1C1B26',
      alwaysOnTop: true,
      frame: false,
      fullscreenable: false,
      skipTaskbar: true, // This makes sure that Devbook window isn't shown on the bottom taskbar on Windows.
      title: 'Devbook',
      minimizable: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        worldSafeExecuteJavaScript: true,
        contextIsolation: false,
        spellcheck: false,
      },
    });

    this.window.setAlwaysOnTop(true, 'main-menu');
    this.window.setSkipTaskbar(true);
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this.window.on('restore', () => {
      if (!this.window) { return; }
    })

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
      // Calling 'app.doc.hide()' triggers the 'blur' event.
      // This is a hack so the window doesn't close when a user disables
      // the pin mode.
      // We want to ignore this particular instance of the 'blur' event
      // and don't close the window.
      // TODO: There's a problem though, that the window looses its focus
      // and we haven't been able to find a way to re-focus the window again.
      if (this.didJustDisablePinMode) {
        this.didJustDisablePinMode = false;
        return;
      }

      if (!this._isPinModeEnabled) {
        hideWindow();
      }
    });

    this.window.on('closed', () => {
      this.window = undefined;
      if (process.platform === 'darwin') {
        electron.app.dock.hide();
      }
    });

    this.window.on('ready-to-show', () => {
      this.window?.webContents?.send(IPCMessage.OnPinModeChange, { isEnabled: this._isPinModeEnabled });
    });

    this.window.on('minimize', () => {
      if (process.platform === 'win32' && this._isPinModeEnabled && this.window?.isMinimized()) {
        this.window?.hide();
      }
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
    if (process.platform === 'win32' && this._isPinModeEnabled && this.window?.isMinimized()) return;
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
