import { Environment } from './environment';
import { Platform } from './platform';

const electron = window.require('electron') as typeof import('electron');

class ElectronService {
  private constructor() { }
  static readonly ipcRenderer = electron.ipcRenderer;
  static readonly openLink = electron.shell.openExternal;

  static readonly platform = ElectronService.getPlatform();
  static readonly appVersion = ElectronService.getVersion();
  static readonly environment = ElectronService.getEnvironment();
  static readonly isDev = ElectronService.environment === Environment.Production;

  private static getPlatform() {
    switch (electron.remote.process.platform) {
      case 'darwin':
        return Platform.MacOS;
      case 'win32':
        return Platform.Windows;
      case 'linux':
        return Platform.Linux;
      default:
        return Platform.Windows;
    };
  }

  private static getVersion() {
    const version = electron.remote.app.getVersion();
    if (!version) {
      throw new Error('Cannot get the app version.');
    }
    return version;
  }

  private static getEnvironment() {
    return electron.remote.app.isPackaged ? Environment.Production : Environment.Development;
  }
}

export default ElectronService;
