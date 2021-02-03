import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import { openLink } from 'mainCommunication';
import useOnClickOutside from 'hooks/useOnClickOutside';
import {
  StackOverflowResult,
  StackOverflowAnswer,
  AnswerType,
} from './StackOverflowItem';
import Modal from 'components/Modal';

import StackOverflowBody from './StackOverflowBody';

const marginTop = 110;

const StyledModal = styled(Modal)`
  position: relative;
  bottom: 50px;
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;
  padding: 10px;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
  background: #1C1B26;
  border-radius: 5px 5px 0 0;
`;

const Question = styled.div`
  width: 100%;
  margin-bottom: 30px;

  display: flex;
  flex-direction: column;

  border-radius: 5px;
  border: 1px solid #3A41AF;
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  justify-content: space-between;

  border-radius: 5px 5px 0 0;
  background: #3A41AF;
`;

const QuestionTitle = styled.a`
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
`;

const QuestionMetadata = styled.div`
  display: flex;
  align-items: center;
`;

const QuestionVotes = styled.span`
  margin-right: 15px;

  color: #9CACC5;
  font-size: 14px;
  font-weight: 500;
`;

const QuestionDate = styled.span`
  color: #9CACC5;
  font-size: 14px;
  font-weight: 500;
`;

const QuestionBody = styled(StackOverflowBody)`
  padding: 0 10px;
`;

const Answers = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Answer = styled.div`
  width: 100%;
  height: 100%;
  margin-bottom: 20px;

  display: flex;
  flex-direction: column;

  border-radius: 5px;
  border: 1px solid #262736;
`;

const AnswerMetadata = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  align-items: center;

  border-radius: 5px 5px 0 0;
  background: #262736;
`;

const AnswerTag = styled.span`
  margin-right: 10px;
  padding: 5px 10px;

  color: #43D1A3;
  font-size: 14px;
  font-weight: 600;

  border-radius: 20px;
  background: rgba(67, 209, 163, 0.1);
`;

const AnswerVotes = styled.span`
  margin-right: 10px;
  padding: 5px 10px;

  color: #4395D1;
  font-size: 14px;
  font-weight: 600;

  border-radius: 20px;
  background: rgba(67, 149, 209, 0.1);
`;

const AnswerDate = styled.span`
  color: #9CACC5;
  font-size: 14px;
  font-weight: 500;
`;

const AnswerBody = styled(StackOverflowBody)`
  padding: 0 10px;
`;

const AnswersHeading = styled.span`
  margin-bottom: 10px;

  color: #fff;
  font-weight: 600;
  font-size: 17px;
`;

interface StackOverflowModalProps {
  soResult: StackOverflowResult;
  onCloseRequest: () => void;
}

function StackOverflowModal({
  soResult,
  onCloseRequest,
}: StackOverflowModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [sortedAnswers, setSortedAnswers] = useState<StackOverflowAnswer[]>([]);
  const [mostUpvotedIdx, setMostUpvotedIdx] = useState(-1);
  useOnClickOutside(modalRef, onCloseRequest);

  function handleQuestionTitleClick(e: any) {
    openLink(soResult.question.link);
    e.preventDefault();
  }

  function getDateString(timestamp: number) {
    const date = new Date(timestamp).toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const [dayMonth, year, time] = date.split(', ');
    return `${dayMonth} '${year} at ${time}`;
  }

  // We focus the modal so user can use arrows for scrolling.
  useEffect(() => {
    if (soResult.answers.length === 0) return;
    modalRef?.current?.focus();
  }, [soResult.answers]);

  useEffect(() => {
    const acceptedIdx = soResult.answers.findIndex(a => a.isAccepted);

    // Place the accepted answer at the start but only if it isn't already at the start.
    if (acceptedIdx !== -1
      && soResult.answers.length >= 2
      && soResult.answers[acceptedIdx].votes < soResult.answers[0].votes
    ) {
      const answers = [
        soResult.answers[acceptedIdx],
        ...soResult.answers.slice(0, acceptedIdx),
        ...soResult.answers.slice(acceptedIdx + 1)
      ];
      setMostUpvotedIdx(1);
      setSortedAnswers(answers);
    } else {
      setMostUpvotedIdx(0);
      setSortedAnswers(soResult.answers);
    }
  }, [soResult.answers]);

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
      ref={modalRef}
      tabIndex={0}
    >
      <Question>
        <Header>
          <QuestionTitle
            href={soResult.question.link}
            onClick={handleQuestionTitleClick}
            dangerouslySetInnerHTML={{
              __html: soResult.question.title,
            }}
          />
          <QuestionMetadata>
            <QuestionVotes>{soResult.question.votes} Upvotes</QuestionVotes>
            <QuestionDate>{getDateString(soResult.question.timestamp * 1000)}</QuestionDate>
          </QuestionMetadata>
        </Header>

        <QuestionBody
          html={soResult.question.html}
        />
      </Question>

      <AnswersHeading>Answers</AnswersHeading>
      <Answers>
        {sortedAnswers.map((a, idx) => (
          <Answer
            key={idx}
          >
            <AnswerMetadata>
              {a.isAccepted &&
                <AnswerTag>{AnswerType.Accepted}</AnswerTag>
              }
              {mostUpvotedIdx === idx &&
                <AnswerTag>{AnswerType.MostUpvoted}</AnswerTag>
              }
              <AnswerVotes>{a.votes} {a.votes === 1 || a.votes === -1 ? 'Upvote' : 'Upvotes'}</AnswerVotes>
              <AnswerDate>{getDateString(a.timestamp * 1000)}</AnswerDate>
            </AnswerMetadata>

            <AnswerBody
              // tabIndex={0}
              html={a.html}
            />
          </Answer>
        ))}
      </Answers>
    </StyledModal>
  );
}
export default StackOverflowModal;
