import React, {
  useEffect,
  useState,
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

function Home() {
  //const [searchQuery, setSearchQuery] = useState('firestore collection() where');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);
  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);

  const [focusedIdx, setFocusedIdx] = useState(0);

  useEffect(() => {
    async function searchSO(query: string) {
      // const results = await searchStackOverflow(query);
      // console.log('StackOverflow', results);
    }

    async function searchCode(query: string) {
      searchGitHubCode(query)
      .then(setCodeResults);
    }

    if (!debouncedQuery) return;

    switch (activeFilter) {
      case FilterType.All:
        searchSO(debouncedQuery);
        searchCode(debouncedQuery);
      break;
      case FilterType.StackOverflow:
        searchSO(debouncedQuery);
      break;
      case FilterType.GitHubCode:
        searchCode(debouncedQuery);
      break;
    }
  }, [activeFilter, debouncedQuery]);

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
    if (focusedIdx < codeResults.length) setFocusedIdx(idx => idx+1);
  }, { filter: () => true }, [codeResults, focusedIdx, setFocusedIdx]);

  return (
    <Content>
      <SearchInput
        placeholder="Question or code"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        activeFilter={activeFilter}
        onFilterSelect={f => setActiveFilter(f)}
      />

      <SearchResults>
        {codeResults.map((cr, idx) => (
          <GitHubCodeResult
            key={cr.full_name + cr.file_path}
            codeResult={cr}
            isFocused={focusedIdx === idx}
          />
        ))}
      </SearchResults>
    </Content>
  );
}

export default Home;

