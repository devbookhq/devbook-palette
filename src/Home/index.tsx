import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import { hideMainWindow } from 'mainProcess';
import useDebounce from 'hooks/useDebounce';
import {
  search as searchStackOverflow,
  StackOverflowResult,
} from 'search/stackOverflow';
import {
  searchCode as searchGitHubCode,
  CodeResult,
} from 'search/gitHub';

import SearchInput, { ResultsFilter } from './SearchInput';
import StackOverflowItem from './StackOverflowItem';
import StackOverflowModal from './StackOverflowModal';
import GitHubCodeItem from './GitHubCodeItem';
import GitHubCodeModal from './GitHubCodeModal';

const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ResultsHeading = styled.div`
  margin-bottom: 10px;
  color: #5A5A6F;
  font-size: 14px;
  font-weight: 500;
`;

const SearchResults = styled.div`
  flex: 1;
  padding: 10px 15px;

  overflow: hidden;
  overflow-y: overlay;
`;

const InfoMessage = styled.div`
  margin: 50px auto 0;
  color: #909090;
  font-size: 16px;
  font-weight: 600;
`;

const HotkeysPanel = styled.div`
  /*
  position: absolute;
  bottom: 0;
  margin: 0 auto 10px;
  width: 95%;
  z-index: 10;
  */
  width: 100%;
  padding: 10px 15px;

  display: flex;
  align-items: center;

  /* border-top: 1px solid #404244; */
  // border: 1px solid #404244;
  // border-radius: 5px;
  // background: #2B2D2F;
  background: #1F212D;
  // box-shadow: 0px 0px 23px 13px rgba(0, 0, 0, 0.2);
`;

const Hotkey = styled.div`
  margin-right: 15px;

  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

function Home() {
  const [searchQuery, setSearchQuery] = useState('firestore where');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [activeFilter, setActiveFilter] = useState<ResultsFilter>(ResultsFilter.StackOverflow);

  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [soResults, setSOResults] = useState<StackOverflowResult[]>([]);

  const [codeFocusedIdx, setCodeFocusedIdx] = useState(0);
  const [soFocusedIdx, setSOFocusedIdx] = useState(0);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);

  const [isSOModalOpened, setIsSOModalOpened] = useState(false);
  const [isGitHubModalOpened, setIsGitHubModalOpened] = useState(false);

  const isModalOpened = isSOModalOpened || isGitHubModalOpened;

  useHotkeys('alt+shift+1', (e: any) => {
    if (isModalOpened) {
      // TODO: Check what exactly is prevent default doing here
      e.preventDefault();
      return;
    }

    setActiveFilter(ResultsFilter.StackOverflow);
    e.preventDefault();
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('alt+shift+2', (e: any) => {
    if (isModalOpened) {
      // TODO: Check what exactly is prevent default doing here
      e.preventDefault();
      return;
    }

    setActiveFilter(ResultsFilter.GitHubCode);
    e.preventDefault();
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('up', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx > 0) setSOFocusedIdx(idx => idx - 1);
        break;
      case ResultsFilter.GitHubCode:
        if (codeFocusedIdx > 0) setCodeFocusedIdx(idx => idx - 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, codeFocusedIdx, activeFilter]);

  useHotkeys('down', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx < soResults.length - 1) setSOFocusedIdx(idx => idx + 1);
        break;
      case ResultsFilter.GitHubCode:
        if (codeFocusedIdx < codeResults.length - 1) setCodeFocusedIdx(idx => idx + 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, soResults, codeFocusedIdx, codeResults, activeFilter]);

  useHotkeys('enter', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        setIsSOModalOpened(true);
        break;
      case ResultsFilter.GitHubCode:
        setIsGitHubModalOpened(true);
        break;
    }
  }, [activeFilter]);

  useHotkeys('esc', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (!isSOModalOpened) {
          hideMainWindow();
        } else {
          setIsSOModalOpened(false);
        }
        break;
      case ResultsFilter.GitHubCode:
        if (!isGitHubModalOpened) {
          hideMainWindow();
        } else {
          setIsGitHubModalOpened(false);
        }
        break;
    }
  }, [isSOModalOpened, isGitHubModalOpened, activeFilter]);

  useEffect(() => {
    async function searchSO(query: string) {
      setSOResults([]);
      const results = await searchStackOverflow(query);
      setIsSOModalOpened(false);

      setHasEmptyResults(results.length === 0);
      setSOResults(results);
      setSOFocusedIdx(0);
      setIsLoadingData(false);
    }

    async function searchCode(query: string) {
      setCodeResults([]);
      const results = await searchGitHubCode(query);
      setIsGitHubModalOpened(false);

      setHasEmptyResults(results.length === 0);
      setCodeResults(results);
      setCodeFocusedIdx(0);
      setIsLoadingData(false);
    }

    if (!debouncedQuery) return;

    setIsLoadingData(true);
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        searchSO(debouncedQuery);
        break;
      case ResultsFilter.GitHubCode:
        searchCode(debouncedQuery);
        break;
    }
  }, [activeFilter, debouncedQuery]);

  return (
    <>
      {isSOModalOpened && soResults[soFocusedIdx] &&
        <StackOverflowModal
          soResult={soResults[soFocusedIdx]}
          onCloseRequest={() => setIsSOModalOpened(false)}
        />
      }

      {isGitHubModalOpened && codeResults[codeFocusedIdx] &&
        <GitHubCodeModal
          codeResult={codeResults[codeFocusedIdx]}
          onCloseRequest={() => setIsGitHubModalOpened(false)}
        />
      }

      <Content>
        <SearchInput
          placeholder="Question or code"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          activeFilter={activeFilter}
          onFilterSelect={f => setActiveFilter(f)}
          isLoading={isLoadingData}
          isModalOpened={isSOModalOpened}
        />

        {!searchQuery && <InfoMessage>Type your search query</InfoMessage>}
        {searchQuery && hasEmptyResults && <InfoMessage>Nothing found</InfoMessage>}
        {searchQuery && !hasEmptyResults &&
          <>
            <SearchResults>
              <>
                {activeFilter === ResultsFilter.StackOverflow && soResults.map((sor, idx) => (
                  <StackOverflowItem
                    key={sor.question.html} // TODO: Not sure if setting HTML as a key is a good idea.
                    soResult={sor}
                    isFocused={soFocusedIdx === idx}
                  />
                ))}

                {activeFilter === ResultsFilter.GitHubCode && codeResults.map((cr, idx) => (
                  <GitHubCodeItem
                    key={cr.repoFullName + cr.filePath}
                    codeResult={cr}
                    isFocused={codeFocusedIdx === idx}
                  />
                ))}
              </>
            </SearchResults>

            <HotkeysPanel>
              <Hotkey>DETAIL - Enter</Hotkey>
              <Hotkey>OPEN IN BROWSER - Shift + Enter</Hotkey>
            </HotkeysPanel>
          </>
        }

      </Content>
    </>
  );
}

export default Home;
