import React, {
  createContext,
  useContext,
} from 'react';

import SearchStore from 'Search/search.store';
import UIStore from 'ui/ui.store';
import UserStore from 'user/user.store';

const StoreContext = createContext<RootStore | undefined>(undefined);

export function RootStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={RootStore.instance}>
      {children}
    </StoreContext.Provider>
  );
}

export function useRootStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider');
  }
  return context;
}

class RootStore {
  private static _instance: RootStore;

  readonly searchStore = new SearchStore(this);
  readonly uiStore = new UIStore();
  readonly userStore = new UserStore(this);


  static get instance() {
    return RootStore._instance || (RootStore._instance = new RootStore())
  }

  private contructor() { }
}

export default RootStore;

