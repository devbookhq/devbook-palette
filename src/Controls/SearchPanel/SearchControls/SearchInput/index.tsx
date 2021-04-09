import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { IPCOnChannel } from 'services/ipc.service';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { useUIStore } from 'ui/ui.store';
import SearchInput from './Input';

function SearchInputWrapper() {
  const uiStore = useUIStore();

  const inputRef = useRef<HTMLInputElement>(null);

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
    />
  );
}

export default observer(SearchInputWrapper);
