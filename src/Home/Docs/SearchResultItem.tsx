import React from 'react';
import styled from 'styled-components';

import { DocResult } from 'search/docs';

const Container = styled.div<{ isFocused?: boolean }>`
  padding: 10px;
  background: ${props => props.isFocused ? '#3A41AF' : 'transparent'};
  font-size: 12px;
  font-weight: 400;
`;

interface SearchResultItemProps {
  // TODO: We probably don't need the whole DocResult object.
  // We need just a certain type of preview that user sees in
  // the search results list.
  docResult: DocResult;
  isFocused?: boolean;
}

function SearchResultItem({
  docResult,
  isFocused,
}: SearchResultItemProps) {
  return (
    <Container
      isFocused={isFocused}
    >
      {docResult.record.name}
    </Container>
  );
}

export default SearchResultItem;

