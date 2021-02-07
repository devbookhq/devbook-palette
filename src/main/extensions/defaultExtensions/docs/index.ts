import axios from 'axios';
import {
  ExtensionExports,
  Call,
  Source,
} from '@devbookhq/extension';

export const search: ExtensionExports[Call.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query: data.query, filter: data.sources && data.sources.length > 0 ? data.sources.map(ds => ds.slug) : undefined });
  return result.data.results;
}

export const getSources: ExtensionExports[Call.GetSources] = async () => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.get(url);
  return result.data.docs.map((ds: Source) => ({ ...ds, isIncludedInSearch: true }));
}
