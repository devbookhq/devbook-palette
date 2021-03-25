import * as electron from 'electron';
import * as path from 'path';
import { inspect } from 'util';
import * as process from 'process';

import isDev from './utils/isDev';
import { IPCMessage } from '../mainCommunication/ipc';
// import axios from 'axios';
const { version } = require('../../../package.json');

export enum PreferencesPage {
  General = 'general',
  Account = 'account',
}

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
      const url = `http://localhost:${this.port}/index.html#/preferences` + (page ? `/${page}` : '');
      this.window.loadURL(url);

      /*
      this.window.loadURL(`http://localhost:${this.port}/loading.html#/preferences` + (page ? `/${page}` : ''));
      this.window.webContents.on('did-finish-load', async () => {
        axios.get('https://storage.googleapis.com/testing-js-bundle/static/css/main.9ba11604.css')
        .then(response => {
          this.window?.webContents.send('content', { css: response.data });
        })
        axios.get('https://storage.googleapis.com/testing-js-bundle/static/js/main.806b35ed.js')
        .then(response => {
          this.window?.webContents.send('content', { bundle: response.data });
        });
      });
      */

      // Hot Reloading
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        forceHardReset: true,
        hardResetMethod: 'exit',
      });
      this.window.webContents.openDevTools();
    } else {
      this.window.loadURL(`file://${__dirname}/assets/loading.html`);
      const url = `https://client.usedevbook.com/${version}`;
      this.window.loadURL(url);
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
      this.window?.webContents?.send(IPCMessage.GoToPreferencesPage, { page });
    }
  }
}

export default PreferencesWindow;
