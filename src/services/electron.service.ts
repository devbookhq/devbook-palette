import { ipcRenderer, shell, app } from 'electron';

class ElectronService {
  private constructor() { }
  static readonly ipcRenderer = ipcRenderer;
  static readonly openLink = shell.openExternal;



  // static get platform() {

  // }

  static get appVersion() {
    return app.getVersion();
  }

  static get isDev() {
    return app.isPackaged;
  }
}

export default ElectronService;
