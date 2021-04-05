import {
  makeAutoObservable,
} from 'mobx';
import { useRootStore } from 'App/RootStore';
import IPCService, { IPCSendChannel } from 'services/ipc.service';

export function useUIStore() {
  const { uiStore } = useRootStore();
  return uiStore;
}

class UIStore {
  isModalOpened = false;
  isSignInModalOpened = false;
  isSearchHistoryVisible = false;
  isPinModeEnabled = false;
  isFilterModalOpened = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleModal() {
    this.isModalOpened = !this.isModalOpened;
  }

  toggleFilterModal() {
    this.isModalOpened = !this.isModalOpened;
  }

  toggleSignInModal() {
    this.isSignInModalOpened = !this.isSignInModalOpened;
  }

  toggleSeachHistory() {
    this.isSearchHistoryVisible = !this.isSearchHistoryVisible;
  }

  togglePinMode() {
    this.isPinModeEnabled = !this.isPinModeEnabled;
    IPCService.send(IPCSendChannel.TogglePinMode, { isEnabled: this.isPinModeEnabled });
  }
}

export default UIStore;