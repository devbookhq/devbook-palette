import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';
import Loader from 'components/Loader';
import Hotkey, { Key } from './HotkeysPanel/Hotkey';
import { openPreferences, isDev } from 'mainProcess';

import { ReactComponent as PreferencesIcon } from 'img/preferences.svg';

const Container = styled.div`
  width: 100%;
  padding-top: 5px;
  display: flex;
  flex-direction: column;

  background: #25252E;
`;

const InputWrapper = styled.div<{ isFocused?: boolean }>`
  min-height: 46px;
  width: 100%;
  padding-bottom: 5px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid #3B3A4A;
`;

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
`;

const StyledLoader = styled(Loader)`
  position: relative;
  right: 2px;
`;

const Menu = styled.div`
  width: 100%;
  padding: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FiltersWrapper = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
`;

const Filter = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const FilterButton = styled.button<{ selected?: boolean }>`
  color: ${props => props.selected ? 'white' : '#5A5A6F'};
  font-family: 'Poppins';
  font-size: 15px;
  font-weight: 500;

  background: none;
  border: none;

  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    color: white;
  }
`;

const StyledPreferencesIcon = styled(PreferencesIcon)`
  height: auto;
  width: 20px;
`;

const PreferencesButton = styled.div`
  margin: 0 5px 0 0;

  display: flex;

  :hover {
    path {
      stroke: white;
    }
    cursor: pointer;
  }
`;

const Dev = styled.span`
  margin: 0 15px;
  color: #00FF41;
  font-family: 'Roboto Mono';
  font-weight: 600;
`;

export enum ResultsFilter {
  StackOverflow = 'StackOverflow',
  GitHubCode = 'Code',
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: any) => void;

  activeFilter: ResultsFilter;
  onFilterSelect: (f: ResultsFilter) => void;

  isLoading?: boolean;
  isModalOpened?: boolean;
}

function SearchInput({
  placeholder,
  value,
  onChange,
  activeFilter,
  onFilterSelect,
  isLoading,
  isModalOpened,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDevEnv, setIsDevEnv] = useState(false);

  function handleContentMouseDown(e: any) {
    // Prevent blur when user is clicking on the filter buttons under the input element.
    // This also makes sure that user can select text in the input field using their mouse.
    if (!e.target.contains(inputRef?.current)) {
      if (isInputFocused) e.preventDefault();
    }
  };

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
    isDev().then(setIsDevEnv);
  }, []);

  useEffect(() => {
    if (isModalOpened) inputRef?.current?.blur();
    else inputRef?.current?.focus();
  }, [isModalOpened]);

  return (
    <Container
      onMouseDown={handleContentMouseDown}
    >
      <InputWrapper
        isFocused={isInputFocused}
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={handleInputKeyDown}
        />
        {isLoading && <StyledLoader />}
      </InputWrapper>
      <Menu>
        <FiltersWrapper>
          {Object.values(ResultsFilter).map((f, idx) => (
            <Filter
              key={f}
            >
              <FilterButton
                selected={activeFilter === f}
                onClick={() => onFilterSelect(f)}
              >{f}
              </FilterButton>
              <Hotkey
                hotkey={[Key.Command, `${idx + 1}`]}
              />
            </Filter>
          ))}
        </FiltersWrapper>
        {isDevEnv && <Dev>Dev build</Dev>}
        <PreferencesButton onClick={openPreferences}>
          <StyledPreferencesIcon />
        </PreferencesButton>
      </Menu>
    </Container>
  );
}

export default SearchInput;
