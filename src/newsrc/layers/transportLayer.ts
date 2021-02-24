import { UserInterfaceJSON } from 'newsrc/ui/ui.store';

// TransportLayer communicates with some kind of "backend".
// Might be a disk, server, another process, etc. It's up to the implementation.
// It isn't tightly coupled with anything.
class TransportLayer {
  saveUI(json: UserInterfaceJSON) {
    // TODO: Save json.
    console.log('TODO: UI JSON to save', json);
  }

  fetchUI(): UserInterfaceJSON {
    // TODO: Load the previously saved UI data.
    return {
      toolbarWidth: 90,
    };
  }
}

export default TransportLayer;
