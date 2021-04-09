import styled from 'styled-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { DocSource } from 'services/search.service/docSource';
import { SearchSource } from 'services/search.service/searchSource';
import FilterItem from './FilterItem';
import { useRef } from 'react';
import { useSearchStore } from 'Search/search.store';
import { HotkeyAction, useUIStore } from 'ui/ui.store';

const Container = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  overflow: overlay;
`;

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function filterSourceFilters(query: string, sourcesFilters: DocSource[]) {
  return query
    ? sourcesFilters.filter(ds => ds.name.toLowerCase().match(new RegExp(escapeRegex(query.toLowerCase()))))
    : sourcesFilters;
}

interface FilterResultsProps {
  onCloseRequest: () => void;
}

function FilterResults({ onCloseRequest }: FilterResultsProps) {
  const uiStore = useUIStore();
  const searchStore = useSearchStore();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedDocRow = useRef<HTMLDivElement>(null);

  const availableFilters = useMemo(() => searchStore.filters[SearchSource.Docs].availableFilters, [
    searchStore.filters[SearchSource.Docs].availableFilters,
  ]);

  const filteredSourceFilters = useMemo(() => filterSourceFilters(uiStore.docsFilterModalQuery, availableFilters),
    [uiStore.docsFilterModalQuery, availableFilters]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [filteredSourceFilters]);

  const selectSourceFilter = useCallback((sourceFilter: DocSource) => {
    searchStore.setSelectedFilter(SearchSource.Docs, sourceFilter);
    onCloseRequest();
  }, [onCloseRequest]);

  const modalFilterUpHandler = useCallback(() => {
    setSelectedIdx(c => c > 0 ? c - 1 : c);
    selectedDocRow?.current?.scrollIntoView({ block: 'end' });
  }, [selectedDocRow]);

  const modalFilterDownHandler = useCallback(() => {
    setSelectedIdx(c => c < filteredSourceFilters.length - 1 ? c + 1 : c);
    selectedDocRow?.current?.scrollIntoView({ block: 'end' });
  }, [filteredSourceFilters, selectedDocRow]);

  const modalFilterSelectHandler = useCallback(() => {
    selectSourceFilter(filteredSourceFilters[selectedIdx]);
  }, [selectSourceFilter, selectedIdx, filteredSourceFilters]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsModalFilterUp, modalFilterUpHandler);
  }, [
    modalFilterUpHandler,
  ]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsModalFilterDown, modalFilterDownHandler);
  }, [
    modalFilterDownHandler,
  ]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsModalFilterSelect, modalFilterSelectHandler);
  }, [
    modalFilterSelectHandler,
  ]);

  return (
    <Container>
      {filteredSourceFilters.map((ds, i) =>
        <FilterItem
          itemRef={selectedIdx === i ? selectedDocRow : undefined}
          key={ds.slug}
          sourceFilter={ds}
          selectSource={selectSourceFilter}
          isSelected={selectedIdx === i}
        />
      )}
    </Container>
  );
}

export default observer(FilterResults);
