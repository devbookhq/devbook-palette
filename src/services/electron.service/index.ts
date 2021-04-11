import { Environment } from './environment';
import { Platform } from './platform';

const electron = window.require('electron') as typeof import('electron');

class ElectronService {
  private constructor() { }
  static readonly ipcRenderer = electron.ipcRenderer;
  static readonly openLink = electron.shell.openExternal;
  static readonly writeClipboard = electron.clipboard.writeText;

  static readonly platform = ElectronService.getPlatform();
  static readonly appVersion = ElectronService.getVersion();
  static readonly environment = ElectronService.getEnvironment();
  static readonly isDev = ElectronService.environment === Environment.Development;
  static readonly isProd = ElectronService.environment === Environment.Production;
  static readonly isStaging = ElectronService.environment === Environment.Staging;

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
    const environment = process.env.REACT_APP_ENVIRONMENT;
    switch (environment) {
      case Environment.Development:
      case Environment.Production:
      case Environment.Staging:
        return environment;
      default:
        throw new Error(`Unknown environment ${environment}`);
    }
  }
}

export default ElectronService;
