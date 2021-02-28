import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';

import useIPCRenderer from 'hooks/useIPCRenderer';
import {
  openPreferences,
  isDev,
  getUpdateStatus,
  restartAndUpdate,
  postponeUpdate,
} from 'mainCommunication';
import Loader from 'components/Loader';
import { PreferencesPage } from 'Preferences';
import ResultsFiltersMenu, { ResultsFilter } from './ResultsFiltersMenu';
import SearchInput from './SearchInput';

import { ReactComponent as preferencesIcon } from 'img/preferences.svg';
import { ReactComponent as closeIcon } from 'img/close.svg';

const Container = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid #3B3A4A;
  background: #25252E;
`;

const Menu = styled.div`
  width: 100%;
  padding: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
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

const StyledLoader = styled(Loader)`
  position: relative;
  right: 2px;
`;

const SearchInputContainer = styled.div<{ isFocused?: boolean }>`
  min-height: 46px;
  width: 100%;
  padding-bottom: 5px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid #3B3A4A;
`;

interface SearchHeaderPanelProps {
  placeholder?: string;
  value: string;
  onDebouncedChange: (value: string) => void;

  activeFilter: ResultsFilter;
  onFilterSelect: (f: ResultsFilter) => void;

  isLoading?: boolean;
  isModalOpened?: boolean;
  isSignInModalOpened?: boolean;
  isDocsFilterModalOpened?: boolean;
}

function SearchHeaderPanel({
  value,
  placeholder,
  onDebouncedChange,
  activeFilter,
  onFilterSelect,
  isLoading,
  isModalOpened,
  isSignInModalOpened,
  isDocsFilterModalOpened,
}: SearchHeaderPanelProps) {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdatePanelOpened, setIsUpdatePanelOpened] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleContentMouseDown(e: any) {
    // Prevent blur when user is clicking on the filter buttons under the input element.
    // This also makes sure that user can select text in the input field using their mouse.
    if (!e.target.contains(inputRef?.current)) {
      if (isInputFocused) e.preventDefault();
    }
  };

  function handleUpdate() {
    restartAndUpdate();
  }

  function handleCloseUpdatePanel() {
    setIsUpdatePanelOpened(false);
    postponeUpdate();
  }

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

  return (
    <Container
      onMouseDown={handleContentMouseDown}
    >
      <SearchInputContainer
        isFocused={isInputFocused}
      >
        <SearchInput
          inputRef={inputRef}
          setIsInputFocused={setIsInputFocused}
          initialValue={value}
          placeholder={placeholder}
          onDebouncedChange={onDebouncedChange}
          isModalOpened={isModalOpened}
          isSignInModalOpened={isSignInModalOpened}
          isDocsFilterModalOpened={isDocsFilterModalOpened}
        />
        {isLoading && <StyledLoader />}
      </SearchInputContainer>
      <Menu>
        <ResultsFiltersMenu
          activeFilter={activeFilter}
          onFilterSelect={onFilterSelect}
        />
        {isDev && <Dev>[dev build]</Dev>}
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

export { ResultsFilter };

export default SearchHeaderPanel;
