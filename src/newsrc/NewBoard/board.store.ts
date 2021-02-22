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

    const s1 = new SplitNode(SplitDirection.Horizontal, new TileNode(), new TileNode());
    const s2 = new SplitNode(SplitDirection.Horizontal, s1, new TileNode());
    /*
    const s2 = new SplitNode(SplitDirection.Vertical,
      new TileNode(),
      s1,
    );
    const s3 = new SplitNode(SplitDirection.Horizontal, new TileNode(), s2);
    */
    const s3 = new SplitNode(SplitDirection.Vertical, new TileNode(), s2);

    this.layout = new BoardLayout(s3);
  }
}

export type LayoutNode = TileNode | SplitNode;

function getID() {
  return Math.random().toString(36).substr(2, 5);
}

export class TileNode {
  readonly key = 'tile_' + getID();
  parent?: SplitNode = undefined;

  constructor() {
    makeAutoObservable(this, {
      key: false,
    });
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
  readonly key = 'split_' + getID();
  parent?: SplitNode = undefined;
  private children: LayoutNode[] = [];

  constructor(readonly direction: SplitDirection, left: LayoutNode, right: LayoutNode) {
    makeAutoObservable(this, {
      key: false,
      direction: false,
    });
    this.addChild(left);
    this.addChild(right);
  }

  setParent(node: SplitNode) {
    this.parent = node;
  }

  addChild(node: LayoutNode) {
    // If the new child node is also SplitNode and with the same direction
    // as this split node, then add its children directly to this node and
    // get rid of the new child node.
    //
    //    SplitNode (Horizontal)                                SplitNode (Horizontal)
    //      /                \                                 /       |        |     \
    // TileNode         SplitNode (Horizontal)      --->  TileNode TileNode TileNode SplitNode
    //                    /       |        \                                          /    \
    //               TileNode  TileNode  SplitNode
    //                                    /    \

    if (node instanceof SplitNode && node.direction === this.direction) {
      this.children = this.children.concat(node.children);
      node.dispose();
    } else {
      node.setParent(this);
      this.children[this.children.length] = node;
    }
    /*
      node.setParent(this);
      this.children[this.children.length] = node;
      */
  }

  getChildren() {
    return this.children;
  }

  dispose() {
    this.children = [];
    this.parent = undefined;
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

