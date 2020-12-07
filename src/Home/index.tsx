import React, {
  useEffect,
  useState,
  useRef,
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
import StackOverflowItem, { FocusState } from './StackOverflow/StackOverflowItem';
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
  // const [searchQuery, setSearchQuery] = useState('Load Balancing with Node and Heroku');
  const [searchQuery, setSearchQuery] = useState('firestore where query');
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [activeFilter, setActiveFilter] = useState<ResultsFilter>(ResultsFilter.StackOverflow);

  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [soResults, setSOResults] = useState<StackOverflowResult[]>([]);

  const [codeFocusedIdx, setCodeFocusedIdx] = useState(0);
  const [soFocusedIdx, setSOFocusedIdx] = useState<{ idx: number, focusState: FocusState }>({
    idx: 0,
    focusState: FocusState.NoScroll,
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);

  const [isSOModalOpened, setIsSOModalOpened] = useState(false);
  const [isGitHubModalOpened, setIsGitHubModalOpened] = useState(false);
  const isModalOpened = isSOModalOpened || isGitHubModalOpened;

  function openSOModal() {
    setIsSOModalOpened(true);
  }

  useHotkeys('Cmd+1', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.StackOverflow);
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('Cmd+2', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.GitHubCode);
  }, { filter: () => true }, [isModalOpened]);

  useHotkeys('up', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx.idx > 0) {
          setSOFocusedIdx(current => ({
            idx: current.idx - 1,
            focusState: FocusState.WithScroll,
          }));
        }
        break;
      case ResultsFilter.GitHubCode:
        if (!isModalOpened && codeFocusedIdx > 0) setCodeFocusedIdx(idx => idx - 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, codeFocusedIdx, activeFilter, isModalOpened]);

  useHotkeys('down', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        if (soFocusedIdx.idx < soResults.length - 1) {
          setSOFocusedIdx(current => ({
            idx: current.idx + 1,
            focusState: FocusState.WithScroll
          }));
        };
        break;
      case ResultsFilter.GitHubCode:
        if (!isModalOpened && codeFocusedIdx < codeResults.length - 1) setCodeFocusedIdx(idx => idx + 1);
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, soResults, codeFocusedIdx, codeResults, activeFilter, isModalOpened]);

  useHotkeys('enter', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        openSOModal();
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

      setSOFocusedIdx({
        idx: 0,
        focusState: FocusState.WithScroll
      });

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
      {isSOModalOpened && soResults[soFocusedIdx.idx] &&
        <StackOverflowModal
          soResult={soResults[soFocusedIdx.idx]}
          onCloseRequest={() => setIsSOModalOpened(false)}
        />
      }

      {isGitHubModalOpened && codeResults[codeFocusedIdx] &&
        <CodeModal
          codeResult={codeResults[codeFocusedIdx]}
          onCloseRequest={() => setIsGitHubModalOpened(false)}
        />
      }

      <Container>
        <SearchInput
          placeholder="Question or code"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          activeFilter={activeFilter}
          onFilterSelect={f => setActiveFilter(f)}
          isLoading={isLoadingData}
          isModalOpened={isModalOpened}
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
                    focusState={soFocusedIdx.idx === idx ? soFocusedIdx.focusState : FocusState.None}
                    onHeaderClick={() => setSOFocusedIdx({ idx, focusState: FocusState.NoScroll})}
                    onTitleClick={() => openSOModal()}
                  />
                ))}

                {activeFilter === ResultsFilter.GitHubCode && codeResults.map((cr, idx) => (
                  <CodeItem
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
      </Container>
    </>
  );
}

export default Home;

