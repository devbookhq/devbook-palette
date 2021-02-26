import { makeAutoObservable } from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';
// TODO: Load treeify only in a dev mode.
import treeify from 'treeify';

export function useBoardStore() {
  const { boardStore } = useRootStore();
  return boardStore;
}

export default class BoardStore {
  layoutRoot: LayoutNode;

  constructor(readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      rootStore: false,
    });

    const s1 = new SplitNode(SplitDirection.Vertical, new TileNode(), new TileNode());
    this.layoutRoot = s1;

    this.printLayout();
  }

  splitTile(dir: SplitDirection, tileNode: TileNode) {
    this.printLayout('Tree before split:\n');
    // If the tile node is the root node it doesn't have a parent.
    // Just set the new split is the new root.
    if (!tileNode.parentKey) {
      const split = new SplitNode(dir, tileNode, new TileNode());
      this.layoutRoot = split;
    } else {
      // If 'tileNode' isn't the root, replace it in the tree with a new split node.

      const parent = this.getNode(tileNode.parentKey);
      if (!parent)
        throw new Error(`Cannot split tile - tile's parent is undefined.`);
      if (!(parent instanceof SplitNode))
        throw new Error(`Cannot split tile - tile's parent isn't an instance of 'SplitNode'.`);

      const split = new SplitNode(dir, tileNode, new TileNode());
      parent.swap(tileNode, split);
    }

    this.printLayout('Tree after split:\n');
  }

  removeTile(tile: TileNode) {
    // Splits with a single child aren't allowed!
    this.printLayout(`Tree before removing '${tile.key}' tile:\n`);

    const parent = this.getNode(tile.parentKey);
    if (!parent)
      throw new Error(`Cannot remove tile - tile's parent is undefined.`);
    if (!(parent instanceof SplitNode))
      throw new Error(`Cannot remove tile - tile's parent isn't an instance of 'SplitNode'.`);

    if (parent.children.length > 2) {
      // Handle the general case.
      //
      //          S                                             S
      //   /      |     \      -- Delete N_m -->     /       |     |       \
      // N_1 ... N_m ... N_n                       N_1 ... N_m-1 N_m+1 ... N_n
      //
      const tileIdx = parent.children.findIndex(c => c.key === tile.key);
      if (tileIdx === -1)
        throw new Error(`Cannot remove tile - the tile wasn't found in the parent's children array.`);

      const isLast = tileIdx === parent.children.length - 1;
      parent.children = parent.children
        .slice(0, tileIdx)
        .concat(
          isLast
            ? []
            : parent.children.slice(tileIdx+1)
        );
    } else {
      // The parent has exactly 2 children.
      //
      // Even though the 'else' branch matches the condition of the parent having less then 2 children it can't happen.
      // That's because we don't allow splits with just a single child. The tree cannot be build in a way that it has
      // a split with a single child in the first place. When removing tiles we always handle the case of a split
      // having just 2 children by moving the other tile to the split's parent. This way, a split with a single child
      // can't exist in the tree.
      //
      // We have to explictely handle the case when the parent is the root though.
      if (!parent.parentKey) {
        // The parent is the root. The node which will stay must become the new root.
        //
        //    S (root)                     N_2 (root)
        //     /   \    -- Delete N_1 -->
        //   N_1   N_2
        //
        //
        const sibling = parent.children.filter(c => c.key !== tile.key)[0]; // This is the 'N_2' in the example above.
        this.layoutRoot = sibling;
        sibling.parentKey = '';
        parent.dispose();
      } else {
        // The parent has its own parent (a grandparent from the tile's point of view).
        //
        //        S_n                               S_n
        //     /   |   \                          /  |  \
        //   ... S_n+1 ...  -- Delete N_2 -->   ... N_1 ...
        //        / \
        //      N_1 N_2
        //
        const grandparent = this.getNode(parent.parentKey); // This is the 'S_n' in the example above.
        if (!grandparent)
          throw new Error(`Cannot remove tile - tile's grandparent is undefined.`);
        if (!(grandparent instanceof SplitNode))
          throw new Error(`Cannot remove tile - tile's grandparent isn't an instance of 'SplitNode.'`);


        const parentIdx = grandparent.children.findIndex(c => c.key === parent.key);
        if (parentIdx === -1)
          throw new Error(`Cannot remove tile - the tile's parent wasn't found in the grandparent's children array.`);

        const sibling = parent.children.filter(c => c.key !== tile.key)[0]; // This is the 'N_1' in the example above.

        grandparent.swap(parent, sibling);
        parent.dispose();
      }
    }
    this.printLayout(`Tree after removing tile '${tile.key}':\n`);
  }

  private getNode(nodeKey: string) {
    const queue = [this.layoutRoot];
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) return;

      if (node.key === nodeKey) return node;

      if (node instanceof SplitNode) {
        node.children.forEach(c => queue.push(c));
      }
    }
  }

  // TODO: Run only in the dev mode.
  private printLayout(msg: string = '') {
    if (msg) console.log(msg);
    console.log(treeify.asTree(this.layoutRoot as any, true, true));
  }
}

