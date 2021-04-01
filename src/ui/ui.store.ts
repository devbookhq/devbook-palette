import {
  makeAutoObservable,
} from 'mobx';
import { useRootStore } from 'App/RootStore';

export function useUIStore() {
  const { uiStore } = useRootStore();
  return uiStore;
}

export default class UIStore {
  isModalOpened = false;
  isSignInModalOpened = false;
  isSearchHistoryVisible = false;
  isPinModeEnabled = false;

  constructor() {
    makeAutoObservable(this);
  }
}

