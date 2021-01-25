import axios from 'axios';

import { isDev } from 'mainCommunication';

export enum AnswerType {
  Accepted = 'Accepted answer',
  MostUpvoted = 'Most upvoted answer',
}

interface StackOverflowQuestion {
  link: string;
  title: string;
  html: string;
  timestamp: number;
  votes: number;
}

export interface StackOverflowAnswer {
  html: string;
  votes: number;
  isAccepted: boolean;
  timestamp: number;
}

export interface StackOverflowResult {
  question: StackOverflowQuestion;
  answers: StackOverflowAnswer[];
}

export async function search(query: string): Promise<StackOverflowResult[]> {
  let url = 'https://api.usedevbook.com/search/stackoverflow';
  if (isDev) url = 'https://dev.usedevbook.com/search/stackoverflow';

  const result = await axios.post(url, { query });
  return result.data.results;
}
