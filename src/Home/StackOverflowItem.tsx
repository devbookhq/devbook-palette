import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

import { StackOverflowResult, StackOverflowAnswer } from 'search/stackoverflow';
import { openLink } from 'mainProcess';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#5d9bd4' : '#404244'};
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  border-bottom: 1px solid #535557;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: #212122;
`;

const QuestionTitle = styled.a`
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
`;

const QuestionMetadata = styled.div`
  margin-top: 10px;
  display: flex;
`;

const QuestionVotes = styled.span`
  margin-right: 15px;

  color: #AAABAC;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 500;
`;

const QuestionDate = styled.span`
  color: #AAABAC;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 500;
`;

const Answer = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;

  display: flex;
  flex-direction: column;

  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background: #2B2D2F;
`;

const AnswerMetadata = styled.div`
  width: 100%;
  display: flex;
`;

const AnswerVotes = styled.span`
  margin-right: 15px;

  color: #38EE97;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 500;
`;

const AnswerDate = styled.span`
  color: #AAABAC;
  font-family: 'Source Code Pro';
  font-size: 14px;
  font-weight: 500;
`;

const AnswerContent = styled.div`
  hr {
    border: none;
    height: 1px;
    background-color: #535557;
  }

  p {
    font-size: 14px;
    font-color: #D5D5D5;
  }

  code {
    padding: 2px 4px;

    font-size: 14px;
    background: #404244;
    border-radius: 3px;
  }

  pre {
    padding: 10px;
    overflow-y: auto;

    background: #404244;
    border-radius: 3px;

    code {
      padding: none;
      background: transparent;
    }
  }
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
    if (accepted.length > 0) {
      setActiveAnswer(accepted[0])
    } else if (soResult.answers.length > 0) {
      const mostUpvoted = soResult.answers.reduce((acc, val) => val.votes > acc.votes ? val : acc);
      setActiveAnswer(mostUpvoted);
    }
  }, [soResult]);

  useEffect(() => {
    if (isFocused) containerRef?.current?.scrollIntoView(false);
  }, [isFocused]);

  return (
    <Container
      ref={containerRef}
      isFocused={isFocused}
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

      {activeAnswer &&
        <Answer>
          <AnswerMetadata>
            <AnswerVotes>{activeAnswer.votes} Upvotes</AnswerVotes>
            <AnswerDate>{getDateString(activeAnswer.timestamp * 1000)}</AnswerDate>
          </AnswerMetadata>

          {/* TODO: Use prism for code snippets? */}
          <AnswerContent
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

