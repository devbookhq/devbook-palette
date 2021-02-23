import {
  makeAutoObservable,
  observable,
} from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';

import Extension from './extension';
import { ExtensionID } from './extensionID';

export function useExtensionsStore() {
  const { extensionsStore } = useRootStore();
  return extensionsStore;
}

class ExtensionsStore {
  public extensions = observable.map<ExtensionID, Extension>();

  public constructor(private readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      getExtension: false,
    });

    this.enableExtension(ExtensionID.StackOverflow);
  }

  public getExtension(extensionID: ExtensionID) {
    return this.extensions.get(extensionID);
  }

  public async enableExtension(extensionID: ExtensionID) {
    const extension = this.extensions.get(extensionID);
    if (extension?.isReady || extension?.isActive) return;

    this.extensions.set(extensionID, new Extension(this, extensionID));
    this.extensions.get(extensionID)?.onceExit(() => {
      this.extensions.delete(extensionID);
    });

    return new Promise<ExtensionID>((resolve) => this.extensions.get(extensionID)?.onceReady(() => {
      resolve(extensionID);
    }));
  }

  public disableExtension(extensionID: ExtensionID) {
    this.extensions.get(extensionID)?.terminate();
    this.extensions.delete(extensionID);
  }
}

export default ExtensionsStore;
