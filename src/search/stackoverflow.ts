import axios from 'axios';

// TODO: These types are also present in the `devbook-server` repository - move them into a shared library.

export interface StackOverflowComment {
  html: string;
}

export interface StackOverflowQuestion {
  link: string;
  title: string;
  html: string;
  timestamp: Date;
  votes: number;
  comments: StackOverflowComment[];
}

export interface StackOverflowAnswer {
  html: string;
  votes: number;
  isAccepted: boolean;
  timestamp: Date;
  comments: StackOverflowComment[];
}

export interface StackOverflowResult {
  question: StackOverflowQuestion;
  answers: StackOverflowAnswer[];
}

export async function search(query: string) {
  // const url = `https://api.getsidekick.app/search/stackoverflow`;
  const url = 'http://localhost:3002/search/stackoverflow';
  const result = await axios.post(url, { query });

  return result.data.results as StackOverflowResult[];
}

