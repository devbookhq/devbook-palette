import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import {
  hideMainWindow,
  openLink,
  createTmpFile,
} from 'mainProcess';
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
import HotkeysPanel, { HotkeyWithText } from './HotkeysPanel';
import { ModifierKey } from './HotkeysPanel/Hotkey';
import FocusState from './SearchItemFocusState';
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

interface FocusIndex {
  idx: number;
  focusState: FocusState;
}

const soResultsHotkeys: HotkeyWithText[] = [
  {text: 'Navigate', hotkey: ['ARROWS']},
  {text: 'Show detail', hotkey: ['ENTER']},
  {text: 'Open in browser', hotkey: [ModifierKey.Command, 'O']},
];
const soModalHotkeys: HotkeyWithText[] = [
  {text: 'Navigate', hotkey: ['ARROWS']},
  {text: 'Open in browser', hotkey: [ModifierKey.Command, 'O']},
  {text: 'Close', hotkey: ['ESC']},
];

const gitHubCodeResultsHotkeys: HotkeyWithText[] = [
  {text: 'Navigate', hotkey: ['ARROWS']},
  {text: 'Show detail', hotkey: ['ENTER']},
  {text: 'Open in VSCode', hotkey: [ModifierKey.Command, 'I']},
  {text: 'Open in browser', hotkey: [ModifierKey.Command, 'O']},
];
const gitHubModalHotkeys: HotkeyWithText[] = [
  {text: 'Navigate', hotkey: ['ARROWS']},
  {text: 'Open in VSCode', hotkey: [ModifierKey.Command, 'I']},
  {text: 'Open in browser', hotkey: [ModifierKey.Command, 'O']},
  {text: 'Close', hotkey: ['ESC']},
];

