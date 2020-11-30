import axios from 'axios';

// TODO: These types are also present in the `devbook-server` repository - move them into a shared library.
interface StackOverflowComment {
  html: string;
}

interface StackOverflowQuestion {
  link: string;
  title: string;
  html: string;
  timestamp: number;
  votes: number;
  comments: StackOverflowComment[];
}

interface StackOverflowAnswer {
  html: string;
  votes: number;
  isAccepted: boolean;
  timestamp: number;
  comments: StackOverflowComment[];
}

export interface StackOverflowResult {
  question: StackOverflowQuestion;
  answers: StackOverflowAnswer[];
}

export async function search(query: string): Promise<StackOverflowResult[]> {
  const url = `https://api.getsidekick.app/search/stackoverflow`;
  const result = await axios.post(url, { query });

  return result.data.results;
}
