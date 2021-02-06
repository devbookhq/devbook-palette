import axios from 'axios';

import {
  ModuleExports,
  Input,
  Source,
} from '@devbookhq/extension';

export const search: ModuleExports[Input.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query: data.query, filter: data.sources && data.sources.length > 0 ? data.sources.map(ds => ds.slug) : undefined });
  return result.data.results;
}

export const getSources: ModuleExports[Input.GetSources] = async () => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.get(url);
  return result.data.docs.map((ds: Source) => ({ ...ds, isIncludedInSearch: true }));
}
