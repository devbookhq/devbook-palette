import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeyAction, HotKeysBinding } from 'ui/ui.store';

function useHotkey<T extends HotkeyAction>(hotkeyOptions: HotKeysBinding[T], handler?: () => void) {
  useHotkeys(hotkeyOptions.hotkey, (event) => {
    if (hotkeyOptions.isActive()) {
      console.log('Triggered', hotkeyOptions.hotkey);
      if (handler) {
        event.preventDefault();
        handler();
      } else if (hotkeyOptions.handler) {
        event.preventDefault();
        hotkeyOptions.handler();
      } else {
        throw new Error(`No provided or registered handler for the hotkey action ${hotkeyOptions}`)
      }
    }
  }, {
    filter: () => true,
    enableOnTags: ['TEXTAREA', 'INPUT', 'SELECT'],
  }, [
    hotkeyOptions.isActive(),
    hotkeyOptions.handler,
    hotkeyOptions.hotkey,
    handler,
  ]);
  return {
    handler,
    ...hotkeyOptions,
  }
}

export default useHotkey;
