import axios from 'axios';

// These imports are only types for easier development,
// they will be distributed in a separate module.
import { ModuleExportsType } from '../../extensionProcess/extensionModuleHandler';
import { ExtensionRequestType, Source } from '../../message';

export const search: ModuleExportsType[ExtensionRequestType.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.post(url, { query: data.query, filter: data.sources && data.sources.length > 0 ? data.sources.map(ds => ds.slug) : undefined });
  return result.data.results;
}

export const getSources: ModuleExportsType[ExtensionRequestType.GetSources] = async () => {
  let url = 'https://api.usedevbook.com/search/docs';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/docs';

  const result = await axios.get(url);
  return result.data.docs.map((ds: Source) => ({ ...ds, isIncludedInSearch: true }));
}
