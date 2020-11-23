import axios from 'axios';

const apiKey = 'AIzaSyBBVqZNSKc17L_BcNwhofYJKsUkTZ1MgaI';

const stackoverflowSearchEngineID = 'a5f3989768bc8efd1';
const githubSearchEngineID = '5f40f3bca1a670a26';

export interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  formattedUrl: string;
}

async function searchSite(query: string, searchEngineID: string, apiKey: string): Promise<SearchResult[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineID}&q=${query}`;
  const result = await axios.get(url);

  console.log(result.statusText);
  return result.data.items || [];
}

export async function search(error: string) {
  const query = encodeURI(error);

  console.log('query', query);

  const githubResults = await searchSite(query, githubSearchEngineID, apiKey);
  const stackoverflowResults = await searchSite(query, stackoverflowSearchEngineID, apiKey);

  return {
    githubResults: githubResults.slice(5),
    stackoverflowResults: stackoverflowResults.slice(5),
  }
}
