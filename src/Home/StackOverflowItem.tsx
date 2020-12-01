import React, {
  useEffect,
  useRef,
} from 'react';
import styled from 'styled-components';

import { StackOverflowResult } from 'search/stackoverflow';
import { openLink } from 'mainProcess';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding-bottom: 10px;
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

  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: #212122;
`;

const QuestionTitle = styled.a`
  color: #B0B1B2;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;

  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background: #2B2D2F;

  pre {
    overflow-y: auto;
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

  function handleQuestionTitleClick(e: any) {
    openLink(soResult.question.link);
    e.preventDefault();
  }

  useEffect(() => {
    if (isFocused) containerRef?.current?.scrollIntoView(false);
  }, [isFocused]);

  return (
    <Container
      ref={containerRef}
      isFocused={isFocused}
    >
      <Header>
        <QuestionTitle href={soResult.question.link} onClick={handleQuestionTitleClick}>
          {soResult.question.title}
        </QuestionTitle>
      </Header>

      <Content
        dangerouslySetInnerHTML={{ __html: soResult.question.html }}
      />
    </Container>
  );
}

export default StackOverflowItem;

