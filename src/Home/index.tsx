import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';

import useDebounce from 'hooks/useDebounce';

import SearchInput, { FilterType } from './SearchInput';

const Content = styled.div`
  padding: 20px 30px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.All);
  const debouncedQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    // TODO: Search based on the selected filter.
    console.log(debouncedQuery);
  }, [debouncedQuery]);

  useHotkeys('alt+shift+1', e => {
    setActiveFilter(FilterType.All);
    e.preventDefault();
  }, { enableOnTags: ['INPUT'] });

  useHotkeys('alt+shift+2', e => {
    setActiveFilter(FilterType.StackOverflow);
    e.preventDefault();
  }, { enableOnTags: ['INPUT'] });

  useHotkeys('alt+shift+3', e => {
    setActiveFilter(FilterType.GitHubCode);
    e.preventDefault();
  }, { enableOnTags: ['INPUT'] });

  return (
    <Content>
      <SearchInput
        placeholder="Question or code"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        activeFilter={activeFilter}
        onFilterSelect={f => setActiveFilter(f)}
      />
    </Content>
  );
}

export default Home;

