import axios from 'axios';

// TODO: These types are also present in the `devbook-server` repository - move them into a shared library.
interface StackOverflowComment {
  html: string;
}

interface StackOverflowQuestion {
  html: string;
  comments: StackOverflowComment[];
}

interface StackOverflowAnswer {
  html: string;
  comments: StackOverflowComment[];
}

export async function search(query: string) {
  const url = `https://api.getsidekick.app/search/stackoverflow`;
  const result = await axios.post(url, { query });

  return result.data as {
    question: StackOverflowQuestion,
    answers: StackOverflowAnswer[],
  };
}

