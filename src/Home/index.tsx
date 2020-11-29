import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import useDebounce from 'hooks/useDebounce';
import useOnWindowResize from 'hooks/useOnWindowResize';

import {
  search as searchStackOverflow,
  StackOverflowResult,
} from 'search/stackoverflow';
import {
  searchCode as searchGitHubCode,
  CodeResult,
} from 'search/gitHub';

import SearchInput, { FilterType } from './SearchInput';
import StackOverflowItem from './StackOverflowItem';
import GitHubCodeItem from './GitHubCodeItem';

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
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsWidth, setResultsWidth] = useState(0);

  const [searchQuery, setSearchQuery] = useState('javascript show alert');
  const debouncedQuery = useDebounce(searchQuery, 400);
  // TODO: Change to FilterType.All.
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.StackOverflow);

  const [codeResults, setCodeResults] = useState<CodeResult[]>([]);
  const [soResults, setSOResults] = useState<StackOverflowResult[]>([]);

  // TODO: We have two result variables but only one index.
  const [focusedIdx, setFocusedIdx] = useState(0);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);

  useEffect(() => {
    async function searchSO(query: string) {
      const results = await searchStackOverflow(query);
      setSOResults(results);
      console.log('StackOverflow', results);
      setIsLoadingData(false);
    }

    async function searchCode(query: string) {
      const results = await searchGitHubCode(query);
      console.log('GitHub', results);
      setHasEmptyResults(results.length === 0);
      setCodeResults(results);
      setIsLoadingData(false);
    }

    async function searchAll(query: string) {
      const results = await searchGitHubCode(query);
      setHasEmptyResults(results.length === 0);
      setCodeResults(results);

      // TODO: Unify results from GitHub and from StackOverflow.
      // const soResults = await searchStackOverflow(query);

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
  }, [activeFilter, debouncedQuery, setIsLoadingData, setSOResults, setCodeResults]);

  useOnWindowResize((e: any) => {
    if (!resultsRef?.current) return;
    // NOTE: This only works if the values are in pixels!
    const style = resultsRef.current.style;
    const margin = (parseFloat(style.marginLeft) + parseFloat(style.marginRight)) || 0;
    const padding = (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) || 0;
    const border = (parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth)) || 0;
    setResultsWidth(resultsRef.current.offsetWidth + margin + padding + border);
  }, [resultsRef, setResultsWidth]);

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

      {/*
        SearchResults must not be rendered conditionally so we can calculate its width
        before we fetch the search results.
      */}
      <SearchResults
        ref={resultsRef}
      >
        {searchQuery && soResults.length > 0 && soResults.map(sor => (
          <StackOverflowItem
            key={sor.question.html} // TODO: Not sure if setting HTML as a key is a good idea.
            soResult={sor}
            parentWidth={resultsWidth}
          />
        ))}
      </SearchResults>

      {/*
      {!searchQuery && <InfoMessage>Type your search query</InfoMessage>}
      {searchQuery && hasEmptyResults && <InfoMessage>Nothing found</InfoMessage>}
      {searchQuery && codeResults.length > 0 &&
        <SearchResults
          ref={resultsRef}
        >
          {codeResults.map((cr, idx) => (
            <GitHubCodeItem
              key={cr.repoFullName + cr.filePath}
              codeResult={cr}
              isFocused={focusedIdx === idx}
              parentWidth={resultsWidth}
            />
          ))}
        </SearchResults>
      }
      */}

    </Content>
  );
}

export default Home;

