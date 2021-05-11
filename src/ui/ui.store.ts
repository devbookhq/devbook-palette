import { makeAutoObservable } from 'mobx';
import { HotkeysEvent } from 'hotkeys-js';

import { useRootStore } from 'App/RootStore';
import IPCService, { IPCOnChannel, IPCSendChannel } from 'services/ipc.service';
import ElectronService from 'services/electron.service';
import { Platform } from 'services/electron.service/platform';
import { Key } from 'components/HotkeyText';
import { SearchSource } from 'services/search.service/searchSource';
import SyncService, { StorageKey } from 'services/sync.service';
import AnalyticsService, { AnalyticsEvent } from 'services/analytics.service';

export function useUIStore() {
  const { uiStore } = useRootStore();
  return uiStore;
}

export enum HotkeyAction {
  Search,
  Hide,
  ToggleHistory,
  HistoryUp,
  HistoryDown,
  SearchHistory,
  SelectStackOverflowSource,
  SelectDocsSource,
  TogglePinMode,
  StackOverflowScrollUp,
  StackOverflowScrollDown,
  StackOverflowModalScrollUp,
  StackOverflowModalScrollDown,
  StackOverflowResultsUp,
  StackOverflowResultsDown,
  StackOverflowOpenModal,
  StackOverflowCloseModal,
  StackOverflowCopyCode,
  StackOverflowModalOpenInBrowser,
  StackOverflowOpenInBrowser,
  DocsScrollUp,
  DocsScrollDown,
  DocsResultsUp,
  DocsResultsDown,
  DocsModalFilterDown,
  DocsModalFilterUp,
  DocsModalFilterSelect,
  DocsOpenModalFilter,
  DocsCloseModalFilter,
  DocsCancelSearchInPage,
  DocsOpenSearchInPage,
  DocsSearchInPageUp,
  DocsSearchInPageDown,
  DocsScrollTop,
  DocsScrollBottom,
}

export type HotKeysBinding = {
  [action in HotkeyAction]: {
    hotkey: string,
    isActive: () => boolean,
    label: string[],
    noRepeat?: boolean,
    action?: string;
    handler?: (k?: KeyboardEvent, h?: HotkeysEvent) => void,
  };
}

class UIStore {
  isStackOverflowModalOpened = false;
  _isSignInModalOpened = false;
  isSearchHistoryVisible = false;
  isPinModeEnabled = false;
  isDocsFilterModalOpened = false;
  isSearchInPageOpened = false;
  _searchSource: SearchSource = SearchSource.StackOverflow;
  _docSearchResultsDefaultWidth: number = 300;
  _docsFilterModalQuery = '';

