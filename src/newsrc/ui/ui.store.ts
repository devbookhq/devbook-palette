import {
  makeAutoObservable,
  reaction,
  IReactionDisposer,
} from 'mobx';
import RootStore, { useRootStore } from 'newsrc/App/RootStore';

export interface UserInterfaceJSON {
  toolbarWidth: number;
}

export function useUIStore() {
  const { uiStore } = useRootStore();
  return uiStore;
}

export default class UIStore {
  autosaveHandler: IReactionDisposer;
  private toolbar = {
    defaultWidth: 90,
    currentWidth: 90,
  };
  shouldAutoSave = true; // Whether to automatically save UI state on every change.

  constructor(private readonly rootStore: RootStore) {
    makeAutoObservable(this, {
      autosaveHandler: false,
      shouldAutoSave: false,
      dispose: false,
    });

    this.rootStore = rootStore;
    this.autosaveHandler = reaction(
      () => this.asJSON,
      json => {
        console.log('Auto save reaction', this.shouldAutoSave);
        if (this.shouldAutoSave) {
          this.rootStore.transportLayer.saveUI(json);
        }
      }
    );
  }

  set toolbarWidth(width: number) {
    this.toolbar.currentWidth = width;
  }
  get toolbarWidth() {
    return this.toolbar.currentWidth;
  }
  get toolbarDefaultWidth() {
    return this.toolbar.defaultWidth;
  }

  get asJSON() {
    return {
      toolbarWidth: this.toolbar.currentWidth,
    } as UserInterfaceJSON;
  }

  initFromJSON(json: UserInterfaceJSON) {
    console.log('AutoSave 1', this.shouldAutoSave);
    console.log('Initializing UI from JSON', json);
    // TODO: Disable auto save doesn't work.
    // The reaction in constructor fires anyway.
    this.shouldAutoSave = false; // Prevent triggering the autosave when we're setting the values.
    console.log('AutoSave 2', this.shouldAutoSave);
    this.toolbar.currentWidth = json.toolbarWidth;
    this.shouldAutoSave = true;
    console.log('AutoSave 3', this.shouldAutoSave);
  }

  // Clean up observers to avoid memory leak.
  dispose() {
    this.autosaveHandler();
  }
}
