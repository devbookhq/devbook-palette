import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { IPCOnChannel } from 'services/ipc.service';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { useUIStore } from 'ui/ui.store';
import SearchInput from './SearchInput';

function SearchInputWrapper() {
  const uiStore = useUIStore();

  const inputRef = useRef<HTMLInputElement>(null);

  function handleInputKeyDown(e: any) {
    // We want to prevent cursor from moving when the up or down arrow is pressed.
    // The default behavior is that cursor moves either to the start or to the end.
    // 38 - up arrow
    // 40 - down arrow
    if (e.keyCode === 38 || e.keyCode === 40) {
      e.preventDefault();
      return;
    }
  }

  useIPCRenderer(IPCOnChannel.DidShowMainWindow, () => {
    if (!uiStore.isModalOpened && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 999999);
    }
  }, [
    uiStore.isModalOpened,
    inputRef.current,
  ]);

  return (
    <SearchInput
      inputRef={inputRef}
      handleInputKeyDown={handleInputKeyDown}
    />
  );
}

export default observer(SearchInputWrapper);
