import IPCService, { IPCInvokeChannel, IPCSendChannel } from 'services/ipc.service';
import { StorageKey, StorageValue } from './storage';

type BackupCall = () => void;

class SyncService {
  private constructor() { }

  static registeredBackups: BackupCall[] = [];

  private static backupInterval = setInterval(() => {
    for (const backupCall of SyncService.registeredBackups) {
      backupCall();
    }
  }, 20000);

  static async get<T extends StorageKey>(key: T): Promise<StorageValue[T]> {
    return IPCService.invoke(IPCInvokeChannel.StorageGet, { key }) as unknown as StorageValue[T];
  }

  static set<T extends StorageKey>(key: T, value: StorageValue[T]) {
    IPCService.send(IPCSendChannel.StorageSet, { key, value });
  }

  static registerBackup<T extends StorageKey>(key: T, getter: () => StorageValue[T]) {
    const backupCall = () => SyncService.set(key, getter());
    this.registeredBackups.push(backupCall);
  }
}

export { StorageKey };
export default SyncService;
