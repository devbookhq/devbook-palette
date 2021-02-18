import { makeAutoObservable } from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';

export function useBoardStore() {
  const { boardStore } = useRootStore();
  return boardStore;
}

export default class BoardStore {
  layout: BoardLayout;
  constructor(readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      rootStore: false,
    });

    const s = new SplitNode(SplitDirection.Vertical,
      new TileNode(),
      new SplitNode(SplitDirection.Horizontal, new TileNode(), new TileNode()),
    )

    this.layout = new BoardLayout(
      new SplitNode(SplitDirection.Horizontal, s, new TileNode()),
    );
    (this.layout.root as SplitNode).addChild(
      new SplitNode(SplitDirection.Vertical, new TileNode(), new TileNode()),
    );
  }
}

type LayoutNode = TileNode | SplitNode;

export class TileNode {
  readonly key: string;
  parent?: SplitNode = undefined;

  constructor() {
    makeAutoObservable(this, {
      key: false,
    });
    this.key = 'tile_' + Math.random().toString(36).substr(2, 5);
  }

  setParent(node: SplitNode) {
    this.parent = node;
  }
}

// String values are there for better debugging.
export enum SplitDirection {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
}

export class SplitNode {
  readonly key: string;
  parent?: SplitNode = undefined;
  private children: LayoutNode[] = [];

  constructor(readonly direction: SplitDirection, left: LayoutNode, right: LayoutNode) {
    makeAutoObservable(this, {
      key: false,
      direction: false,
    });
    this.key = 'split_' + Math.random().toString(36).substr(2, 5);
    this.addChild(left);
    this.addChild(right);
  }

  setParent(node: SplitNode) {
    this.parent = node;
  }

  addChild(node: LayoutNode) {
    node.setParent(this);
    this.children[this.children.length] = node;
  }

  getChildren() {
    return this.children;
  }
}

export class BoardLayout {
  constructor(public root: LayoutNode) {
    makeAutoObservable(this);
  }

  print() {
    let str = 'Level 0: ';
    const queue: LayoutNode[] = [];
    let level = 0;
    let levelEndIdx = 0;
    let currentIdx = 0;
    queue.push(this.root);
    // Current level we are traversing.
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) return;

      const dir = (node instanceof SplitNode) ? ` dir ${node.direction},` : '';
      const parent = node.parent ? `parent '${node.parent.key}',` : 'root,';
      str += node.key + ' (' + parent + dir + '); ';

      currentIdx += 1;
      if (currentIdx > levelEndIdx) {
        level += 1;
        str += `\nLevel ${level}: `;
        currentIdx = 0;
      }

      // Only Split can have children.
      if (node instanceof SplitNode) {
        (node as SplitNode).getChildren().forEach(c => queue.push(c));
        levelEndIdx = queue.length - 1;
      }
    }
    console.log(str);
  }
}

