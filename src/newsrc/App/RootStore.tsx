import React, {
  createContext,
  useContext,
} from 'react';

import TransportLayer from 'newsrc/layers/transportLayer';
import UIStore from 'newsrc/ui/ui.store';
import UserStore from 'newsrc/user/user.store';
import ExtensionsStore from 'newsrc/extensions/extensions.store';
import BoardStore from 'newsrc/NewBoard/board.store';

const StoreContext = createContext<RootStore | undefined>(undefined);

export function RootStoreProvider({ children }: { children: React.ReactNode }) {
  return <StoreContext.Provider value={RootStore.instance}>{children}</StoreContext.Provider>;
}

export function useRootStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider.');
  }
  return context;
}

class RootStore {
  private static _instance: RootStore;

  readonly transportLayer = new TransportLayer();
  readonly uiStore = new UIStore(this);
  readonly userStore = new UserStore(this);
  readonly extensionsStore = new ExtensionsStore(this);
  readonly boardStore = new BoardStore(this);

  static get instance() {
    return RootStore._instance || (RootStore._instance = new RootStore())
  }

  private constructor() {
    // TODO: Load saved UI state asynchronously.
    // Check mobx docs on how to handle async - https://mobx.js.org/actions.html#asynchronous-actions.
    const uiJSON = this.transportLayer.fetchUI();
    this.uiStore.initFromJSON(uiJSON);
  }
}

export default RootStore;
