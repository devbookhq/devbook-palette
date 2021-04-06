import {
  makeAutoObservable,
} from 'mobx';
import { useRootStore } from 'App/RootStore';
import IPCService, { IPCSendChannel } from 'services/ipc.service';
import ElectronService from 'services/electron.service';
import { Platform } from 'services/electron.service/platform';
import { Key } from 'components/HotkeyButton';

export function useUIStore() {
  const { uiStore } = useRootStore();
  return uiStore;
}

export enum HotKeyAction {
  'Search',
  'ToggleHistory',
  'HistoryUp',
  'HistoryDown',
  'SearchHistory',
  'SelectStackOverflowSource',
  'SelectDocsSource',
  'TogglePinMode',
}

export type HotKeysBinding = {
  [action in HotKeyAction]: { hotkey: string, isActive: () => boolean, label: string[] };
}

class UIStore {
  isModalOpened = false;
  isSignInModalOpened = false;
  isSearchHistoryVisible = false;
  isPinModeEnabled = false;
  isFilterModalOpened = false;

  hotkeys: HotKeysBinding = {
    [HotKeyAction.Search]: {
      hotkey: 'Enter',
      label: ['Enter'],
      isActive: () => !this.isSearchHistoryVisible,
    },
    [HotKeyAction.SearchHistory]: {
      hotkey: 'Enter',
      label: ['Enter'],
      isActive: () => this.isSearchHistoryVisible,
    },
    [HotKeyAction.ToggleHistory]: {
      hotkey: 'Tab',
      label: ['Tab'],
      isActive: () => true,
    },
    [HotKeyAction.HistoryUp]: {
      hotkey: 'up',
      label: ['Up'],
      isActive: () => this.isSearchHistoryVisible,
    },
    [HotKeyAction.HistoryDown]: {
      hotkey: 'down',
      label: ['Down'],
      isActive: () => this.isSearchHistoryVisible,
    },
    [HotKeyAction.TogglePinMode]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+shift+p',
        label: [Key.Command, Key.Shift, 'P'],
      } : {
        hotkey: 'alt+shift+p',
        label: [Key.Alt, Key.Shift, 'P'],
      },
      isActive: () => true,
    },
    [HotKeyAction.SelectStackOverflowSource]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+1',
        label: [Key.Command, '1'],
      } : {
        hotkey: 'alt+1',
        label: [Key.Alt, '1'],
      },
      isActive: () => true,
    },
    [HotKeyAction.SelectDocsSource]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+2',
        label: [Key.Command, '2'],
      } : {
        hotkey: 'alt+2',
        label: [Key.Alt, '2'],
      },
      isActive: () => true,
    },
  };

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