import ElectronStore from 'electron-store';

import MainIPCService, { IPCInvokeChannel, IPCSendChannel } from 'services/ipc.service/mainIPC.service';

import { StorageKey, StorageValue, Storage } from 'services/sync.service/storage';
import { isDev } from 'main/utils/environment';
import { app } from 'electron';
import path from 'path';
import { SearchSource } from 'services/search.service/searchSource';

const appDataFolder = 'com.foundrylabs.devbook';

const historyStore = new ElectronStore<Pick<Storage, StorageKey.SearchHistoryEntries>>({
  cwd: path.resolve(app.getPath('userData'), '..', `${appDataFolder}${isDev ? '.dev' : ''}`),
  name: 'history',
  schema: {
    searchHistoryEntries: {
      type: 'array',
      properties: {
        query: { type: 'string' },
      },
      default: [],
    },
  },
});

const electronStore = new ElectronStore<Storage>({
  cwd: path.resolve(app.getPath('userData'), '..', `${appDataFolder}${isDev ? '.dev' : ''}`),
  schema: {
    searchHistoryEntries: {
      type: 'array',
    },
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
      default: undefined,
    },
    activeDocSource: {
      type: ['object', 'null'],
      properties: {
        slug: { type: 'string' },
        name: { type: 'string' },
        version: { type: 'string' },
        iconURL: { type: 'string' },
      },
      default: null,
    },
    globalShortcut: {
      type: 'string',
      default: 'Alt+Space',
    },
    isPinModeEnabled: {
      type: 'boolean',
      default: false,
    },
    lastQuery: {
      type: 'string',
      default: '',
    },
    searchFilter: {
      type: 'string',
      default: SearchSource.StackOverflow,
    },
    docSearchResultsDefaultWidth: {
      type: 'integer',
      default: 200,
    },
    mainWinSize: {
      type: ['array'],
      items: {
        anyOf: [
          { type: 'integer' },
          { type: 'null' },
        ],
      },
      default: [900, 500],
    },
    mainWinPosition: {
      type: ['array'],
      items: {
        anyOf: [
          { type: 'integer' },
          { type: 'null' },
        ],
      },
      default: [null, null],
    },
    userID: {
      type: 'string',
    },
    refreshToken: {
      type: 'string',
      default: '',
    },
  },
});

class MainSyncService {
  static get<T extends StorageKey>(key: T): StorageValue[T] {
    if (key === StorageKey.SearchHistoryEntries) return historyStore.get(StorageKey.SearchHistoryEntries) as StorageValue[T];
    return electronStore.get(key);
  }

  private static delete<T extends StorageKey>(key: T) {
    if (key === StorageKey.SearchHistoryEntries) return historyStore.delete(StorageKey.SearchHistoryEntries);
    return electronStore.delete(key);
  }

  static set<T extends StorageKey>(key: T, value: StorageValue[T]) {
    if (value === undefined) {
      return MainSyncService.delete(key);
    }
    if (key === StorageKey.SearchHistoryEntries) {
      return historyStore.set(key, value);
    }
    return electronStore.set(key, value);
  }
}

MainIPCService.handle(IPCInvokeChannel.StorageGet, (_, payload) => MainSyncService.get(payload.key) as unknown as any);
MainIPCService.on(IPCSendChannel.StorageSet, (_, payload) => MainSyncService.set(payload.key, payload.value));

export { StorageKey };
export default MainSyncService;
