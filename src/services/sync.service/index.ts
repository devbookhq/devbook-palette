import IPCService, { IPCInvokeChannel, IPCSendChannel } from 'services/ipc.service';
import { StorageKey, StorageValue } from './storage';

class SyncService {
  private constructor() { }

  static async get<T extends StorageKey>(key: T): Promise<StorageValue[T]> {
    return IPCService.invoke(IPCInvokeChannel.StorageGet, { key }) as unknown as StorageValue[T];
  }

  static set<T extends StorageKey>(key: T, value: StorageValue[T]) {
    IPCService.send(IPCSendChannel.StorageSet, { key, value });
  }
}

export { StorageKey };
export default SyncService;
