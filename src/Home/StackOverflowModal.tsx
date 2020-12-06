import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import { openLink } from 'mainProcess';
import {
  StackOverflowResult,
  StackOverflowAnswer,
  AnswerType,
} from 'search/stackOverflow';
import Modal from 'components/Modal';

const marginTop = 60;

const StyledModal = styled(Modal)`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;
  padding: 10px;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
  background: #1C1B26;
  border-radius: 20px 20px 0 0;
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  justify-content: space-between;

  border-radius: 5px;
  background: #262736;
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

const Body = styled.div`
  hr {
    border: none;
    height: 1px;
    background-color: #535557;
    height: 0;
  }

  p {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
  }

  code {
    padding: 2px 4px;

    color: #D9D9DA;
    font-family: 'Roboto Mono';
    font-size: 14px;
    font-weight: 500;

    background: #23222D;
    border-radius: 3px;
  }

  /* Code block */
  pre {
    padding: 10px;
    overflow-y: auto;

    background: #23222D;
    border-radius: 3px;

    code {
      padding: 0;
      background: transparent;
      line-height: 18px;
    }
  }

  h1 {
    font-size: 15px;
  }

  h2 {
    font-size: 14px;
    font-weight: 600;
  }

  h3 {
    font-size: 14px;
  }
`;

const QuestionBody = styled(Body)``;

const Answers = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Answer = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 10px;

  display: flex;
  flex-direction: column;
`;

const AnswerMetadata = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
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

const AnswerBody = styled(Body)``;

interface StackOverflowModalProps {
  soResult: StackOverflowResult;
  onCloseRequest: () => void;
}

function StackOverflowModal({
  soResult,
  onCloseRequest,
}: StackOverflowModalProps) {
  const [sortedAnswers, setSortedAnswers] = useState<StackOverflowAnswer[]>([]);
  const [answerType, setAnswerType] = useState<AnswerType | undefined>();
  const [mostUpvotedIdx, setMostUpvotedIdx] = useState(-1);

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

  useEffect(() => {
    const acceptedIdx = soResult.answers.findIndex(a => a.isAccepted);

    // Place the accepted answer at the start but only if it isn't alread at the start.
    if (acceptedIdx !== -1
        && soResult.answers.length >= 2
        && soResult.answers[acceptedIdx].votes < soResult.answers[0].votes
    ) {
      const answers = [
        soResult.answers[acceptedIdx],
        ...soResult.answers.slice(0, acceptedIdx),
        ...soResult.answers.slice(acceptedIdx+1)
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
    >
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
        dangerouslySetInnerHTML={{
          __html: soResult.question.html,
        }}
      />

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
              <AnswerVotes>{a.votes} Upvotes</AnswerVotes>
              <AnswerDate>{getDateString(a.timestamp * 1000)}</AnswerDate>
            </AnswerMetadata>

            <AnswerBody
              dangerouslySetInnerHTML={{
                __html: a.html,
              }}
            />
          </Answer>
        ))}
      </Answers>
    </StyledModal>
  );
}

export default StackOverflowModal;
