import axios from 'axios';
import {
  ExtensionExports,
  Call,
} from '@devbookhq/extension';

export const search: ExtensionExports[Call.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/stackoverflow';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/stackoverflow';

  const result = await axios.post(url, { query: data.query });
  return { results: result.data.results };
}
