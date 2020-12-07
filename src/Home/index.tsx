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
import StackOverflowModal from './StackOverflow/StackOverflowModal';
import StackOverflowItem from './StackOverflow/StackOverflowItem';
import CodeItem from './GitHub/CodeItem';
import CodeModal from './GitHub/CodeModal';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SearchResults = styled.div`
  flex: 1;
  margin-top: 15px;
  padding: 10px 15px;

  overflow: hidden;
  overflow-y: overlay;
`;

const InfoMessage = styled.div`
  margin: 50px auto 0;
  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const HotkeysPanel = styled.div`
  width: 100%;
  padding: 10px 15px;

  display: flex;
  align-items: center;

  background: #1F212D;
`;

const Hotkey = styled.div`
  margin-right: 15px;

  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

function Home() {
  const [searchQuery, setSearchQuery] = useState('firestore where query');

  const trimmedSearchQuery = searchQuery.trim();
  const debouncedQuery = useDebounce(trimmedSearchQuery, 400);

  const [activeFilter, setActiveFilter] = useState<ResultsFilter>(ResultsFilter.StackOverflow);

  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [soResults, setSOResults] = useState<StackOverflowResult[]>([]);

  const [codeFocusedIdx, setCodeFocusedIdx] = useState(0);
  const [soFocusedIdx, setSOFocusedIdx] = useState(0);

  const [isLoadingSO, setIsLoadingSO] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const [isSOModalOpened, setIsSOModalOpened] = useState(false);
  const [isCodeModalOpened, setIsCodeModalOpened] = useState(false);

  const [usedQuery, setUsedQuery] = useState<string>();

  const isModalOpened =
    (isSOModalOpened && activeFilter === ResultsFilter.StackOverflow) ||
    (isCodeModalOpened && activeFilter === ResultsFilter.GitHubCode);

  const isLoading =
    (isLoadingSO && activeFilter === ResultsFilter.StackOverflow) ||
    (isLoadingCode && activeFilter === ResultsFilter.GitHubCode);

  const hasEmptyResults =
    (soResults.length === 0 && activeFilter === ResultsFilter.StackOverflow) ||
    (codeResults.length === 0 && activeFilter === ResultsFilter.GitHubCode);

  useHotkeys('Cmd+1', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.StackOverflow);
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('Cmd+2', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.GitHubCode);
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('up', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx > 0) setSOFocusedIdx(idx => idx - 1);
        break;
      case ResultsFilter.GitHubCode:
        if (!isModalOpened && codeFocusedIdx > 0) setCodeFocusedIdx(idx => idx - 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, codeFocusedIdx, activeFilter, isModalOpened]);

  useHotkeys('down', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx < soResults.length - 1) setSOFocusedIdx(idx => idx + 1);
        break;
      case ResultsFilter.GitHubCode:
        if (!isModalOpened && codeFocusedIdx < codeResults.length - 1) setCodeFocusedIdx(idx => idx + 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, soResults, codeFocusedIdx, codeResults, activeFilter, isModalOpened]);

  useHotkeys('enter', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        setIsSOModalOpened(true);
        break;
      case ResultsFilter.GitHubCode:
        setIsCodeModalOpened(true);
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
        if (!isCodeModalOpened) {
          hideMainWindow();
        } else {
          setIsCodeModalOpened(false);
        }
        break;
    }
  }, [isSOModalOpened, isCodeModalOpened, activeFilter]);

  useEffect(() => {
    async function searchSO(query: string) {
      setIsLoadingSO(true);
      setSOResults([]);
      const results = await searchStackOverflow(query);
      setIsSOModalOpened(false);

      setSOResults(results);
      setSOFocusedIdx(0);
      setIsLoadingSO(false);
    }

    async function searchCode(query: string) {
      setIsLoadingCode(true);
      setCodeResults([]);
      const results = await searchGitHubCode(query);
      setIsCodeModalOpened(false);

      setCodeResults(results);
      setCodeFocusedIdx(0);
      setIsLoadingCode(false);
    }

    async function search(query: string, activeFilter: ResultsFilter) {
      setUsedQuery(query);

      if (activeFilter === ResultsFilter.StackOverflow) {
        await searchSO(query);
        searchCode(query);
      } else if (activeFilter === ResultsFilter.GitHubCode) {
        await searchCode(query);
        searchSO(query);
      }
    }

    if (debouncedQuery && debouncedQuery !== usedQuery) {
      search(debouncedQuery, activeFilter);
    }
  }, [debouncedQuery, usedQuery, activeFilter]);

  return (
    <>
      {isSOModalOpened && soResults[soFocusedIdx] &&
        <StackOverflowModal
          soResult={soResults[soFocusedIdx]}
          onCloseRequest={() => setIsSOModalOpened(false)}
        />
      }

      {isCodeModalOpened && codeResults[codeFocusedIdx] &&
        <CodeModal
          codeResult={codeResults[codeFocusedIdx]}
          onCloseRequest={() => setIsCodeModalOpened(false)}
        />
      }

      <Container>
        <SearchInput
          placeholder="Question or code"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          activeFilter={activeFilter}
          onFilterSelect={f => setActiveFilter(f)}
          isLoading={isLoading}
          isModalOpened={isModalOpened}
        />

        {!searchQuery && !isLoading && <InfoMessage>Type your search query</InfoMessage>}
        {searchQuery && hasEmptyResults && !isLoading && <InfoMessage>Nothing found</InfoMessage>}
        {searchQuery && !hasEmptyResults && !isLoading &&
          <>
            <SearchResults>
              {activeFilter === ResultsFilter.StackOverflow && soResults.map((sor, idx) => (
                <StackOverflowItem
                  key={sor.question.html} // TODO: Not sure if setting HTML as a key is a good idea.
                  soResult={sor}
                  isFocused={soFocusedIdx === idx}
                />
              ))}

              {activeFilter === ResultsFilter.GitHubCode && codeResults.map((cr, idx) => (
                <CodeItem
                  key={cr.repoFullName + cr.filePath}
                  codeResult={cr}
                  isFocused={codeFocusedIdx === idx}
                />
              ))}
            </SearchResults>

            <HotkeysPanel>
              <Hotkey>DETAIL - Enter</Hotkey>
              <Hotkey>OPEN IN BROWSER - Shift + Enter</Hotkey>
            </HotkeysPanel>
          </>
        }
      </Container>
    </>
  );
}

export default Home;
