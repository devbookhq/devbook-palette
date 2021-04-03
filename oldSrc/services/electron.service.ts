const electron = window.require('electron') as typeof import('electron');

export enum NodePackage {
  'AnalyticsNode' = 'analytics-node',
}

type NodePackageTypings = {
  [NodePackage.AnalyticsNode]: typeof import('analytics-node');
};

type NodePackageMap = {
  [nodePackage in NodePackage]: NodePackageTypings[nodePackage];
}

class ElectronService {
  private constructor() { }
  private static readonly app = electron.app || electron.remote.app;
  private static readonly isEnvSet = 'ELECTRON_IS_DEV' in electron.remote.process.env;
  private static readonly getFromEnv = parseInt(electron.remote.process.env.ELECTRON_IS_DEV || '0', 10) === 1;

  static readonly analytics = electron.remote.require('analytics-node') as typeof import('analytics-node');
  static readonly crypto = electron.remote.require('crypto') as typeof import('crypto');
  static readonly querystring = electron.remote.require('querystring') as typeof import('querystring');

  static readonly ipcMain = electron.ipcMain;
  static readonly ipcRenderer = electron.ipcRenderer;
  static readonly openLink = electron.shell.openExternal;

  static get isDev() {
    return this.isEnvSet ? this.getFromEnv : !this.app.isPackaged;
  }

  static require<T extends NodePackage>(nodePackage: T): NodePackageMap[T] {
    return electron.remote.require(nodePackage);
  }
}

export default ElectronService;
