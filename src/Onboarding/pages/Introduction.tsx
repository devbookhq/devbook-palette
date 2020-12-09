import React from 'react';
import styled from 'styled-components';
import devbookPreviewImg from 'img/devbook-preview.png';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const Titles = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.span`
  color: white;
  font-size: 22px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  margin-top: 5px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const Explanation = styled.span`
  margin-top: 10px;
  color: white;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
`;

const DevbookImg = styled.img`
  margin-top: 20px;
  height: auto;
  max-width: 1000px;
  width: 100%;
`;

function IntroductionPage() {
  return (
    <Container>
      <Titles>
        <Title>Search engine for developers</Title>
        <Explanation>
          Single place to search in StackOverflow and GitHub code.
        </Explanation>
      </Titles>

      <DevbookImg src={devbookPreviewImg} />
    </Container>
  );
}

export default IntroductionPage;
