import {
  makeAutoObservable,
} from 'mobx';
import { useRootStore } from 'App/RootStore';

export function useShortcutsStore() {
  const { shortcutsStore } = useRootStore();
  return shortcutsStore;
}

class ShortcutsStore {
  constructor() {
    makeAutoObservable(this);
  }
}

export default ShortcutsStore;
