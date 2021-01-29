import { Extension } from './extension';

export class ExtensionsManager {
  public extensions: { [extensionID: string]: Extension } = {};

  public async enableExtension(extensionID: string) {
    if (this.extensions[extensionID]?.isReady) return;

    this.extensions[extensionID] = new Extension(extensionID);
    this.extensions[extensionID].onceExit(() => delete this.extensions[extensionID]);
    return new Promise<void>((resolve) => this.extensions[extensionID].onceReady(() => resolve()));
  }

  public disableExtension(extensionID: string) {
    this.extensions[extensionID]?.terminate();
    delete this.extensions[extensionID];
  }
}
