import * as electron from 'electron';
import * as process from 'process';
import { debounce } from 'debounce';

import isDev from '@main/utils/isDev';
import MainSyncService, { StorageKey } from '@main/services/mainSync.service';
import MainAnalyticsService, { AnalyticsEvent } from '@main/services/mainAnalytics.service';
import MainIPCService from '@main/services/mainIPC.service';

import { AppWindow } from '@renderer/services/appWindow';
import { IPCOnChannel } from '@renderer/services/ipc.service/onChannel';

class MainWindow {
  public window: electron.BrowserWindow | undefined;
  private _isPinModeEnabled = false;
  private didJustDisablePinMode = false;

  private debounceClear?: any;

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

  public constructor(hideWindow: (window?: electron.BrowserWindow) => void, startHidden?: boolean) {
    const [mainWinWidth, mainWinHeight] = MainSyncService.get(StorageKey.MainWinSize);
    const [mainWinPosX, mainWinPosY] = MainSyncService.get(StorageKey.MainWinPosition);

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

    this.window.on('resize', debounce(() => this.resizeHandler(), 1000));

    this.window.on('moved', () => {
      if (this.window) {
        const [x, y] = this.window.getPosition();
        MainSyncService.set(StorageKey.MainWinPosition, [x, y]);
      }
    });

    this.window.on('close', () => {
      if (!this.window) return;

      const [width, height] = this.window.getSize();
      MainSyncService.set(StorageKey.MainWinSize, [width, height]);

      const [x, y] = this.window.getPosition();
      MainSyncService.set(StorageKey.MainWinPosition, [x, y]);
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
        hideWindow(this.window);
      }
    });

    this.window.on('closed', () => {
      this.window = undefined;
      this.debounceClear?.clear();
      if (process.platform === 'darwin') {
        electron.app.dock.hide();
      }
    });

    this.window.on('ready-to-show', () => {
      MainIPCService.send(IPCOnChannel.OnPinModeChange, this.window, { isEnabled: this._isPinModeEnabled })
    });

    this.window.on('minimize', () => {
      if (process.platform === 'win32' && this._isPinModeEnabled && this.window?.isMinimized()) {
        this.window?.hide();
      }
    });

    this.window.loadURL(`file://${__dirname}/assets/loading.html?window=${AppWindow.Main}`);
    
    if (isDev) {
      this.webContents?.openDevTools();
    }
  }

  private resizeHandler() {
    if (this.window) {
      this.window.webContents.send('console', __dirname);

      const [width, height] = this.window.getSize();
      MainSyncService.set(StorageKey.MainWinSize, [width, height]);
      MainAnalyticsService.identify({}, { searchWindow: this.window });
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
    MainAnalyticsService.track(AnalyticsEvent.ShowedApp, undefined);
  }

  public isVisible() {
    return this.window?.isVisible();
  }
}

export default MainWindow;