function Home() {
  const [searchQuery, setSearchQuery] = useState('firestore where query');

  const trimmedSearchQuery = searchQuery.trim();
  const debouncedQuery = useDebounce(trimmedSearchQuery, 400);

  const [activeFilter, setActiveFilter] = useState<ResultsFilter>(ResultsFilter.StackOverflow);

  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [soResults, setSOResults] = useState<StackOverflowResult[]>([]);

  const [codeFocusedIdx, setCodeFocusedIdx] = useState<FocusIndex>({
    idx: 0,
    focusState: FocusState.NoScroll,
  });
  const [soFocusedIdx, setSOFocusedIdx] = useState<FocusIndex>({
    idx: 0,
    focusState: FocusState.NoScroll,
  });
  // User opens the app with the StackOverflow search filter active.
  const [activeHotkeys, setActiveHotkeys] = useState<HotkeyWithText[]>(soResultsHotkeys);

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

  async function openFileInVSCode(path: string, content: string) {
    const tmpPath = await createTmpFile({
      filePath: path,
      fileContent: content,
    });
    if (tmpPath) {
      const vscodeFileURL = `vscode://file/${tmpPath}`;
      await openLink(vscodeFileURL);
    } else {
      // TODO: Handle error for user.
      console.error('Cannot create tmp file with the file content.')
    }
  }

  useEffect(() => {
    if (!isSOModalOpened && !isCodeModalOpened) {
      if (activeFilter === ResultsFilter.StackOverflow) setActiveHotkeys(soResultsHotkeys);
      if (activeFilter === ResultsFilter.GitHubCode) setActiveHotkeys(gitHubCodeResultsHotkeys);
    }

    if (isSOModalOpened) setActiveHotkeys(soModalHotkeys);
    if (isCodeModalOpened) setActiveHotkeys(gitHubModalHotkeys);
  }, [isSOModalOpened, isCodeModalOpened, activeFilter]);

  // 'cmd+1' hotkey - change search filter to SO questions.
  useHotkeys('Cmd+1', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.StackOverflow);
  }, { filter: () => true }, [isModalOpened]);

  // 'cmd+2' hotkey - change search filter to GitHub Code search.
  useHotkeys('Cmd+2', () => {
    if (!isModalOpened) setActiveFilter(ResultsFilter.GitHubCode);
  }, { filter: () => true }, [isModalOpened]);

  // 'up arrow' hotkey - navigation.
  useHotkeys('up', () => {
    if (isModalOpened) return;

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
        if (codeFocusedIdx.idx > 0) {
          setCodeFocusedIdx(current => ({
            idx: current.idx - 1,
            focusState: FocusState.WithScroll,
          }));
        }
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, codeFocusedIdx.idx, activeFilter, isModalOpened]);

  // 'down arrow' hotkey - navigation.
  useHotkeys('down', () => {
    if (isModalOpened) return;

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
        if (codeFocusedIdx.idx < codeResults.length - 1) {
          setCodeFocusedIdx(current => ({
            idx: current.idx + 1,
            focusState: FocusState.WithScroll
          }));
        }
        break;
    }
  }, { filter: () => true }, [soFocusedIdx, soResults, codeFocusedIdx, codeResults, activeFilter, isModalOpened]);

  // 'enter' hotkey - open the focused result in a modal.
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

  // 'esc' hotkey - close modal or hide main window.
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

  // 'cmd+o' hotkey - open the focused result in a browser.
  useHotkeys('Cmd+o', () => {
    let url = '';
    switch (activeFilter) {
      case ResultsFilter.StackOverflow: {
        const item = soResults[soFocusedIdx.idx];
        if (item) url = item.question.link;
        break;
      }
      case ResultsFilter.GitHubCode: {
        const item = codeResults[codeFocusedIdx.idx];
        if (item) url = item.fileURL;
        break;
      }
    }
    if (url) openLink(url);
  }, [activeFilter, soResults, soFocusedIdx, codeResults, codeFocusedIdx]);


  // 'cmd+i' hotkey - open the GitHubCode result in a vscode.
  useHotkeys('Cmd+i', () => {
    if (activeFilter === ResultsFilter.GitHubCode) {
      const item = codeResults[codeFocusedIdx.idx];
      if (!item) return;

      openFileInVSCode(item.filePath, item.fileContent);
    }
  }, [activeFilter, codeResults, codeFocusedIdx]);

  useEffect(() => {
    async function searchSO(query: string) {
      setIsLoadingSO(true);
      setSOResults([]);
      const results = await searchStackOverflow(query);
      setIsSOModalOpened(false);

      setSOResults(results);
      setSOFocusedIdx({
        idx: 0,
        focusState: FocusState.WithScroll
      });
      setIsLoadingSO(false);
    }

    async function searchCode(query: string) {
      setIsLoadingCode(true);
      setCodeResults([]);
      const results = await searchGitHubCode(query);
      setIsCodeModalOpened(false);

      setCodeResults(results);
      setCodeFocusedIdx({
        idx: 0,
        focusState: FocusState.WithScroll
      });
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
      {isSOModalOpened && soResults[soFocusedIdx.idx] &&
        <StackOverflowModal
          soResult={soResults[soFocusedIdx.idx]}
          onCloseRequest={() => setIsSOModalOpened(false)}
        />
      }

      {isCodeModalOpened && codeResults[codeFocusedIdx.idx] &&
        <CodeModal
          codeResult={codeResults[codeFocusedIdx.idx]}
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
              <>
                {activeFilter === ResultsFilter.StackOverflow && soResults.map((sor, idx) => (
                  <StackOverflowItem
                    key={sor.question.html} // TODO: Not sure if setting HTML as a key is a good idea.
                    soResult={sor}
                    focusState={soFocusedIdx.idx === idx ? soFocusedIdx.focusState : FocusState.None}
                    onHeaderClick={() => setSOFocusedIdx({ idx, focusState: FocusState.NoScroll })}
                    onTitleClick={() => setIsSOModalOpened(true)}
                  />
                ))}

                {activeFilter === ResultsFilter.GitHubCode && codeResults.map((cr, idx) => (
                  <CodeItem
                    key={cr.repoFullName + cr.filePath}
                    codeResult={cr}
                    focusState={codeFocusedIdx.idx === idx ? codeFocusedIdx.focusState : FocusState.None}
                    onHeaderClick={() => setCodeFocusedIdx({ idx, focusState: FocusState.NoScroll })}
                    onFilePathClick={() => setIsCodeModalOpened(true)}
                  />
                ))}
              </>
            </SearchResults>

            <HotkeysPanel
              hotkeys={activeHotkeys}
            />
          </>
        }
      </Container>
    </>
  );
}

export default Home;

