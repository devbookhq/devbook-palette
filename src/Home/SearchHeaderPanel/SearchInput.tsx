import React, {
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';
import useDebounce from 'hooks/useDebounce';

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


interface SearchInputProps {
  placeholder?: string;
  onDebouncedChange: (value: string) => void;

  initialValue: string;

  inputRef: React.RefObject<HTMLInputElement>;

  isModalOpened?: boolean;
  isSignInModalOpened?: boolean;
  isDocsFilterModalOpened?: boolean;

  onInputFocusChange: (isFocused: boolean) => void;
}

function SearchInput({
  placeholder,
  inputRef,
  onDebouncedChange,
  isModalOpened,
  initialValue,
  isSignInModalOpened,
  isDocsFilterModalOpened,
  onInputFocusChange,
}: SearchInputProps) {
  const [inputState, setInputState] = useState({ value: '', isInitialized: false });
  const trimmedValue = inputState.value.trim();
  const debouncedValue = useDebounce(trimmedValue, 400);

  useEffect(() => {
    if (!inputState.value) {
      setInputState({ value: initialValue, isInitialized: true });
    }
  }, [initialValue]);

  useEffect(() => {
    if (inputState.isInitialized) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue]);

  function handleChangeValue(e: any) {
    if (inputState.isInitialized) {
      setInputState({ value: e.target.value, isInitialized: true });
    }
  }

  function handleInputKeyDown(e: any) {
    // We want to prevent cursor from moving when the up or down arrow is pressed.
    // The default behavior is that cursor moves either to the start or to the end.
    // 38 - up arrow
    // 40 - down arrow
    if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault();
  }

  useIPCRenderer('did-show-main-window', () => {
    if (!isModalOpened) inputRef?.current?.focus();
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
    <Input
      ref={inputRef}
      placeholder={placeholder}
      value={inputState.value}
      onChange={handleChangeValue}
      onFocus={() => onInputFocusChange(true)}
      onBlur={() => onInputFocusChange(false)}
      onKeyDown={handleInputKeyDown}
    />
  );
}

export default SearchInput;
