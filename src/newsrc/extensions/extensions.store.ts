import {
  autorun,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';

import Extension from './extension';
import { killAllExtensionProcesses } from './extension.ipc';
import { ExtensionID } from './extensionID';

export function useExtensionsStore() {
  const { extensionsStore } = useRootStore();
  return extensionsStore;
}

class ExtensionsStore {
  _extensions = observable.map<ExtensionID, Extension>();

  constructor(readonly _rootStore: RootStore) {
    makeAutoObservable(this, {
      _rootStore: false,
      getExtension: false,
    });

    autorun(() => {
      console.log('Extensions:', [...this._extensions.keys()]);
    });

    killAllExtensionProcesses();

    this.enableExtension(ExtensionID.StackOverflow);
  }

  getExtension(extensionID: ExtensionID) {
    return this._extensions.get(extensionID);
  }

  async enableExtension(extensionID: ExtensionID) {
    const extension = this._extensions.get(extensionID);
    if (extension?.isReady || extension?.isActive) return;

    this._extensions.set(extensionID, new Extension(this, extensionID));
    this._extensions.get(extensionID)?.onceExit(() => {
      runInAction(() => {
        this._extensions.delete(extensionID);
      });
    });

    return new Promise<ExtensionID>((resolve) => this._extensions.get(extensionID)?.onceReady(() => {
      resolve(extensionID);
    }));
  }

  disableExtension(extensionID: ExtensionID) {
    this._extensions.get(extensionID)?.terminate();
    this._extensions.delete(extensionID);
  }
}

export default ExtensionsStore;
