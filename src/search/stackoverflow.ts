import axios from 'axios';

// TODO: Don't expose API_KEY in the app.
const API_KEY = 'AIzaSyBBVqZNSKc17L_BcNwhofYJKsUkTZ1MgaI';
const STACKOVERFLOW_SEARCH_ENGINE_ID = 'a5f3989768bc8efd1';

export interface SearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  formattedUrl: string;
}

async function searchSite(query: string, searchEngineID: string, apiKey: string): Promise<SearchResult[]> {
  const encodedQuery = encodeURI(query);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineID}&q=${encodedQuery}`;
  const result = await axios.get(url);
  return result.data.items || [];
}

export async function search(query: string) {
  const results = await searchSite(query, STACKOVERFLOW_SEARCH_ENGINE_ID, API_KEY);
  return results;
}
