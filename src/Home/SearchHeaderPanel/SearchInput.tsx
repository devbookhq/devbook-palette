import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { useHotkeys } from 'react-hotkeys-hook';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { SearchMode } from 'Preferences/Pages/searchMode';
import useDebounce from 'hooks/useDebounce';
import { DocSource } from 'Search/docs';
import Loader from 'components/Loader';
import Hotkey from 'Home/HotkeysPanel/Hotkey';
import { useUIStore } from 'ui/ui.store';
import { AuthContext } from 'Auth';

const Input = styled.input`
  padding: 10px 15px;
  flex: 1;

  color: white;
  font-family: 'Roboto Mono';
  font-weight: 600;
  font-size: 14px;

  border: none;
  outline: none;
  background: transparent;

  ::placeholder {
    color: #5A5A6F;
  }
`;

const StyledLoader = styled(Loader)`
  position: relative;
  right: 2px; `;

const HotkeyWrapper = styled.div<{ isHighlighted?: boolean }>`
  padding: 5px;
  margin-right: 8px;
  display: flex;
  align-items: center;

  border-radius: 5px;
  user-select: none;
  background: ${props => props.isHighlighted ? '#535BD7' : 'transparent'};
  box-shadow: ${props => props.isHighlighted ? '0px 0px 8px 5px rgba(83, 91, 215, 0.15)' : 'none'};

  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    background: ${props => props.isHighlighted ? '#535BD7' : '#434252' };
  }
`;

const StyledHotkey = styled(Hotkey)<{ isHighlighted?: boolean }>`
  background: ${props => props.isHighlighted ? '#535BD7' : 'auto'};
  color: ${props => props.isHighlighted ? '#fff' : 'auto'};
`;

const HotkeyText = styled.div<{ isHighlighted?: boolean }>`
  margin-left: 8px;
  font-size: 12px;
  color: #616171;
  transition: color 170ms ease-in;
  color: ${props => props.isHighlighted ? '#fff' : 'auto'};
`;

interface SearchInputProps {
  placeholder?: string;
  invokeSearch: (query: string) => void;

  onEmptyQuery: () => void;
  onNonEmptyQuery: () => void;

  activeDocSource: DocSource | undefined;
  searchMode: SearchMode | undefined;
  inputRef: React.RefObject<HTMLInputElement>;

  historyValue: string | undefined;

  isLoading?: boolean;
  isModalOpened?: boolean;
  isDocsFilterModalOpened?: boolean;
  onEnterInSearchHistory: () => void;
  isSearchHistoryPreviewVisible: boolean;
  onInputFocusChange: (isFocused: boolean) => void;
  onQueryDidChange: () => void;
}

const SearchInput = observer(({
  placeholder,
  inputRef,
  historyValue,
  activeDocSource,
  onEnterInSearchHistory,
  isSearchHistoryPreviewVisible,
  onEmptyQuery,
  onNonEmptyQuery,
  isModalOpened,
  invokeSearch,
  onQueryDidChange,
  isDocsFilterModalOpened,
  isLoading,
  searchMode,
  onInputFocusChange,
}: SearchInputProps) => {
  const authInfo = useContext(AuthContext);
  const uiStore = useUIStore();

  const [value, setValue] = useState('');
  const [lastValue, setLastValue] = useState('');
  const [lastDocSource, setLastDocSource] = useState<DocSource>();
  const [isEmptyQuery, setIsEmptyQuery] = useState(true);
  const [lastHistoryValue, setLastHistoryValue] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const debouncedValue = useDebounce(value, 280);

  const search = useCallback((query: string) => {
    invokeSearch(query);
    setLastValue(query);
    setIsDirty(false);
  }, [invokeSearch]);

  function informQueryChange() {
    setIsDirty(true);
    onQueryDidChange();
  }

  function handleChangeValue(e: any) {
    setValue(e.target.value);

    if (isEmptyQuery && e.target.value !== '') {
      setIsEmptyQuery(false);
      onNonEmptyQuery();
    }
    if (!isEmptyQuery && e.target.value === '') {
      setIsEmptyQuery(true);
      onEmptyQuery();
    }
    if (e.target.value !== lastValue) {
      informQueryChange();
    }
  }

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

  // 'enter' hotkey - search.
  useHotkeys('enter', () => {
    if (uiStore.isSignInModalOpened) return;
    if (isDocsFilterModalOpened) return;
    if (isSearchHistoryPreviewVisible) return onEnterInSearchHistory();
    if (searchMode === SearchMode.OnEnterPress) search(value);
  }, { filter: () => true }, [
    uiStore.isSignInModalOpened,
    isDocsFilterModalOpened,
    isSearchHistoryPreviewVisible,
    onEnterInSearchHistory,
    searchMode,
    search,
    value,
  ]);

  useIPCRenderer('did-show-main-window', () => {
    if (!isModalOpened && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 999999);
    }
  });

  useEffect(() => {
    if (activeDocSource === lastDocSource) return;

    setLastDocSource(activeDocSource);
    search(value);
  }, [
    activeDocSource,
    lastDocSource,
    search,
    value,
  ]);

  useEffect(() => {
    if (searchMode === SearchMode.Automatic && lastValue !== debouncedValue) {
      search(debouncedValue);
    }
  }, [
    searchMode,
    lastValue,
    debouncedValue,
    search,
  ]);

  useEffect(() => {
    if (!historyValue) return;
    if (historyValue === lastHistoryValue) return;
    if (historyValue === value) return;

    informQueryChange();
    setValue(historyValue);
    setLastHistoryValue(historyValue);

    search(historyValue);
  }, [
    historyValue,
    lastHistoryValue,
    value,
    lastValue,
    informQueryChange,
    search,
  ]);

  useEffect(() => {
    if (isModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [isModalOpened]);

  useEffect(() => {
    if (uiStore.isSignInModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [uiStore.isSignInModalOpened]);

  useEffect(() => {
    if (isDocsFilterModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [isDocsFilterModalOpened]);

  return (
    <>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChangeValue}
        onFocus={() => onInputFocusChange(true)}
        onBlur={() => onInputFocusChange(false)}
        onKeyDown={handleInputKeyDown}
      />
      {isLoading
        && !authInfo.isReconnecting
        &&
        < StyledLoader />
      }

      {searchMode === SearchMode.OnEnterPress &&
        <HotkeyWrapper
          onClick={() => search(value)}
          isHighlighted={isDirty}
        >
          <StyledHotkey
            hotkey={['Enter']}
            isHighlighted={isDirty}
          />
          <HotkeyText
            isHighlighted={isDirty}
          >
            to search
          </HotkeyText>
        </HotkeyWrapper>
      }
    </>
  );
});

export default SearchInput;
