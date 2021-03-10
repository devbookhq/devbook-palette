import { ElectronStore } from 'newsrc/electronRemote';
import { StoreKey } from 'main/StoreKey';
import { BoardLayoutJSON } from 'newsrc/Board/board.store';
import CacheLayer from './cacheLayer';

class LocalCacheLayer implements CacheLayer {
  private readonly electronStore = new ElectronStore();

  saveRefreshToken(refreshToken: string) {
    return this.electronStore.set(StoreKey.RefreshToken, refreshToken);
  }
  deleteRefreshToken() {
    return this.electronStore.delete(StoreKey.RefreshToken);
  }
  loadRefreshToken() {
    return this.electronStore.get(StoreKey.RefreshToken) as string;
  }

  saveBoardLayout(json: BoardLayoutJSON) {
    return this.electronStore.set(StoreKey.BoardLayout, json)
  };
  loadBoardLayout() {
    return this.electronStore.get(StoreKey.BoardLayout, undefined) as BoardLayoutJSON | undefined;
  }
}

export default LocalCacheLayer;

