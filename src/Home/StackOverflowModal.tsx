import React from 'react';
import styled from 'styled-components';

import { openLink } from 'mainProcess';
import { StackOverflowResult } from 'search/stackOverflow';
import Modal from 'components/Modal';

const marginTop = 60;

const StyledModal = styled(Modal)`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;

  overflow-y: auto;
  background: #212122;
  border-radius: 20px 20px 0 0;
`;

const Body = styled.div`
  hr {
    border: none;
    height: 1px;
    background-color: #535557;
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

    background: #404244;
    border-radius: 3px;
  }

  /* Code block */
  pre {
    padding: 10px;
    overflow-y: auto;

    background: #404244;
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

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  border-bottom: 1px solid #535557;
  border-radius: 20px 20px 0 0;
  background: #212122;
`;

const QuestionTitle = styled.a`
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
`;

const QuestionMetadata = styled.div`
  margin-top: 10px;
  display: flex;
`;

const QuestionVotes = styled.span`
  margin-right: 15px;

  color: #AAABAC;
  font-family: 'Roboto Mono';
  font-size: 14px;
  font-weight: 500;
`;

const QuestionDate = styled.span`
  color: #AAABAC;
  font-family: 'Roboto Mono';
  font-size: 14px;
  font-weight: 500;
`;

const QuestionBody = styled(Body)`
  padding: 10px;
`;

const Answers = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: #2B2D2F;
`;

const AnswerBody = styled(Body)`
  border-bottom: 1px solid #404244;
`;

interface StackOverflowModalProps {
  soResult: StackOverflowResult;
  onCloseRequest: () => void;
}

function StackOverflowModal({
  soResult,
  onCloseRequest,
}: StackOverflowModalProps) {

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
        {soResult.answers.map((a, idx) => (
          <AnswerBody
            key={idx}
            dangerouslySetInnerHTML={{
              __html: a.html,
            }}
          />
        ))}
      </Answers>
    </StyledModal>
  );
}

export default StackOverflowModal;

