import { ModuleExportsType } from '../../extensionProcess/extensionModuleHandler';
import { ExtensionRequestType } from '../../message';

import axios from 'axios';

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

export const search: ModuleExportsType[ExtensionRequestType.Search] = async (data) => {
  let url = 'https://api.usedevbook.com/search/stackoverflow';
  if (process.env.NODE_ENV === 'development') url = 'https://dev.usedevbook.com/search/stackoverflow';

  const result = await axios.post(url, { query: data.query });
  return { results: result.data.results };
}
