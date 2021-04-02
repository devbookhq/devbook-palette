import ElectronStore from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

import { SearchMode } from '../Preferences/Pages/searchMode';

// Initialize IPC communication so the electron-store works in renderers
ElectronStore.initRenderer();

enum StoreKey {
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
}

type StoreValue = {
  [StoreKey.OpenAtLogin]: boolean,
  [StoreKey.FirstRun]: boolean,
  [StoreKey.Email]: string | undefined,
  [StoreKey.IsPinModeEnabled]: boolean,
  [StoreKey.ActiveDocSource]: string | undefined,
  [StoreKey.SearchMode]: SearchMode,
  [StoreKey.GlobalShortcut]: string,
  [StoreKey.LastQuery]: string,
  [StoreKey.SearchFilter]: string,
  [StoreKey.DocSearchResultsDefaultWidth]: number,
  [StoreKey.MainWinSize]: [number, number],
  [StoreKey.MainWinPosition]: [number, number],
  [StoreKey.UserID]: string,
}

type StoreRecord = {
  [key in StoreKey]: StoreValue[key]
}

export default class LocalStore {
  private static electronStore = new ElectronStore<StoreRecord>({
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
    },
  });

  static get openAtLogin() {
    return this.electronStore.get(StoreKey.OpenAtLogin);
  }

  static get firstRun() {
    return this.electronStore.get(StoreKey.FirstRun);
  }

  static get email() {
    return this.electronStore.get(StoreKey.Email);
  }

  static get activeDocSource() {
    return this.electronStore.get(StoreKey.ActiveDocSource);
  }

  static get searchMode() {
    return this.electronStore.get(StoreKey.SearchMode);
  }

  static get isPinModeEnabled() {
    return this.electronStore.get(StoreKey.IsPinModeEnabled);
  }

  static get globalShortcut() {
    return this.electronStore.get(StoreKey.GlobalShortcut);
  }

  static get lastQuery() {
    return this.electronStore.get(StoreKey.LastQuery);
  }

  static get searchFilter() {
    return this.electronStore.get(StoreKey.SearchFilter);
  }

  static get docSearchResultsDefaultWidth() {
    return this.electronStore.get(StoreKey.DocSearchResultsDefaultWidth);
  }

  static get mainWinSize() {
    return this.electronStore.get(StoreKey.MainWinSize);
  }

  static get mainWinPosition() {
    return this.electronStore.get(StoreKey.MainWinPosition);
  }

  static get userID() {
    return this.electronStore.get(StoreKey.UserID);
  }

  static set openAtLogin(value: StoreValue[StoreKey.OpenAtLogin]) {
    this.electronStore.set(StoreKey.OpenAtLogin, value);
  }

  static set firstRun(value: StoreValue[StoreKey.FirstRun]) {
    this.electronStore.set(StoreKey.FirstRun, value);
  }

  static set email(value: StoreValue[StoreKey.Email]) {
    this.electronStore.set(StoreKey.Email, value);
  }

  static set activeDocSource(value: StoreValue[StoreKey.ActiveDocSource]) {
    this.electronStore.set(StoreKey.ActiveDocSource, value);
  }

  static set searchMode(value: StoreValue[StoreKey.SearchMode]) {
    this.electronStore.set(StoreKey.SearchMode, value);
  }

  static set isPinModeEnabled(value: StoreValue[StoreKey.IsPinModeEnabled]) {
    this.electronStore.set(StoreKey.IsPinModeEnabled, value);
  }

  static set globalShortcut(value: StoreValue[StoreKey.GlobalShortcut]) {
    this.electronStore.set(StoreKey.GlobalShortcut, value);
  }

  static set lastQuery(value: StoreValue[StoreKey.LastQuery]) {
    this.electronStore.set(StoreKey.LastQuery, value);
  }

  static set searchFilter(value: StoreValue[StoreKey.SearchFilter]) {
    this.electronStore.set(StoreKey.SearchFilter, value);
  }

  static set docSearchResultsDefaultWidth(value: StoreValue[StoreKey.DocSearchResultsDefaultWidth]) {
    this.electronStore.set(StoreKey.DocSearchResultsDefaultWidth, value);
  }

  static set mainWinSize(value: StoreValue[StoreKey.MainWinSize]) {
    this.electronStore.set(StoreKey.MainWinSize, value);
  }

  static set mainWinPosition(value: StoreValue[StoreKey.MainWinPosition]) {
    this.electronStore.set(StoreKey.MainWinPosition, value);
  }

  static set userID(value: StoreValue[StoreKey.UserID]) {
    this.electronStore.set(StoreKey.UserID, value);
  }
}
