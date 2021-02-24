import { ElectronStore } from '../electronRemote';

enum StoreKeys {
  RefreshToken = 'refreshToken',
}

export class LocalStorageLayer {
  private readonly electronStore = new ElectronStore();

  async saveRefreshToken(refreshToken: string) {
    return this.electronStore.set(StoreKeys.RefreshToken, refreshToken);
  }

  async deleteRefreshToken() {
    return this.electronStore.delete(StoreKeys.RefreshToken);
  }

  async loadRefreshToken() {
    return this.electronStore.get<string>(StoreKeys.RefreshToken);
  }
}

export default LocalStorageLayer;
