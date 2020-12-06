import axios from 'axios';

export enum AnswerType {
  Accepted = 'Accepted answer',
  MostUpvoted = 'Most upvoted answer',
}
// TODO: These types are also present in the `devbook-server` repository - move them into a shared library.
export interface StackOverflowComment {
  html: string;
}

export interface StackOverflowQuestion {
  link: string;
  title: string;
  html: string;
  timestamp: number;
  votes: number;
  // comments: StackOverflowComment[];
}

export interface StackOverflowAnswer {
  html: string;
  votes: number;
  isAccepted: boolean;
  timestamp: number;
  // comments: StackOverflowComment[];
}

export interface StackOverflowResult {
  question: StackOverflowQuestion;
  answers: StackOverflowAnswer[];
}

export async function search(query: string): Promise<StackOverflowResult[]> {
  const url = `https://api.getsidekick.app/search/stackoverflow`;
  //const url = 'http://localhost:3002/search/stackoverflow';

  const result = await axios.post(url, { query });

  return result.data.results;
}
