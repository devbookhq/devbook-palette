import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

import {
  StackOverflowResult,
  StackOverflowAnswer,
  AnswerType,
} from 'search/stackOverflow';
import { openLink } from 'mainProcess';

import StackOverflowBody from './StackOverflowBody';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  margin-bottom: 30px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#3A41AF' : '#262736'};
`;

const Header = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  justify-content: space-between;

  border-radius: 5px 5px 0 0;
  background: ${props => props.isFocused ? '#3A41AF' : '#262736'};
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

const Answer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 10px;
  margin-top: 10px;

  display: flex;
  flex-direction: column;
`;

const AnswerMetadata = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const AnswerTypeTag = styled.span`
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

interface StackOverflowItemProps {
  soResult: StackOverflowResult;
  isFocused?: boolean;
}

function StackOverflowItem({
  soResult,
  isFocused,
}: StackOverflowItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAnswer, setActiveAnswer] = useState<StackOverflowAnswer | undefined>();
  const [answerTypes, setAnswerTypes] = useState<AnswerType[]>([]);

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
    const accepted = soResult.answers.filter(a => a.isAccepted === true);
    const mostUpvoted = soResult.answers.reduce((acc, val) => {
      if (!acc) {
        return val;
      }
      return val.votes > acc.votes ? val : acc;
    }, undefined as StackOverflowAnswer | undefined);

    if (accepted.length > 0) {
      const isMostUpvoted = mostUpvoted === accepted[0];
      setActiveAnswer(accepted[0]);
      setAnswerTypes(isMostUpvoted ? [AnswerType.Accepted, AnswerType.MostUpvoted] : [AnswerType.Accepted]);
    } else if (soResult.answers.length > 0) {
      setActiveAnswer(mostUpvoted);
      setAnswerTypes([AnswerType.MostUpvoted]);
    }
  }, [soResult]);

  useEffect(() => {
    if (isFocused) containerRef?.current?.scrollIntoView();
  }, [isFocused]);

  return (
    <Container
      ref={containerRef}
      isFocused={isFocused}
    >
      <Header
        isFocused={isFocused}
      >
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

      {activeAnswer &&
        <Answer>
          <AnswerMetadata>
            {answerTypes.map(t => (
              <AnswerTypeTag key={t}>{t}</AnswerTypeTag>
            ))}
            <AnswerVotes>{activeAnswer.votes} Upvotes</AnswerVotes>
            <AnswerDate>{getDateString(activeAnswer.timestamp * 1000)}</AnswerDate>
          </AnswerMetadata>

          <StackOverflowBody
            dangerouslySetInnerHTML={{
              __html: activeAnswer.html
            }}
          />
        </Answer>
      }
    </Container>
  );
}

export default StackOverflowItem;
