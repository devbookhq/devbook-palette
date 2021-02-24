import { ElectronStore } from '../electronRemote';
import { StoreKey } from 'main/StoreKey';

export class LocalStorageLayer {
  private readonly electronStore = new ElectronStore();

  async saveRefreshToken(refreshToken: string) {
    return this.electronStore.set(StoreKey.RefreshToken, refreshToken);
  }

  async deleteRefreshToken() {
    return this.electronStore.delete(StoreKey.RefreshToken);
  }

  async loadRefreshToken() {
    return this.electronStore.get<string>(StoreKey.RefreshToken);
  }
}

export default LocalStorageLayer;
