import IPCService, { IPCInvokeChannel, IPCSendChannel } from 'services/ipc.service';
import { StorageKey, StorageValue } from './storage';

type BackupCall = () => void;

class SyncService {
  private constructor() { }

  static registeredBackups: { [key in StorageKey]?: { call?: BackupCall, isDirty?: boolean } } = {};

  private static backupInterval = setInterval(() => {
    for (const backup of Object.values(SyncService.registeredBackups)) {
      if (!backup) return;
      if (backup.isDirty) backup.call?.();
      backup.isDirty = false;
    }
  }, 6000);

  static async get<T extends StorageKey>(key: T): Promise<StorageValue[T]> {
    return IPCService.invoke(IPCInvokeChannel.StorageGet, { key }) as unknown as StorageValue[T];
  }

  static set<T extends StorageKey>(key: T, value: StorageValue[T]) {
    IPCService.send(IPCSendChannel.StorageSet, { key, value });
  }

  static registerBackup<T extends StorageKey>(key: T, getter: () => StorageValue[T]) {
    const call = () => {
      const value = getter();
      SyncService.set(key, value);
    }
    this.registeredBackups[key] = { call };
  }

  static markDirtyKey(key: StorageKey) {
    SyncService.registeredBackups[key] = {
      ...SyncService.registeredBackups[key],
      isDirty: true,
    }
  }
}

export { StorageKey };
export default SyncService;
