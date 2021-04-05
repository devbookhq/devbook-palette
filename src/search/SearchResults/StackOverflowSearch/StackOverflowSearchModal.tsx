import { StackOverflowResult } from 'services/search.service';

interface StackOverflowSearchModalProps {
  result: StackOverflowResult;
}

function StackOverflowSearchModal({ result }: StackOverflowSearchModalProps) {
  return (
    <>
      Stack Overflow Modal
      {result.question.title}
    </>
  );
}

export default StackOverflowSearchModal;
