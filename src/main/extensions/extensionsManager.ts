import { EventEmitter } from 'events';
import { Extension } from './extension';

export enum ExtensionID {
  StackOverflow = 'stackoverflow',
  Documentations = 'docs',
}

export class ExtensionsManager {
  public extensions: { [extensionID in ExtensionID]?: Extension } = {};
  public emitter = new EventEmitter();

  public async enableExtension(extensionID: ExtensionID) {
    if (this.extensions[extensionID]?.isReady) return;

    this.extensions[extensionID] = new Extension(extensionID);
    this.extensions[extensionID]?.onceExit(() => {
      delete this.extensions[extensionID];
      this.emitter.emit('changed', this);
    });
    return new Promise<ExtensionID>((resolve) => this.extensions[extensionID]?.onceReady(() => {
      resolve(extensionID);
      this.emitter.emit('changed', this);
    }));
  }

  public disableExtension(extensionID: ExtensionID) {
    this.extensions[extensionID]?.terminate();
    delete this.extensions[extensionID];
  }
}
