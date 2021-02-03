import { EventEmitter } from 'events';
import { Extension } from './extension';

export class ExtensionsManager {
  public extensions: { [extensionID: string]: Extension } = {};
  public emitter = new EventEmitter();

  public async enableExtension(extensionID: string) {
    if (this.extensions[extensionID]?.isReady) return;

    this.extensions[extensionID] = new Extension(extensionID);
    this.extensions[extensionID].onceExit(() => {
      delete this.extensions[extensionID];
      this.emitter.emit('changed', this);
    });
    return new Promise<Extension>((resolve) => this.extensions[extensionID].onceReady(() => {
      resolve(this.extensions[extensionID]);
      console.log('extension', extensionID, 'ready');  
      this.emitter.emit('changed', this);
    }));
  }

  public disableExtension(extensionID: string) {
    this.extensions[extensionID]?.terminate();
    delete this.extensions[extensionID];
  }
}
