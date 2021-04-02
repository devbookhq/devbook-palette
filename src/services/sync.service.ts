import ElectronStore from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

import { SearchMode } from '../Preferences/Pages/searchMode';

export enum SyncStorageKey {
  Email = 'email',
  IsPinModeEnabled = 'isPinModeEnabled',
  ActiveDocSource = 'activeDocSource',
  SearchMode = 'searchMode',
  OpenAtLogin = 'openAtLogin',
  FirstRun = 'firstRun',
  GlobalShortcut = 'globalShortcut',
  LastQuery = 'lastQuery',
  SearchFilter = 'searchFilter',
  DocSearchResultsDefaultWidth = 'docSearchResultsDefaultWidth',
  MainWinSize = 'mainWinSize',
  MainWinPosition = 'mainWinPosition',
  UserID = 'userID',
  RefreshToken = 'refreshToken',
}

type SyncStorageValueTypings = {
  [SyncStorageKey.OpenAtLogin]: boolean;
  [SyncStorageKey.FirstRun]: boolean;
  [SyncStorageKey.Email]: string | undefined;
  [SyncStorageKey.IsPinModeEnabled]: boolean;
  [SyncStorageKey.ActiveDocSource]: string | undefined;
  [SyncStorageKey.SearchMode]: SearchMode;
  [SyncStorageKey.GlobalShortcut]: string;
  [SyncStorageKey.LastQuery]: string;
  [SyncStorageKey.SearchFilter]: string;
  [SyncStorageKey.DocSearchResultsDefaultWidth]: number;
  [SyncStorageKey.MainWinSize]: [number, number];
  [SyncStorageKey.MainWinPosition]: [number, number];
  [SyncStorageKey.UserID]: string;
  [SyncStorageKey.RefreshToken]: string;
};

type SyncStorageMap = {
  [key in SyncStorageKey]: SyncStorageValueTypings[key];
}

class SyncService {
  private constructor() { }
  private static readonly electronStore = new ElectronStore<SyncStorageMap>({
    schema: {
      openAtLogin: {
        type: 'boolean',
        default: true,
      },
      firstRun: {
        type: 'boolean',
        default: true,
      },
      email: {
        type: 'string',
      },
      activeDocSource: {
        type: 'string',
        default: undefined,
      },
      globalShortcut: {
        type: 'string',
        default: 'Alt+Space',
      },
      isPinModeEnabled: {
        type: 'boolean',
        default: false,
      },
      searchMode: {
        type: 'string',
        default: SearchMode.OnEnterPress,
      },
      lastQuery: {
        type: 'string',
        default: '',
      },
      searchFilter: {
        type: 'string',
        default: '',
      },
      docSearchResultsDefaultWidth: {
        type: 'integer',
        default: 200,
      },
      mainWinSize: {
        type: ['integer'],
        default: [900, 500]
      },
      mainWinPosition: {
        type: ['integer'],
        default: [undefined, undefined]
      },
      userID: {
        type: 'string',
        default: uuidv4(),
      },
      refreshToken: {
        type: 'string',
        default: '',
      },
    },
  });

  static get<T extends SyncStorageKey>(key: T): SyncStorageMap[T] {
    return SyncService.electronStore.get(key);
  }

  static set<T extends SyncStorageKey>(key: T, value: SyncStorageMap[T]) {
    return SyncService.electronStore.set(key, value);
  }
}

export default SyncService;
