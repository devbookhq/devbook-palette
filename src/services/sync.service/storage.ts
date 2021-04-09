import { GlobalShortcut } from 'services/globalShortcut';
import { SearchSource } from 'services/search.service/searchSource';
import { DocSource } from 'services/search.service/docSource';
import { HistoryEntry } from "Search/historyEntry";

export enum StorageKey {
  Email = 'email',
  SearchHistoryEntries = 'searchHistoryEntries',
  IsPinModeEnabled = 'isPinModeEnabled',
  ActiveDocSource = 'activeDocSource',
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
  [StorageKey.ActiveDocSource]: DocSource | undefined;
  [StorageKey.GlobalShortcut]: GlobalShortcut;
  [StorageKey.LastQuery]: string;
  [StorageKey.SearchFilter]: SearchSource;
  [StorageKey.DocSearchResultsDefaultWidth]: number;
  [StorageKey.MainWinSize]: [number, number];
  [StorageKey.MainWinPosition]: [number, number];
  [StorageKey.UserID]: string;
  [StorageKey.RefreshToken]: string;
  [StorageKey.SearchHistoryEntries]: HistoryEntry[];
};

export type Storage = {
  [key in StorageKey]: StorageValue[key];
}
