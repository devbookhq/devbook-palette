import ElectronStore from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

import MainIPCService, { IPCInvokeChannel, IPCSendChannel } from '@main/services/mainIPC.service';

import { SearchMode } from '@renderer/services/search.service/searchMode';
import { StorageKey, StorageValue, Storage } from '@renderer/services/sync.service/storage';

class MainSyncService {
  private static electronStore = new ElectronStore<Storage>({
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
        default: uuidv4(),
      },
      refreshToken: {
        type: 'string',
        default: '',
      },
    },
  });

  static get<T extends StorageKey>(key: T): StorageValue[T] {
    return MainSyncService.electronStore.get(key);
  }

  static set<T extends StorageKey>(key: T, value: StorageValue[T]) {
    return MainSyncService.electronStore.set(key, value);
  }
}

MainIPCService.handle(IPCInvokeChannel.StorageGet, (_, payload) => MainSyncService.get(payload.key) as unknown as any);
MainIPCService.on(IPCSendChannel.StorageSet, (_, payload) => MainSyncService.set(payload.key, payload.value));

export { StorageKey };
export default MainSyncService;