export type LayoutNode = TileNode | SplitNode;

// String values are there for better debugging.
export enum SplitDirection {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
}

function getID() {
  return Math.random().toString(36).substr(2, 5);
}

export class TileNode {
  readonly key = 'tile_' + getID();
  _parentKey  = '';

  constructor() {
    makeAutoObservable(this);
  }

  set parentKey(key: string) {
    this._parentKey = key;
  }

  get parentKey() {
     return this._parentKey;
  }
}

export class SplitNode {
  readonly key = 'split_' + getID();
  _parentKey: string = '';
  children: LayoutNode[] = [];

  constructor(public direction: SplitDirection, left: LayoutNode, right: LayoutNode) {
    makeAutoObservable(this);
    this.addChild(left);
    this.addChild(right);
  }

  set parentKey(key: string) {
    this._parentKey = key;
  }

  get parentKey() {
     return this._parentKey;
  }

  getChildren() {
    return this.children;
  }

  addChild(node: LayoutNode) {
    // Tree balancing:
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
    //
    if (node instanceof SplitNode && node.direction === this.direction) {
      // This node children: [child_A1, child_A2, ..., child_AN].
      // Node to add children: [child_B1, child_B2, ...., child_BM].
      // This node new children: [child_A1, child_A2, ..., child_AN, child_B1, child_B2, ..., child_BM].
      node.children.forEach(c => c.parentKey = this.key);
      this.children = this.children.concat(node.children);
      node.dispose();
    } else {
      node.parentKey = this.key;
      this.children[this.children.length] = node;
    }
  }

  swap(toSwap: LayoutNode, newNode: LayoutNode) {
    const swapIdx = this.children.findIndex(c => c.key === toSwap.key);
    if (swapIdx === -1) throw new Error(`Cannot swap, node '${toSwap.key}' wasn't found in children.`);

    // Check if we have to balance the tree.
    if (newNode instanceof SplitNode && newNode.direction === this.direction) {
      // This children: [c_1, c_2, ..., c_swapIdx-1, c_swapIdx, c_swapIdx+1, ...., c_n].
      // New node children: [d_1, ..., d_m].
      // This children after balance: [c_1, ..., c_swapIdx-1, d_1, ..., d_m,  c_swapIdx+1, ..., c_n].

      newNode.children.forEach(c => c.parentKey = this.key);
      const isLast = swapIdx === this.children.length - 1;
      this.children = this.children
        .slice(0, swapIdx)
        .concat(newNode.children)
        .concat(
          isLast
            ? []
            : this.children.slice(swapIdx+1)
        );
      newNode.dispose();
    } else {
      newNode.parentKey = this.key;
      this.children[swapIdx] = newNode;
    }
  }


  dispose() {
    this.children = [];
  }
}

