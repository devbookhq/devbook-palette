import React, { useEffect } from 'react';
import styled from 'styled-components';

import { StackOverflowResult } from 'search/stackOverflow';
import { openLink } from 'mainProcess';

const hotkeysWidth = 150;
const hotkeysMarginRight = 10;
const headerPadding = 10;

const Container = styled.div`
  width: 100%;
  padding-bottom: 10px;
  display: flex;
`;

const Hotkeys = styled.div`
  /*
  width: ${hotkeysWidth}px;
  max-width: ${hotkeysWidth}px;
  */
  // min-width: ${hotkeysWidth}px;
  flex: 1;

  margin-right: ${hotkeysMarginRight}px;
  // width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Hotkey = styled.div`
  padding: 5px;
  width: 100%;

  color: white;
  font-size: 13px;
  font-weight: 500;

  background: #2B2D2F;
  border-radius: 5px;

  :not(:last-child) {
    margin-bottom: 10px;
  }
`;

const Result = styled.div<{ width: number, isFocused?: boolean }>`
  width: ${props => props.width > 0 ? props.width + 'px' : '100%'};
  /*
  min-width: ${props => props.width > 0 ? props.width + 'px' : '100%'};
  */
  max-width: ${props => props.width > 0 ? props.width + 'px' : '100%'};
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#5d9bd4' : '#404244'};
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: ${headerPadding}px;

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
  parentWidth: number;
}

function StackOverflowItem({
  soResult,
  parentWidth,
}: StackOverflowItemProps) {

  useEffect(() => {
    console.log('parentWidth', parentWidth);
  }, [parentWidth]);

  function handleQuestionTitleClick(e: any) {
    openLink(soResult.question.link);
    e.preventDefault();
  }

  return (
    <Container>
      {/*
      <Hotkeys>
        <Hotkey>
          Open in browser
        </Hotkey>
        <Hotkey>
          Copy code snippet
        </Hotkey>
      </Hotkeys>
      */}

      <Result
        // width={(parentWidth - hotkeysWidth - hotkeysMarginRight) - headerPadding * 2}
        // width={parentWidth - headerPadding * 2}
        width={0}
      >
        <Header>
          <QuestionTitle href={soResult.question.link} onClick={handleQuestionTitleClick}>
            {soResult.question.title}
          </QuestionTitle>
        </Header>

        <Content
          dangerouslySetInnerHTML={{ __html: soResult.question.html }}
        />
      </Result>
    </Container>
  );
}

export default StackOverflowItem;