  hotkeys: HotKeysBinding = {
    [HotkeyAction.Hide]: {
      hotkey: 'esc',
      label: [],
      isActive: () =>
        !this.isSearchInPageOpened &&
        !this.isDocsFilterModalOpened &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.DocsSearchInPageDown]: {
      hotkey: 'enter',
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsSearchInPageUp]: {
      hotkey: 'shift+enter',
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsScrollBottom]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+down',
      } : {
        hotkey: 'ctrl+down',
      },
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.DocsScrollTop]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+up',
      } : {
        hotkey: 'ctrl+up',
      },
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.DocsScrollDown]: {
      hotkey: 'shift+down',
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isSearchHistoryVisible &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.StackOverflowCopyCode]: {
      hotkey: 'alt+shift+1,alt+shift+2,alt+shift+3,alt+shift+4,alt+shift+5,alt+shift+6,alt+shift+7,alt+shift+8,alt+shift+9',
      label: [],
      action: 'Copy code snippet',
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow,
    },
    [HotkeyAction.DocsScrollUp]: {
      hotkey: 'shift+up',
      label: [],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isSearchHistoryVisible &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.DocsOpenModalFilter]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+d',
        label: [Key.Command, 'D'],
      } : {
        hotkey: 'ctrl+d',
        label: ['Ctrl', 'D'],
      },
      action: 'Open docs modal filter',
      isActive: () => this.searchSource === SearchSource.Docs,
    },
    [HotkeyAction.StackOverflowOpenInBrowser]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+o',
        label: [Key.Command, 'O'],
      } : {
        hotkey: 'alt+o',
        label: ['Alt', 'O'],
      },
      action: 'Open SO in browser',
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowModalOpenInBrowser]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+o',
        label: [Key.Command, 'O'],
      } : {
        hotkey: 'alt+o',
        label: ['Alt', 'O'],
      },
      action: 'Open SO in browser',
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        this.isStackOverflowModalOpened,
    },
    [HotkeyAction.DocsCancelSearchInPage]: {
      hotkey: 'esc',
      label: ['Esc'],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isSearchInPageOpened &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.DocsModalFilterSelect]: {
      hotkey: 'enter',
      label: ['Enter'],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isDocsFilterModalOpened &&
        !this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsCloseModalFilter]: {
      hotkey: 'esc',
      label: ['Esc'],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isDocsFilterModalOpened,
    },
    [HotkeyAction.DocsModalFilterDown]: {
      hotkey: 'down',
      label: [Key.ArrowDown],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isDocsFilterModalOpened &&
        !this.isSearchInPageOpened &&
        !this.isSearchHistoryVisible,
    },
    [HotkeyAction.DocsModalFilterUp]: {
      hotkey: 'up',
      label: [Key.ArrowUp],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        this.isDocsFilterModalOpened &&
        !this.isSearchHistoryVisible &&
        !this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsResultsDown]: {
      hotkey: 'down',
      label: [Key.ArrowDown],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isDocsFilterModalOpened &&
        !this.isSearchHistoryVisible &&
        !this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsResultsUp]: {
      hotkey: 'up',
      label: [Key.ArrowUp],
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isSearchHistoryVisible &&
        !this.isDocsFilterModalOpened &&
        !this.isSearchInPageOpened,
    },
    [HotkeyAction.DocsOpenSearchInPage]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+f',
        label: [Key.Command, 'F'],
      } : {
        hotkey: 'ctrl+f',
        label: ['Ctrl', 'F'],
      },
      action: 'Search in docs page',
      isActive: () =>
        this.searchSource === SearchSource.Docs &&
        !this.isSearchInPageOpened &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.StackOverflowOpenModal]: {
      hotkey: 'shift+enter',
      label: [Key.Shift, Key.Enter],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowCloseModal]: {
      hotkey: 'esc',
      label: ['Esc'],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowScrollUp]: {
      hotkey: 'shift+up',
      label: [Key.Shift, Key.ArrowUp],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isSearchHistoryVisible &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowScrollDown]: {
      hotkey: 'shift+down',
      label: [Key.Shift, Key.ArrowDown],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isSearchHistoryVisible &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowResultsUp]: {
      hotkey: 'up',
      label: [Key.ArrowUp],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isSearchHistoryVisible &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowResultsDown]: {
      hotkey: 'down',
      label: [Key.ArrowDown],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        !this.isSearchHistoryVisible &&
        !this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowModalScrollUp]: {
      hotkey: 'up',
      label: [Key.ArrowUp],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        this.isStackOverflowModalOpened,
    },
    [HotkeyAction.StackOverflowModalScrollDown]: {
      hotkey: 'down',
      label: [Key.ArrowDown],
      isActive: () =>
        this.searchSource === SearchSource.StackOverflow &&
        this.isStackOverflowModalOpened,
    },
    [HotkeyAction.Search]: {
      hotkey: 'Enter',
      label: ['Enter'],
      noRepeat: true,
      isActive: () =>
        !this.isSearchHistoryVisible &&
        !this.isSearchInPageOpened &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.SearchHistory]: {
      hotkey: 'Enter',
      label: ['Enter'],
      action: 'Use search history',
      isActive: () =>
        this.isSearchHistoryVisible &&
        !this.isSearchInPageOpened &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.ToggleHistory]: {
      hotkey: 'Tab',
      label: ['Tab'],
      action: 'Toggle search history',
      isActive: () =>
        !this.isStackOverflowModalOpened &&
        !this.isDocsFilterModalOpened,
    },
    [HotkeyAction.HistoryUp]: {
      hotkey: 'up',
      label: [Key.ArrowUp],
      isActive: () =>
        this.isSearchHistoryVisible,
    },
    [HotkeyAction.HistoryDown]: {
      hotkey: 'down',
      label: [Key.ArrowDown],
      isActive: () =>
        this.isSearchHistoryVisible,
    },
    [HotkeyAction.TogglePinMode]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+shift+p',
        label: [Key.Command, Key.Shift, 'P'],
      } : {
        hotkey: 'alt+shift+p',
        label: ['Alt', Key.Shift, 'P'],
      },
      action: 'Toggle pin mode',
      isActive: () => true,
    },
    [HotkeyAction.SelectStackOverflowSource]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+1',
        label: [Key.Command, '1'],
      } : {
        hotkey: 'alt+1',
        label: ['Alt', '1'],
      },
      isActive: () => !this.isSignInModalOpened,
    },
    [HotkeyAction.SelectDocsSource]: {
      ...ElectronService.platform === Platform.MacOS ? {
        hotkey: 'cmd+2',
        label: [Key.Command, '2'],
      } : {
        hotkey: 'alt+2',
        label: ['Alt', '2'],
      },
      isActive: () => !this.isSignInModalOpened,
    },
  };

  registerHotkeyHandler(action: HotkeyAction, handler: (k?: KeyboardEvent, h?: HotkeysEvent) => void) {
    this.hotkeys[action].handler = handler;
  }

  constructor() {
    makeAutoObservable(this);

    IPCService.on(IPCOnChannel.OpenSignInModal, () => {
      this.isSignInModalOpened = true;
      AnalyticsService.track(AnalyticsEvent.SignInModalOpened, undefined);
      this.searchSource = SearchSource.Docs;
    });

    this.sync().then(() => {
      this.backup();
    });
  }

  set docsFilterModalQuery(value: string) {
    this._docsFilterModalQuery = value;
  }

  get docsFilterModalQuery() {
    return this._docsFilterModalQuery;
  }

  get docSearchResultsDefaultWidth() {
    return this._docSearchResultsDefaultWidth;
  }

  set docSearchResultsDefaultWidth(value: number) {
    this._docSearchResultsDefaultWidth = value;
  }

  set isSignInModalOpened(value: boolean) {
    this._isSignInModalOpened = value;
  }

  get isSignInModalOpened() {
    return this._isSignInModalOpened;
  }

  toggleSearchInPage() {
    this.isSearchInPageOpened = !this.isSearchInPageOpened;
  }

  toggleStackOverflowModal() {
    this.isStackOverflowModalOpened = !this.isStackOverflowModalOpened;

    if (this.isStackOverflowModalOpened) AnalyticsService.track(AnalyticsEvent.ModalOpened, undefined);
  }

  toggleDocsFilterModal() {
    this.isDocsFilterModalOpened = !this.isDocsFilterModalOpened;

    if (this.isDocsFilterModalOpened) AnalyticsService.track(AnalyticsEvent.OpenDocsFilter, undefined);
  }

  toggleSignInModal() {
    this.isSignInModalOpened = !this.isSignInModalOpened;

    if (this.isSignInModalOpened) AnalyticsService.track(AnalyticsEvent.SignInModalOpened, undefined);
    else AnalyticsService.track(AnalyticsEvent.SignInModalClosed, undefined);
  }

  toggleSeachHistory() {
    this.isSearchHistoryVisible = !this.isSearchHistoryVisible;

    if (this.isSearchHistoryVisible) AnalyticsService.track(AnalyticsEvent.ShowSearchHistory, undefined);
    else AnalyticsService.track(AnalyticsEvent.HideSearchHistory, undefined);
  }

  togglePinMode() {
    this.isPinModeEnabled = !this.isPinModeEnabled;

    IPCService.send(IPCSendChannel.TogglePinMode, { isEnabled: this.isPinModeEnabled });
  }

  set searchSource(value: SearchSource) {
    this._searchSource = value;
    SyncService.markDirtyKey(StorageKey.SearchFilter);
  }

  get searchSource() {
    return this._searchSource;
  }

  private async sync() {
    const searchSource = await SyncService.get(StorageKey.SearchFilter);
    this.searchSource = searchSource;
  }

  private backup() {
    SyncService.registerBackup(StorageKey.SearchFilter, () => this.searchSource);
  }
}

export default UIStore;
