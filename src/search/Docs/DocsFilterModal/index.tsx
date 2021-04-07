import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import useOnClickOutside from 'hooks/useOnClickOutside';
import ElectronService from 'services/electron.service';
import { DocSource, SearchSource } from 'services/search.service';
import Modal from 'components/Modal';
import { ReactComponent as searchImg } from 'img/search.svg';
import { useSearchStore } from 'Search/search.store';

enum Navigation {
  Mouse,
  Keys,
}

const StyledModal = styled(Modal)`
  height: 100%;
  margin: 60px 0 69px;
  min-width: 550px;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  background: #1C1B26;
  border-radius: 5px;
  border: 1px solid #3B3A4A;
`;

const SearchWrapper = styled.div`
  padding: 10px;
  width: 100%;
  background: #25252E;

  display: flex;
  align-items: center;
  border-bottom: 1px solid #3B3A4A;
`;

const SearchImg = styled(searchImg)`
  margin-right: 8px;
  height: auto;
  width: 18px;

  path {
    stroke: #5A5A6F;
  }
`;

const SearchInput = styled.input`
  width: 100%;

  color: #fff;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Poppins';

  background: #25252E;
  border: none;
  outline: none;

  ::placeholder {
    color: #5A5A6F;
  }
`;

const Content = styled.div`
  padding: 10px 0 50px;

  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderText = styled.span`
  margin: 8px 0;
  width: 100%;
  text-align: center;

  color: #fff;
  font-size: 16px;
  font-weight: 500;
`;

const DocsList = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  overflow: overlay;
`;

const DocRow = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  padding: 5px 10px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  border-bottom: 1px solid #262736;
  background: ${props => props.isFocused ? '#2C2F5A' : 'transparent'};

  :hover {
    background: #2C2F5A;
    cursor: pointer;
  }
`;

const DocsetIcon = styled.img`
  margin-right: 8px;
  min-height: 26px;
  min-width: 26px;
  height: 26px;
  width: 26px;
`;

const DocName = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const FeedbackButton = styled.button`
  margin: 10px 0;
  color: #5A5A6F;
  font-size: 14px;
  font-weight: 600;
  background: none;
  outline: none;
  border: none;
  text-decoration: underline;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

interface DocsFilterModalProps {
  onCloseRequest: () => void;
}

function DocsFilterModal({
  onCloseRequest,
}: DocsFilterModalProps) {
  const searchStore = useSearchStore()


  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onCloseRequest);

  const selectedDocRow = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIdx, setSelectedIdx] = useState(0);

  const filteredSources = useCallback(() => {
    return searchStore.filters.docs.availableFilters.filter(ds => ds.name.toLowerCase().match(new RegExp(escapeRegex(searchQuery.toLowerCase()))));
  }, [searchStore.filters.docs.availableFilters, searchQuery]);

  function escapeRegex(s: string) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function handleInputKeyDown(e: any) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
  }

  function handleFeedbackButtonClick() {
    const url = 'https://docs.google.com/forms/d/e/1FAIpQLSddf3HliA9uU0SZS-EGofU_gvnDcQX_BykzCxri9nsdoQusBw/viewform?usp=sf_link';
    ElectronService.openLink(url);
  }

  function handleDocRowMouseClick(ds: DocSource) {
    searchStore.setSelectedFilter(SearchSource.Docs, ds);
    onCloseRequest();
  }

  useHotkeys('up', () => {
    if (selectedIdx > 0) {
      setSelectedIdx(c => c -= 1);
    }
    selectedDocRow?.current?.scrollIntoView({ block: 'end' });
  }, { filter: () => true }, [selectedIdx]);

  useHotkeys('down', () => {
    if (selectedIdx < filteredSources().length - 1) {
      setSelectedIdx(c => c += 1);
    }
    selectedDocRow?.current?.scrollIntoView({ block: 'end' });
  }, { filter: () => true }, [selectedIdx, filteredSources]);

  useHotkeys('enter', () => {
    searchStore.setSelectedFilter(SearchSource.Docs, filteredSources()[selectedIdx]);
    onCloseRequest();
  }, { filter: () => true }, [selectedIdx, filteredSources]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [searchQuery]);

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
      ref={modalRef}
    >
      <SearchWrapper>
        <SearchImg />
        <SearchInput
          autoFocus
          onKeyDown={handleInputKeyDown}
          placeholder="Python, JavaScript, Docker, etc"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </SearchWrapper>
      <Content>
        <HeaderText>
          Select active documentation
        </HeaderText>
        <FeedbackButton
          onClick={handleFeedbackButtonClick}
        >
          Missing some docs?
        </FeedbackButton>

        <DocsList>
          {filteredSources().map((ds, idx) => (
            <DocRow
              ref={selectedIdx === idx ? selectedDocRow : null}
              key={idx}
              isFocused={idx === selectedIdx}
              onClick={() => handleDocRowMouseClick(ds)}
            >
              <DocsetIcon src={ds.iconURL} />
              <DocName>{ds.name}</DocName>
            </DocRow>
          ))}
        </DocsList>
      </Content>
    </StyledModal>
  );
}

export default DocsFilterModal;
