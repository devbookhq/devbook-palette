import { BoardLayoutJSON } from 'newsrc/Board/board.store';

interface CacheLayer {
  saveRefreshToken(token: string): void;
  deleteRefreshToken(): void;
  loadRefreshToken(): string;

  saveBoardLayout(serializedLayout: any): void;
  loadBoardLayout(): BoardLayoutJSON | undefined;
}

export default CacheLayer;

