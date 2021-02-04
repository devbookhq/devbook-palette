import axios from 'axios';

// These imports are only types for easier development,
// they will be distributed in a separate module.
import { ModuleExportsType } from '../../extensionProcess/extensionModuleHandler';
import { ExtensionRequestType } from '../../message';

export const search: ModuleExportsType[ExtensionRequestType.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/stackoverflow';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/stackoverflow';

  const result = await axios.post(url, { query: data.query });
  return { results: result.data.results };
}
