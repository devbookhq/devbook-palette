import React from 'react';

import TransportLayer from 'newsrc/layers/TransportLayer';
import UIStore from 'newsrc/ui/ui.store';
import UserStore from 'newsrc/user/user.store';
import BoardStore from 'newsrc/NewBoard/board.store';

const transport = new TransportLayer();

let store: RootStore;
const StoreContext = React.createContext<RootStore | undefined>(undefined);

export function RootStoreProvider({ children }: { children: React.ReactNode }) {
  store = store ?? new RootStore(transport);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useRootStore() {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider.');
  }
  return context;
}

export default class RootStore {
  transportLayer: TransportLayer;
  uiStore: UIStore;
  userStore: UserStore;
  boardStore: BoardStore;

  constructor(transportLayer: TransportLayer) {
    this.transportLayer = transportLayer;

    this.uiStore = new UIStore(this);
    // TODO: Load saved UI state asynchronously.
    // Check mobx docs on how to handle async.
    const uiJSON = this.transportLayer.fetchUI();
    this.uiStore.initFromJSON(uiJSON);

    this.userStore = new UserStore(this);
    this.boardStore = new BoardStore(this);
  }
}


