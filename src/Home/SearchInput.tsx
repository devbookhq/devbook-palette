import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';
import electron, {
  openPreferences,
  isDev,
  getUpdateStatus,
  restartAndUpdate,
  postponeUpdate,
} from 'mainProcess';
import Loader from 'components/Loader';
import { PreferencesPage } from 'Preferences';

import { ReactComponent as userProfileIcon } from 'img/user-profile.svg';
import { ReactComponent as preferencesIcon } from 'img/preferences.svg';
import { ReactComponent as closeIcon } from 'img/close.svg';

import Hotkey, { Key } from './HotkeysPanel/Hotkey';

const Container = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid #3B3A4A;
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

  ::placeholder {
    color: #5A5A6F;
  }
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

const UserProfileIcon = styled(userProfileIcon)`
  height: auto;
  width: 20px;
`;

const UserProfileButton = styled.div`
  margin: 0 15px 0 0;

  display: flex;

  :hover {
    path {
      stroke: white;
    }
    cursor: pointer;
  }
`;

const PreferencesIcon = styled(preferencesIcon)`
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

const UpdatePanel = styled.div`
  height: 38px;
  width: 100%;

  display: flex;
  justify-content: space-between;

  background: #7739DD;
`;

const Disclaimer = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin: auto 15px;

  :hover {
    cursor: pointer;
  }
`;

const CancelButton = styled.div`
  margin: auto 15px;

  :hover {
    cursor: pointer;
    path {
      stroke: #FFFFFF;
    }
  }
`;

const CloseIcon = styled(closeIcon)`
  width: auto;
  height: 18px;
  display: block;
  path {
    stroke: #FFFFFF;
  }
`;

export enum ResultsFilter {
  StackOverflow = 'StackOverflow',
  GitHubCode = 'GitHubCode',
  Docs = 'Docs',
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: any) => void;

  activeFilter: ResultsFilter;
  onFilterSelect: (f: ResultsFilter) => void;

  isLoading?: boolean;
  isModalOpened?: boolean;
  isSignInModalOpened?: boolean;
  isDocsFilterModalOpened?: boolean;
}

function SearchInput({
  placeholder,
  value,
  onChange,
  activeFilter,
  onFilterSelect,
  isLoading,
  isModalOpened,
  isSignInModalOpened,
  isDocsFilterModalOpened,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdatePanelOpened, setIsUpdatePanelOpened] = useState(true);

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

  function handleUpdate() {
    restartAndUpdate();
  }

  function handleCloseUpdatePanel() {
    setIsUpdatePanelOpened(false);
    postponeUpdate();
  }

  function getResultsFilterDisplayName(f: ResultsFilter) {
    if (f === ResultsFilter.GitHubCode) {
      return 'GitHub';
    }
    return f;
  }

  useIPCRenderer('did-show-main-window', () => {
    if (!isModalOpened) inputRef?.current?.focus();
  });

  useIPCRenderer('update-available', (_, { isReminder }: { isReminder?: boolean }) => {
    setIsUpdateAvailable(true);
    if (isReminder) {
      setIsUpdatePanelOpened(true);
    }
  });

  useEffect(() => {
    async function checkUpdateStatus() {
      const isNewUpdateAvailable = await getUpdateStatus();
      if (isNewUpdateAvailable) {
        setIsUpdateAvailable(true);
      }
    }
    checkUpdateStatus();
  }, []);

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
              >{getResultsFilterDisplayName(f)}
              </FilterButton>
              {electron.remote.process.platform === 'darwin' &&
                <Hotkey
                  hotkey={[Key.Command, `${idx + 1}`]}
                />
              }
              {electron.remote.process.platform === 'linux' &&
                <Hotkey
                  hotkey={['Alt + ', `${idx + 1}`]}
                />
              }
            </Filter>
          ))}
        </FiltersWrapper>
        {isDev && <Dev>[dev build]</Dev>}
        <UserProfileButton onClick={() => openPreferences(PreferencesPage.Account)}>
          <UserProfileIcon />
        </UserProfileButton>
        <PreferencesButton onClick={() => openPreferences(PreferencesPage.General)}>
          <PreferencesIcon />
        </PreferencesButton>
      </Menu>
      {isUpdateAvailable && isUpdatePanelOpened &&
        <UpdatePanel>
          <Disclaimer onClick={handleUpdate}>
            {'New version is available. Click here to update & restart.'}
          </Disclaimer>
          <CancelButton
            onClick={handleCloseUpdatePanel}
          >
            <CloseIcon />
          </CancelButton>
        </UpdatePanel>
      }
    </Container >
  );
}

export default SearchInput;
