import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import {
  hideMainWindow,
  connectGitHub,
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
  init as initGitHub,
  FilePreview,
} from 'search/gitHub';

import SearchInput, { ResultsFilter } from './SearchInput';
import HotkeysPanel, { HotkeyWithText } from './HotkeysPanel';
import { Key } from './HotkeysPanel/Hotkey';
import FocusState from './SearchItemFocusState';
import StackOverflowModal from './StackOverflow/StackOverflowModal';
import StackOverflowItem from './StackOverflow/StackOverflowItem';
import CodeItem from './GitHub/CodeItem';
import CodeModal from './GitHub/CodeModal';
import useIPCRenderer from 'hooks/useIPCRenderer';
import Button from 'components/Button';

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
  margin: 100px auto 0;
  
  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const GitHubConnect = styled.div`
  margin: 100px auto 0;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const ConnectGitHubButton = styled(Button)`
  margin-bottom: 15px;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;

const GitHubConnectTitle = styled(InfoMessage)`
  margin: 0 0 30px;
`;

const GitHubPrivacyLink = styled.div`
  color: #535BD7;
  font-size: 14px;
  font-weight: 500;

  text-decoration: underline;

  :hover {
    cursor: pointer;
  }
`;

interface FocusIndex {
  idx: number;
  focusState: FocusState;
}

type Hotkeys = { left: HotkeyWithText[], right: HotkeyWithText[] };

const soResultsHotkeys: Hotkeys = {
  left: [
    { text: 'Navigate', hotkey: [Key.ArrowUp, Key.ArrowDown] },
    { text: 'Show detail', hotkey: [Key.Enter] },
  ],
  right: [
    { text: 'Open in browser', hotkey: [Key.Command, 'O'] },
  ],
};
const soModalHotkeys: Hotkeys = {
  left: [
    { text: 'Navigate', hotkey: [Key.ArrowUp, Key.ArrowDown] },
  ],
  right: [
    { text: 'Open in browser', hotkey: [Key.Command, 'O'] },
    { text: 'Close', hotkey: ['Esc'] },
  ],
};

