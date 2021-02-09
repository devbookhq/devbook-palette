import axios from 'axios';
import { ExtensionEventHandlers } from '@devbookhq/extension';

const extensionEventHandlers: ExtensionEventHandlers = {
  onDidQueryChange: async (data) => {
    let url = 'https://api.usedevbook.com/search/stackoverflow';
    if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/stackoverflow';

    const result = await axios.post(url, { query: data.query });
    return { results: result.data.results };
  },
}

export default extensionEventHandlers;
