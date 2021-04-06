import { useHotkeys } from 'react-hotkeys-hook';
import { HotKeyAction, HotKeysBinding } from 'ui/ui.store';

function useHotkey<T extends HotKeyAction>(hotkeyOptions: HotKeysBinding[T], handler: () => void) {
  return useHotkeys(hotkeyOptions.hotkey, (event) => {
    if (hotkeyOptions.isActive()) {
      console.log('Triggered', hotkeyOptions.hotkey);
      event.preventDefault();
      handler();
    }
  }, {
    filter: () => true,
    enableOnTags: ['TEXTAREA', 'INPUT', 'SELECT'],
  }, [
    hotkeyOptions.isActive(),
    hotkeyOptions.hotkey,
    handler,
  ]);
}

export default useHotkey;