const gitHubCodeResultsHotkeys: Hotkeys = {
  left: [
    { text: 'Navigate', hotkey: [Key.ArrowUp, Key.ArrowDown] },
    { text: 'Show detail', hotkey: [Key.Enter] },
  ],
  right: [
    { text: 'Open in VSCode', hotkey: [Key.Command, 'I'] },
    { text: 'Open in browser', hotkey: [Key.Command, 'O'] },
  ],
};
const gitHubModalHotkeys: Hotkeys = {
  left: [
    { text: 'Navigate', hotkey: [Key.ArrowUp, Key.ArrowDown] },
  ],
  right: [
    { text: 'Open in VSCode', hotkey: [Key.Command, 'I'] },
    { text: 'Open in browser', hotkey: [Key.Command, 'O'] },
    { text: 'Close', hotkey: ['Esc'] },
  ],
};

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
  const [activeHotkeys, setActiveHotkeys] = useState<Hotkeys>(soResultsHotkeys);

  const [isLoadingSO, setIsLoadingSO] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const [isSOModalOpened, setIsSOModalOpened] = useState(false);
  const [isCodeModalOpened, setIsCodeModalOpened] = useState(false);

  const [currentResultsQuery, setCurrentResultsQuery] = useState('');

  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  // TODO: There is surely a better way to write this, probably a reducer.
  // We will refactor this when we have the time.
  const [gitHubConnectedPreviousState, setGitHubConnectedPreviousState] = useState(false);

  const isModalOpened =
    (isSOModalOpened && activeFilter === ResultsFilter.StackOverflow) ||
    (isCodeModalOpened && activeFilter === ResultsFilter.GitHubCode);

  const isLoading =
    (isLoadingSO && activeFilter === ResultsFilter.StackOverflow) ||
    (isLoadingCode && activeFilter === ResultsFilter.GitHubCode);

  const hasEmptyResults =
    (soResults.length === 0 && activeFilter === ResultsFilter.StackOverflow) ||
    (codeResults.length === 0 && activeFilter === ResultsFilter.GitHubCode);

  async function openFileInVSCode(path: string, content: string, filePreviews: FilePreview[]) {
    const tmpPath = await createTmpFile({
      filePath: path,
      fileContent: content,
    });
    if (tmpPath) {
      const firstPreview = filePreviews[0];
      const vscodeFileURL = firstPreview ? `vscode://file/${tmpPath}:${firstPreview.startLine + 3}` : `vscode://file/${tmpPath}`;
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
        const firstPreview = item?.filePreviews[0];
        const gitHubFileURL = firstPreview ? `${item.fileURL}#L${firstPreview.startLine + 3}` : item?.fileURL;
        if (item) url = gitHubFileURL;
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

      openFileInVSCode(item.filePath, item.fileContent, item.filePreviews);
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
        focusState: FocusState.WithScroll,
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
        focusState: FocusState.WithScroll,
      });
      setIsLoadingCode(false);
    }

    async function search(query: string, activeFilter: ResultsFilter) {
      if (activeFilter === ResultsFilter.StackOverflow) {
        await searchSO(query);
        if (isGitHubConnected) searchCode(query);
      } else if (activeFilter === ResultsFilter.GitHubCode) {
        if (isGitHubConnected) await searchCode(query);
        searchSO(query);
      }
    }

    if (debouncedQuery && debouncedQuery !== currentResultsQuery) {
      setCurrentResultsQuery(debouncedQuery);
      search(debouncedQuery, activeFilter);
    }

    if (isGitHubConnected && !gitHubConnectedPreviousState) {
      setGitHubConnectedPreviousState(true);
      searchCode(debouncedQuery);
    }

  }, [debouncedQuery, currentResultsQuery, activeFilter, isGitHubConnected, gitHubConnectedPreviousState]);

  useEffect(() => {
    async function checkGitHubAccount() {
      try {
        await initGitHub();
        setIsGitHubConnected(true);
      } catch (error) {
        console.error('Cannot find connected GitHub Account');
      }
    }

    if (!isGitHubConnected) checkGitHubAccount();
  }, [isGitHubConnected]);

  useIPCRenderer('github-access-token', async (event, { accessToken }: { accessToken: string }) => {
    await initGitHub(accessToken);
    setIsGitHubConnected(true);
  });

  async function openPrivacyTerms() {
    // TODO: Add route describing privacy to our website address.
    return openLink('https://usedevbook.com');
  }

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

        {!searchQuery && (isGitHubConnected || activeFilter === ResultsFilter.StackOverflow) && !isLoading && <InfoMessage>Type your search query</InfoMessage>}
        {searchQuery && (isGitHubConnected || activeFilter === ResultsFilter.StackOverflow) && hasEmptyResults && !isLoading && <InfoMessage>Nothing found</InfoMessage>}

        {activeFilter === ResultsFilter.GitHubCode && !isGitHubConnected &&
          <GitHubConnect>
            <GitHubConnectTitle>
              Connect your GitHub account to search on GitHub
            </GitHubConnectTitle>
            <ConnectGitHubButton onClick={() => connectGitHub()}>
              Connect my GitHub account
            </ConnectGitHubButton>
            <GitHubPrivacyLink onClick={openPrivacyTerms}>
              Read more about privacy and what access Devbook needs
            </GitHubPrivacyLink>
          </GitHubConnect>
        }

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

                {activeFilter === ResultsFilter.GitHubCode && isGitHubConnected && codeResults.map((cr, idx) => (
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
              hotkeysLeft={activeHotkeys.left}
              hotkeysRight={activeHotkeys.right}
            />
          </>
        }
      </Container>
    </>
  );
}

export default Home;
