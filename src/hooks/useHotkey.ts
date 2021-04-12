import { useHotkeys } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'hotkeys-js';
import { HotkeyAction, HotKeysBinding } from 'ui/ui.store';

function useHotkey<T extends HotkeyAction>(hotkeyOptions: HotKeysBinding[T], handler?: (k?: KeyboardEvent, h?: HotkeysEvent) => void, filter?: (e: KeyboardEvent) => boolean) {
  useHotkeys(hotkeyOptions.hotkey, (keyboardEvent, hotkeyEvent) => {
    console.log('trigger', hotkeyOptions.hotkey);
    if (hotkeyOptions.isActive()) {
      if (handler) {
        keyboardEvent.preventDefault();
        handler(keyboardEvent, hotkeyEvent);
      } else if (hotkeyOptions.handler) {
        keyboardEvent.preventDefault();
        hotkeyOptions.handler(keyboardEvent, hotkeyEvent);
      } else {
        throw new Error(`No provided or registered handler for the hotkey action ${hotkeyOptions.label}.`)
      }
    }
  }, {
    filter: filter || (() => true),
    enableOnTags: ['TEXTAREA', 'INPUT', 'SELECT'],
  }, [
    hotkeyOptions.isActive,
    hotkeyOptions.hotkey,
    handler,
  ]);
  return {
    handler,
    ...hotkeyOptions,
  }
}

export default useHotkey;
