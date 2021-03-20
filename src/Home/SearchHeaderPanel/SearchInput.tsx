import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import styled from 'styled-components';

import { useHotkeys } from 'react-hotkeys-hook';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { SearchMode } from 'Preferences/Pages/searchMode';
import useDebounce from 'hooks/useDebounce';
import { DocSource } from 'search/docs';
import Loader from 'components/Loader';
import Hotkey from 'Home/HotkeysPanel/Hotkey';
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

const HotkeyWrapper = styled.div`
  padding: 5px;
  display: flex;
  align-items: center;

  border-radius: 5px;
  user-select: none;
  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    background: #434252;
    > div {
      color: #fff;
    }
  }
`;

const HotkeyText = styled.div`
  margin-left: 8px;
  font-size: 12px;
  color: #616171;
  transition: color 170ms ease-in;
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
  isSignInModalOpened?: boolean;
  isDocsFilterModalOpened?: boolean;
  onEnterInSearchHistory: () => void;
  isSearchHistoryPreviewVisible: boolean;
  onInputFocusChange: (isFocused: boolean) => void;
  onDidQueryChanged: () => void;
}

function SearchInput({
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
  onDidQueryChanged,
  isSignInModalOpened,
  isDocsFilterModalOpened,
  isLoading,
  searchMode,
  onInputFocusChange,
}: SearchInputProps) {
  const authInfo = useContext(AuthContext);

  const [value, setValue] = useState('');
  const [lastValue, setLastValue] = useState('');
  const [lastDocSource, setLastDocSource] = useState<DocSource>();
  const [isEmptyQuery, setIsEmptyQuery] = useState(true);
  const [lastHistoryValue, setLastHistoryValue] = useState('');

  const debouncedValue = useDebounce(value, 280);

  const search = useCallback((query: string) => {
    invokeSearch(query);
    setLastValue(query);
  }, [invokeSearch]);

  useEffect(() => {
    if (!historyValue) return;
    if (historyValue === lastHistoryValue) return;
    if (historyValue === value) return;

    onDidQueryChanged();
    setValue(historyValue);
    setLastHistoryValue(historyValue);

    search(historyValue);
  }, [
    historyValue,
    lastHistoryValue,
    value,
    lastValue,
    onDidQueryChanged,
    search,
  ]);

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
      onDidQueryChanged();
    }
  }

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
  useHotkeys('enter', (event) => {
    if (isSignInModalOpened) return;
    if (isDocsFilterModalOpened) return;
    if (isSearchHistoryPreviewVisible) return onEnterInSearchHistory();
    if (searchMode === SearchMode.OnEnterPress) search(value);
  }, { filter: () => true }, [
    isSignInModalOpened,
    isDocsFilterModalOpened,
    isSearchHistoryPreviewVisible,
    onEnterInSearchHistory,
    searchMode,
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

  useIPCRenderer('did-show-main-window', () => {
    if (!isModalOpened && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 999999);
    }
  });

  useEffect(() => {
    if (isModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [isModalOpened]);

  useEffect(() => {
    if (isSignInModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [isSignInModalOpened]);

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
        >
          <Hotkey
            hotkey={['Enter']}
          />
          <HotkeyText>
            to search
      </HotkeyText>
        </HotkeyWrapper>
      }
    </>
  );
}

export default SearchInput;
