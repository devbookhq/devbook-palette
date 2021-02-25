import {
  autorun,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';

import Extension from './extension';
import { killAllExtensionProcesses } from './extension.ipc';
import { ExtensionType } from './extensionType';

export function useExtensionsStore() {
  const { extensionsStore } = useRootStore();
  return extensionsStore;
}

class ExtensionsStore {
  _extensions = observable.array<Extension>();

  constructor(readonly _rootStore: RootStore) {
    makeAutoObservable(this, {
      _rootStore: false,
      getExtension: false,
    });

    autorun(() => {
      console.log('Extensions:', [...this._extensions.map(e => `${e.extensionID} - ${e.extensionType}`)]);
    });

    killAllExtensionProcesses();

    this.createExtension(ExtensionType.StackOverflow);
  }

  getExtension(extensionID: string) {
    return this._extensions.find(e => e.extensionID === extensionID);
  }

  async createExtension(extensionType: ExtensionType, extensionID?: string) {
    const extension = new Extension(this, extensionType, extensionID);

    this._extensions.push(extension);
    extension.onceExit(() => {
      runInAction(() => {
        const index = this._extensions.indexOf(extension);
        if (index > -1) this._extensions.splice(index, 1);
      });
    });
    return new Promise<Extension>((resolve) => extension.onceReady(() => resolve(extension)));
  }

  async deleteExtension(extensionID: string) {
    const extension = this.getExtension(extensionID);
    if (!extension) return;

    const extensionDeletedPromise = new Promise<void>((resolve) => extension.onceExit(() => resolve()));

    extension.terminate();

    const index = this._extensions.indexOf(extension);
    if (index > -1) this._extensions.splice(index, 1);

    return extensionDeletedPromise;
  }
}

export default ExtensionsStore;
