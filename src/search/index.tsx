import React from 'react';
import {
  useParams,
} from 'react-router-dom';

import StackOverflowSearch from './StackOverflowSearch';
import DocsSearch from './DocsSearch';

export enum SearchSource {
  Stack = 'Stack',
  Docs = 'Docs',
}

function Search() {
  const { searchSource } = useParams<{ searchSource: SearchSource }>();

  return (
    <>
      {searchSource === SearchSource.Stack &&
        <StackOverflowSearch/>
      }

      {searchSource === SearchSource.Docs &&
        <DocsSearch/>
      }
    </>
  );
}

export default Search;

