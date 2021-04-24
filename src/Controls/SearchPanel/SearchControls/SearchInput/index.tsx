import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { IPCOnChannel } from 'services/ipc.service';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { useUIStore } from 'ui/ui.store';
import SearchInput from './Input';

function SearchInputWrapper() {
  const uiStore = useUIStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uiStore.isStackOverflowModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [uiStore.isStackOverflowModalOpened]);

  useEffect(() => {
    if (uiStore.isSignInModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [uiStore.isSignInModalOpened]);

  useEffect(() => {
    if (uiStore.isDocsFilterModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [uiStore.isDocsFilterModalOpened]);

  useIPCRenderer(IPCOnChannel.DidShowMainWindow, () => {
    if (!uiStore.isStackOverflowModalOpened && !uiStore.isDocsFilterModalOpened && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 999999);
    }
  }, [
    uiStore.isStackOverflowModalOpened,
    inputRef.current,
  ]);

  return (
    <SearchInput
      inputRef={inputRef}
    />
  );
}

export default observer(SearchInputWrapper);
