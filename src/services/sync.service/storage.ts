import { GlobalShortcut } from 'services/globalShortcut';
import { SearchMode } from 'services/search.service/searchMode';

export enum StorageKey {
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

export type StorageValue = {
  [StorageKey.OpenAtLogin]: boolean;
  [StorageKey.FirstRun]: boolean;
  [StorageKey.Email]: string | undefined;
  [StorageKey.IsPinModeEnabled]: boolean;
  [StorageKey.ActiveDocSource]: string | undefined;
  [StorageKey.SearchMode]: SearchMode;
  [StorageKey.GlobalShortcut]: GlobalShortcut;
  [StorageKey.LastQuery]: string;
  [StorageKey.SearchFilter]: string;
  [StorageKey.DocSearchResultsDefaultWidth]: number;
  [StorageKey.MainWinSize]: [number, number];
  [StorageKey.MainWinPosition]: [number, number];
  [StorageKey.UserID]: string;
  [StorageKey.RefreshToken]: string;
};

export type Storage = {
  [key in StorageKey]: StorageValue[key];
}
