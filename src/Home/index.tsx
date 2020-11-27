import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import useDebounce from 'hooks/useDebounce';

import { search as searchStackOverflow } from 'search/stackoverflow';
import {
  searchCode as searchGitHubCode,
  CodeResult,
} from 'search/gitHub';

import SearchInput, { FilterType } from './SearchInput';
import GitHubCodeResult from './GitHubCodeResult';

const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchResults = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px 10px 0;
  overflow-y: auto;
`;

const InfoMessage = styled.div`
  margin: 50px auto 0;
  color: #909090;
  font-size: 16px;
  font-weight: 600;
`;

function Home() {
  //const [searchQuery, setSearchQuery] = useState('firestore collection() where');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);
  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);

  const [focusedIdx, setFocusedIdx] = useState(0);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);

  useEffect(() => {
    async function searchSO(query: string) {
      // const results = await searchStackOverflow(query);
      // console.log('StackOverflow', results);
      setIsLoadingData(false);
    }

    async function searchCode(query: string) {
      const results = await searchGitHubCode(query);
      setHasEmptyResults(results.length === 0);
      setCodeResults(results);
      setIsLoadingData(false);
    }

    async function searchAll(query: string) {
      const results = await searchGitHubCode(query);
      setHasEmptyResults(results.length === 0);
      setCodeResults(results);
      setIsLoadingData(false);
    }

    if (!debouncedQuery) return;

    setIsLoadingData(true);
    switch (activeFilter) {
      case FilterType.All:
        searchAll(debouncedQuery);
      break;
      case FilterType.StackOverflow:
        searchSO(debouncedQuery);
      break;
      case FilterType.GitHubCode:
        searchCode(debouncedQuery);
      break;
    }
  }, [activeFilter, debouncedQuery, setIsLoadingData]);

  useHotkeys('alt+shift+1', (e: any) => {
    setActiveFilter(FilterType.All);
    e.preventDefault();
  }, { filter: () => true });

  useHotkeys('alt+shift+2', (e: any) => {
    setActiveFilter(FilterType.StackOverflow);
    e.preventDefault();
  }, { filter: () => true });

  useHotkeys('alt+shift+3', (e: any) => {
    setActiveFilter(FilterType.GitHubCode);
    e.preventDefault();
  }, { filter: () => true });

  useHotkeys('up', (e: any) => {
    if (focusedIdx > 0) setFocusedIdx(idx => idx-1);
  }, { filter: () => true }, [focusedIdx, setFocusedIdx]);

  useHotkeys('down', (e: any) => {
    if (focusedIdx < codeResults.length - 1) setFocusedIdx(idx => idx+1);
  }, { filter: () => true }, [codeResults, focusedIdx, setFocusedIdx]);

  return (
    <Content>
      <SearchInput
        placeholder="Question or code"
        value={searchQuery}
        onChange={e =>setSearchQuery(e.target.value)}
        activeFilter={activeFilter}
        onFilterSelect={f => setActiveFilter(f)}
        isLoading={isLoadingData}
      />

      {!searchQuery && <InfoMessage>Type your search query</InfoMessage>}
      {searchQuery && hasEmptyResults && <InfoMessage>Nothing found</InfoMessage>}
      {searchQuery && codeResults.length > 0 &&
        <SearchResults>
          {codeResults.map((cr, idx) => (
            <GitHubCodeResult
              key={cr.full_name + cr.file_path}
              codeResult={cr}
              isFocused={focusedIdx === idx}
            />
          ))}
        </SearchResults>
      }
    </Content>
  );
}

export default Home;

