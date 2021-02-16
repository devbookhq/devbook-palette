import RootStore from 'newsrc/App/RootStore';

export default class UserStore {
  rootStore: RootStore;

  constructor(store: RootStore) {
    this.rootStore = store;
  }
}
